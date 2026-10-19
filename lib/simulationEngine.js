// ENGINE SIMULASI 24 JAM, STATE MACHINE, NEEDS SYSTEM & VARIASI ALAMI
import npcConfig from "@/lib/npcData.json";
import { findPath } from "@/lib/pathfinding";
import { RuleBasedDialogueProvider } from "@/lib/dialogueEngine";
import { ENABLE_BEHAVIOR } from "@/lib/behavior/behaviorConstants";
import { behaviorEngine } from "@/lib/behavior/behaviorEngine";

const dialogueProvider = new RuleBasedDialogueProvider(npcConfig.npcs);

// Helper konversi jam "HH:MM" ke menit dalam sehari (0 - 1439)
export function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes) {
  const totalMin = Math.floor(((minutes % 1440) + 1440) % 1440);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Menghasilkan seed angka acak stabil berdasarkan tanggal hari ini
function getDailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Kelas Pengelola Simulasi 24 Jam untuk Seluruh Karyawan
 */
export class OfficeSimulationEngine {
  constructor(options = {}) {
    this.officeSettings = npcConfig.officeSettings;
    this.npcsDef = npcConfig.npcs;
    this.speedMultiplier = options.speedMultiplier || 1.0;
    this.isAccelerated = options.isAccelerated || false;

    // Sinkronisasi waktu simulasi:
    // Cek apakah ada waktu tersimpan di localStorage (dari mode percepat sebelumnya)
    let initialMinutes = null;
    let savedAcc = false;
    if (typeof window !== "undefined") {
      try {
        const storedSimTime = localStorage.getItem("ekalaya_sim_minutes");
        const storedAcc = localStorage.getItem("ekalaya_sim_accelerated");
        if (storedAcc === "true") {
          savedAcc = true;
          this.isAccelerated = true;
        }
        if (storedSimTime !== null && !isNaN(parseFloat(storedSimTime))) {
          initialMinutes = parseFloat(storedSimTime);
        }
      } catch (e) {
        // Abaikan jika localStorage tidak diizinkan
      }
    }

    const now = new Date();
    if (initialMinutes === null) {
      // Ambil waktu nyata saat ini (Realtime saat baru pertama dibuka)
      this.simulatedMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    } else {
      // Gunakan waktu simulasi yang tersimpan sebelum reload
      this.simulatedMinutes = (initialMinutes + 1440) % 1440;
    }

    this.currentDaySeed = getDailySeed(now);

    // Dialog & Bubble Chat Queue
    this.activeBubbles = new Map(); // npcId -> { text, timer }
    this.conversationCooldown = new Map(); // pairKey -> timestamp

    // Inisialisasi NPC State Instances
    this.npcStates = new Map();
    this.initNPCs();
  }

  initNPCs() {
    this.npcsDef.forEach((def, index) => {
      // Hitung variasi jitter harian per NPC (0 s/d 15 menit)
      const npcSeed = this.currentDaySeed + index * 137;
      const jitterMinutes = Math.floor(seededRandom(npcSeed) * 16) - 5; // -5 s/d +10 menit

      // Jadwal harian yang sudah diberi variasi jitter
      const activeSchedule = def.schedule.map((item, i) => {
        const baseMin = timeStringToMinutes(item.time);
        const variedMin = Math.max(0, Math.min(1439, baseMin + jitterMinutes));
        return {
          ...item,
          variedMinutes: variedMin,
          baseMinutes: baseMin,
        };
      }).sort((a, b) => a.variedMinutes - b.variedMinutes);

      // Hitung status awal deterministik sesuai simulatedMinutes saat ini
      const initialActivity = this.getActivityForTime(def, activeSchedule, this.simulatedMinutes);

      const targetPos = this.resolveTargetPosition(def, initialActivity.target);

      // Status Needs awal (Energy 100, Hunger 0, Social 70)
      const needs = {
        energy: 100,
        hunger: 20,
        social: 60,
      };

      this.npcStates.set(def.id, {
        id: def.id,
        name: def.name,
        title: def.title,
        role: def.role,
        avatarColor: def.avatarColor,
        hatColor: def.hatColor,
        personality: def.personality,
        desk: def.desk,
        homePos: def.homePos,
        needs,
        currentState: initialActivity.state,
        currentStatusLabel: initialActivity.status,
        targetPos,
        currentPos: initialActivity.state === "leave" || initialActivity.state === "sleep" 
          ? { x: def.homePos.x, z: def.homePos.z } 
          : { x: targetPos.x, z: targetPos.z },
        rotation: targetPos.rot || 0,
        waypoints: [],
        waypointIndex: 0,
        action: this.mapStateToAction(initialActivity.state),
        activeSchedule,
        isInsideOffice: initialActivity.state !== "leave" && initialActivity.state !== "sleep",
        spontaneousTimer: Math.floor(seededRandom(npcSeed + 99) * 300) + 200,
      });
    });
  }

  getActivityForTime(def, activeSchedule, minutes) {
    // Cari kegiatan yang cocok untuk jam saat ini
    let current = null;
    for (let i = 0; i < activeSchedule.length; i++) {
      if (minutes >= activeSchedule[i].variedMinutes) {
        current = activeSchedule[i];
      } else {
        break;
      }
    }

    if (!current) {
      // Sebelum jam datang: status tidur / di rumah
      return { state: "sleep", target: "home", status: "Tidur di Rumah (Offline)" };
    }

    return current;
  }

  resolveTargetPosition(def, targetName) {
    if (targetName === "desk") {
      return { x: def.desk.x, z: def.desk.z, rot: def.desk.rot };
    }
    if (targetName === "pantry_coffee") {
      if (def.id === "npc-luna") {
        return { x: 8.5, z: 9.0, rot: 0 };
      }
      if (def.id === "npc-dimas") {
        return { x: 7.2, z: 9.0, rot: 3.14 };
      }
      const pm = this.officeSettings.pantry.coffeeMachine;
      return { x: pm.x, z: pm.z, rot: pm.rot };
    }
    if (targetName === "pantry_water") {
      if (def.id === "npc-sari") {
        return { x: 10.2, z: 9.0, rot: 3.14 };
      }
      const pw = this.officeSettings.pantry.waterDispenser;
      return { x: pw.x, z: pw.z, rot: pw.rot };
    }
    if (targetName === "pantry_sofa") {
      if (def.id === "npc-rina") {
        return { x: 8.5, z: 12.0, rot: 0 };
      }
      if (def.id === "npc-budi") {
        return { x: 10.5, z: 12.0, rot: 0 };
      }
      if (def.id === "npc-dimas") {
        return { x: 12.5, z: 10.2, rot: -1.57 };
      }
      if (def.id === "npc-sari") {
        return { x: 9.5, z: 9.6, rot: 3.14 };
      }
      if (def.id === "npc-luna") {
        return { x: 8.5, z: 9.0, rot: 0 };
      }
      const ps = def.id === "npc-rina" || def.id === "npc-budi" 
        ? this.officeSettings.pantry.sofaMain 
        : this.officeSettings.pantry.sofaCorner;
      return { x: ps.x, z: ps.z, rot: ps.rot };
    }
    if (targetName === "meeting") {
      const chair = this.officeSettings.meetingChairs.find((c) => c.id === def.meetingSeatId) 
        || this.officeSettings.meetingChairs[0];
      return { x: chair.x, z: chair.z, rot: chair.rot };
    }
    if (targetName === "exit") {
      return { x: this.officeSettings.exitDoor.x, z: this.officeSettings.exitDoor.z, rot: this.officeSettings.exitDoor.rot };
    }
    if (targetName === "home") {
      return { x: def.homePos.x, z: def.homePos.z, rot: 0 };
    }
    return { x: def.desk.x, z: def.desk.z, rot: def.desk.rot };
  }

  mapStateToAction(state) {
    switch (state) {
      case "work":
        return "typing";
      case "meeting":
        return "sitting";
      case "eat":
      case "relax":
        return "sitting";
      case "coffee":
        return "idle";
      case "arrive":
        return "waving";
      case "leave":
      case "sleep":
        return "idle";
      default:
        return "idle";
    }
  }

  // Update loop simulasi per detik/frame
  update(deltaSeconds, onSystemMessage, onChatMessage) {
    // Kemajuan waktu simulasi
    // 1 detik dunia nyata = 1 detik waktu nyata (jika mode realtime)
    // Jika mode dipercepat (1 hari = 10 menit):
    // 1440 menit / (10 * 60 detik) = 2.4 menit simulasi per detik nyata
    const simMinutesDelta = this.isAccelerated
      ? deltaSeconds * 2.4
      : (deltaSeconds / 60) * this.speedMultiplier;

    this.simulatedMinutes = (this.simulatedMinutes + simMinutesDelta) % 1440;

    // Simpan progres waktu simulasi ke localStorage setiap beberapa detik agar persisten jika direload
    this.saveTimer = (this.saveTimer || 0) + deltaSeconds;
    if (this.saveTimer > 2.0 && typeof window !== "undefined") {
      this.saveTimer = 0;
      try {
        localStorage.setItem("ekalaya_sim_minutes", this.simulatedMinutes.toString());
      } catch (e) {}
    }

    // Evaluasi status tiap NPC
    this.npcStates.forEach((npc) => {
      // 1. Update Needs secara bertahap seiring berjalannya waktu
      npc.needs.hunger = Math.min(100, npc.needs.hunger + simMinutesDelta * 0.08); // Lapar naik perlahan
      if (npc.currentState === "work") {
        npc.needs.energy = Math.max(0, npc.needs.energy - simMinutesDelta * 0.06); // Energi berkurang saat kerja
      } else if (npc.currentState === "coffee" || npc.currentState === "relax") {
        npc.needs.energy = Math.min(100, npc.needs.energy + simMinutesDelta * 0.35); // Pulih saat rehat
        npc.needs.hunger = Math.max(0, npc.needs.hunger - simMinutesDelta * 0.3);
      } else if (npc.currentState === "eat") {
        npc.needs.hunger = Math.max(0, npc.needs.hunger - simMinutesDelta * 0.8);
        npc.needs.energy = Math.min(100, npc.needs.energy + simMinutesDelta * 0.2);
      } else if (npc.currentState === "sleep") {
        npc.needs.energy = Math.min(100, npc.needs.energy + simMinutesDelta * 0.5);
      }

      // 2. Evaluasi Perilaku NPC (Behavior Engine vs Schedule Lama)
      if (ENABLE_BEHAVIOR) {
        behaviorEngine.updateNpc(npc, deltaSeconds, this.simulatedMinutes, {
          allNpcs: this.npcStates,
          findPath,
          triggerBubble: (text) => this.triggerSpeechBubble(npc.id, text, onChatMessage),
          onSystemMessage,
          onChatMessage,
        });
      } else {
        // Logika Jadwal Utama Bawaan Asli 100% jika flag dimatikan
        const scheduledActivity = this.getActivityForTime(npc, npc.activeSchedule, this.simulatedMinutes);
        
        // Jika terjadi pergantian kegiatan sesuai jam
        if (scheduledActivity.state !== npc.currentState) {
          npc.currentState = scheduledActivity.state;
          npc.currentStatusLabel = scheduledActivity.status;
          npc.action = this.mapStateToAction(npc.currentState);

          const newTarget = this.resolveTargetPosition(npc, scheduledActivity.target);
          npc.targetPos = newTarget;

          if (scheduledActivity.state === "leave" || scheduledActivity.state === "sleep") {
            npc.isInsideOffice = false;
          } else {
            npc.isInsideOffice = true;
          }

          // Rencanakan pathfinding ke target baru
          npc.waypoints = findPath(npc.currentPos, newTarget);
          npc.waypointIndex = 0;

          if (onSystemMessage) {
            onSystemMessage(`⏰ [Jadwal ${npc.name}] Pukul ${minutesToTimeString(this.simulatedMinutes)}: ${scheduledActivity.status}`);
          }
        }

        // Kejadian Spontan / Needs Override Kecil Bawaan Asli
        npc.spontaneousTimer -= deltaSeconds;
        if (npc.spontaneousTimer <= 0 && npc.currentState === "work" && npc.waypoints.length === 0) {
          npc.spontaneousTimer = Math.floor(Math.random() * 90) + 60;
          if (npc.needs.energy < 30) {
            npc.action = "idle";
            const coffeeTarget = this.resolveTargetPosition(npc, "pantry_coffee");
            npc.waypoints = findPath(npc.currentPos, coffeeTarget);
            npc.waypointIndex = 0;
            this.triggerSpeechBubble(npc.id, "Bentar, butuh ngopi dulu biar gak ngantuk ☕", onChatMessage);
          } else {
            const emotes = ["waving", "cheer", "stretch"];
            const emo = emotes[Math.floor(Math.random() * emotes.length)];
            npc.action = emo;
            setTimeout(() => {
              if (npc.currentState === "work") npc.action = "typing";
            }, 3500);
          }
        }
      }
    });

    // 4. Deteksi Interaksi Obrolan Sosial (Jika 2 NPC berdekatan < 3.0 meter di Pantry atau Sofa)
    this.checkSocialInteractions(onChatMessage);

    // 5. Update Timer Speech Bubbles
    this.activeBubbles.forEach((bubble, npcId) => {
      bubble.timer -= deltaSeconds;
      if (bubble.timer <= 0) {
        this.activeBubbles.delete(npcId);
      }
    });
  }

  async checkSocialInteractions(onChatMessage) {
    const npcs = Array.from(this.npcStates.values()).filter((n) => n.isInsideOffice && n.waypoints.length === 0);
    const now = Date.now();

    for (let i = 0; i < npcs.length; i++) {
      for (let j = i + 1; j < npcs.length; j++) {
        const npcA = npcs[i];
        const npcB = npcs[j];

        const dist = Math.hypot(npcA.currentPos.x - npcB.currentPos.x, npcA.currentPos.z - npcB.currentPos.z);
        if (dist < 3.2) {
          const pairKey = [npcA.id, npcB.id].sort().join("-");
          const lastChat = this.conversationCooldown.get(pairKey) || 0;

          // Cooldown 25 detik antar obrolan sepasang karakter
          if (now - lastChat > 25000) {
            this.conversationCooldown.set(pairKey, now);

            // npc A bicara ke npc B
            const lineA = await dialogueProvider.generateDialogue({
              speaker: npcA,
              listener: npcB,
              location: npcA.currentPos.z > 1.5 ? "Pantry" : "Kantor",
            });

            this.triggerSpeechBubble(npcA.id, lineA, onChatMessage);

            // npc B membalas 2 detik kemudian
            setTimeout(async () => {
              const lineB = await dialogueProvider.generateDialogue({
                speaker: npcB,
                listener: npcA,
                location: npcB.currentPos.z > 1.5 ? "Pantry" : "Kantor",
              });
              this.triggerSpeechBubble(npcB.id, lineB, onChatMessage);
            }, 2200);

            // Reaksi sosial: saling menghadap dan melambai / senyum
            npcA.rotation = Math.atan2(npcB.currentPos.x - npcA.currentPos.x, npcB.currentPos.z - npcA.currentPos.z);
            npcB.rotation = Math.atan2(npcA.currentPos.x - npcB.currentPos.x, npcA.currentPos.z - npcB.currentPos.z);
            npcA.action = "waving";
            npcB.action = "cheer";
            setTimeout(() => {
              npcA.action = this.mapStateToAction(npcA.currentState);
              npcB.action = this.mapStateToAction(npcB.currentState);
            }, 3000);
          }
        }
      }
    }
  }

  triggerSpeechBubble(npcId, text, onChatMessage) {
    const npc = this.npcStates.get(npcId);
    if (!npc) return;

    this.activeBubbles.set(npcId, {
      text,
      timer: 5.5, // Tampil selama 5.5 detik di atas kepala
    });

    if (onChatMessage) {
      onChatMessage({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        sender: `${npc.name} (${npc.title})`,
        text,
        time: minutesToTimeString(this.simulatedMinutes),
        isOwner: false,
      });
    }
  }

  getBubbleForNpc(npcId) {
    return this.activeBubbles.get(npcId)?.text || null;
  }

  getBehaviorDebugInfo(npcId) {
    if (!ENABLE_BEHAVIOR) return null;
    return behaviorEngine.states.get(npcId)?.debugLabel || null;
  }
}
