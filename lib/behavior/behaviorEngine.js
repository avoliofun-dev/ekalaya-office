// BEHAVIOR ENGINE KANTOR EKALAYA
// Mengimplementasikan State Machine, Weighted Random Action, Profile Behaviors, dan Guest Interactions
import behaviorConfig from "./behaviorConfig.json";
import { ENABLE_BEHAVIOR, OFFICE_LANDMARKS, ACTION_ANIMATION_MAP } from "./behaviorConstants";

function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export class BehaviorEngine {
  constructor() {
    this.config = behaviorConfig;
    this.states = new Map(); // npcId -> State Data
    this.guestMeetingState = {
      isActive: false,
      hostId: "npc-luna",
      guestId: "npc-guest",
      stage: "idle", // "arriving", "greeting", "meeting", "departing", "done"
      timer: 0,
    };
  }

  // Inisialisasi atau ambil state perilaku NPC
  getNpcState(npc) {
    if (!this.states.has(npc.id)) {
      // Petakan ID NPC ke profil perilaku
      let profileId = "profile_joko";
      if (npc.id.includes("rina")) profileId = "profile_rina";
      else if (npc.id.includes("budi")) profileId = "profile_budi";
      else if (npc.id.includes("dimas")) profileId = "profile_dimas";
      else if (npc.id.includes("sari")) profileId = "profile_sari";
      else if (npc.id.includes("luna")) profileId = "profile_luna";
      else if (npc.id.includes("maya")) profileId = "profile_maya";
      else if (npc.id.includes("hendra")) profileId = "profile_hendra";
      else if (npc.id.includes("guest") || npc.id.includes("tirta")) profileId = "profile_guest";

      const profile = this.config.profiles[profileId] || this.config.profiles.profile_joko;

      // Variasi harian stabil +/- 15% pada bobot
      const variedWeights = {};
      const variationFactor = 0.85 + Math.random() * 0.3; // 0.85 - 1.15
      for (const [actKey, w] of Object.entries(profile.weights || {})) {
        variedWeights[actKey] = Math.max(1, Math.round(w * variationFactor));
      }

      this.states.set(npc.id, {
        profileId,
        profile,
        variedWeights,
        currentActivityKey: "kerja_fokus",
        activityTimer: 25, // Detik awal
        targetPosition: null,
        targetCoworkerId: null,
        debugLabel: "Inisialisasi",
      });
    }
    return this.states.get(npc.id);
  }

  // Pemilihan aktivitas acak berbobot (Weighted Random Selection)
  selectNextActivity(bState, simMinutes) {
    const weights = bState.variedWeights;
    const candidates = [];
    let totalWeight = 0;

    for (const [actKey, weight] of Object.entries(weights)) {
      if (weight > 0 && this.config.activities[actKey]) {
        candidates.push({ key: actKey, weight });
        totalWeight += weight;
      }
    }

    if (candidates.length === 0 || totalWeight === 0) {
      return "kerja_fokus";
    }

    let rnd = Math.random() * totalWeight;
    for (const cand of candidates) {
      if (rnd < cand.weight) {
        return cand.key;
      }
      rnd -= cand.weight;
    }

    return candidates[0].key;
  }

  // Update loop behavior per frame untuk seorang NPC
  updateNpc(npc, deltaSeconds, simMinutes, context) {
    if (!ENABLE_BEHAVIOR) return;

    const bState = this.getNpcState(npc);
    const { allNpcs, findPath, triggerBubble, onSystemMessage } = context;
    const profile = bState.profile;

    // 1. CEK JAM KEDATANGAN & KEPULANGAN KANTOR
    const arriveMin = timeStringToMinutes(profile.arriveTime || "08:00");
    const leaveMin = timeStringToMinutes(profile.leaveTime || "17:00");
    const isSpecialAi = npc.id === "npc-luna";

    // Di luar jam kerja (malam/pagi buta sebelum tiba)
    if (!isSpecialAi && (simMinutes < arriveMin || simMinutes >= leaveMin)) {
      if (npc.isInsideOffice) {
        // Proses pulang
        npc.isInsideOffice = false;
        bState.currentActivityKey = profile.postLeaveActivity || "langsung_pulang";
        const actDef = this.config.activities[bState.currentActivityKey];
        npc.currentStatusLabel = `${actDef.icon} ${actDef.name}`;
        npc.action = "idle";
        bState.debugLabel = `[Pulang] ${actDef.name}`;
        
        // Pindahkan ke pintu keluar
        const exitPos = OFFICE_LANDMARKS.entrance;
        npc.targetPos = exitPos;
        npc.waypoints = findPath(npc.currentPos, exitPos);
        npc.waypointIndex = 0;
      }
      return;
    }

    // Karakter masuk ke kantor jika sudah jam tiba
    if (!npc.isInsideOffice) {
      npc.isInsideOffice = true;
      npc.currentPos = { x: OFFICE_LANDMARKS.entrance.x, z: OFFICE_LANDMARKS.entrance.z };
      bState.currentActivityKey = "absen_pagi";
      bState.activityTimer = 10;
    }

    // 2. JAM ISTIRAHAT SERENTAK (12:00 - 13:00 MAKAN SIANG & 15:00 - 15:45 NGOPI SORE)
    const isLunchHour = simMinutes >= 720 && simMinutes < 780; // 12:00 - 13:00
    const isCoffeeHour = simMinutes >= 900 && simMinutes < 945; // 15:00 - 15:45

    if (isLunchHour) {
      if (bState.currentActivityKey !== "makan_siang") {
        this.startActivity(npc, bState, "makan_siang", context);
      }
      return;
    }

    if (isCoffeeHour) {
      if (bState.currentActivityKey !== "ngobrol_pantry" && bState.currentActivityKey !== "bikin_kopi_teh") {
        this.startActivity(npc, bState, "ngobrol_pantry", context);
      }
      return;
    }

    // 3. LOGIKA TAMU BISNIS EKSTERNAL (Pak Tirta)
    if (this.handleGuestInteraction(npc, bState, simMinutes, context)) {
      return;
    }

    // 4. PENGURANGAN TIMER AKTIVITAS SAAT INI
    bState.activityTimer -= deltaSeconds;
    bState.debugLabel = `[${bState.currentActivityKey}] ${Math.max(0, Math.round(bState.activityTimer))}s`;

    // 5. JIKA TIMER SELESAI -> PILIH AKTIVITAS BERIKUTNYA
    if (bState.activityTimer <= 0) {
      const nextKey = this.selectNextActivity(bState, simMinutes);
      this.startActivity(npc, bState, nextKey, context);
    }
  }

  // Menjalankan aktivitas baru
  startActivity(npc, bState, actKey, context) {
    const actDef = this.config.activities[actKey] || this.config.activities.kerja_fokus;
    bState.currentActivityKey = actKey;

    // Durasi diacak dalam rentang min - max (dikonversi dari detik nyata / simulasi)
    const minDur = actDef.duration.min || 20;
    const maxDur = actDef.duration.max || 60;
    bState.activityTimer = Math.floor(minDur + Math.random() * (maxDur - minDur));

    // Update Label & Animasi
    npc.currentStatusLabel = `${actDef.icon} ${actDef.name}`;
    npc.action = ACTION_ANIMATION_MAP[actKey] || "idle";
    bState.debugLabel = `[${actKey}] ${Math.round(bState.activityTimer)}s`;

    // Cari koordinat lokasi tujuan
    const targetCoords = this.resolveActivityTarget(npc, bState, actKey, actDef, context);
    if (targetCoords) {
      bState.targetPosition = targetCoords;
      npc.targetPos = targetCoords;

      if (context.findPath) {
        npc.waypoints = context.findPath(npc.currentPos, targetCoords);
        npc.waypointIndex = 0;
      }
    }

    // Pemicu dialog situasional untuk aksi tertentu
    this.triggerSituationalDialogue(npc, actKey, context);
  }

  // Menentukan target koordinat aktivitas
  resolveActivityTarget(npc, bState, actKey, actDef, context) {
    // 1. Target Meja Pribadi
    if (actDef.target === "desk") {
      return { x: npc.desk.x, z: npc.desk.z, rot: npc.desk.rot || 3.14 };
    }

    // 2. Target Mampir ke Meja Rekan Kerja ("ke_ruangan_teman" atau "bantu_teman")
    if (actDef.target === "coworker_desk") {
      const allNpcs = context.allNpcs;
      if (allNpcs) {
        const coworkers = Array.from(allNpcs.values()).filter((n) => n.id !== npc.id && n.isInsideOffice && !n.id.includes("guest"));
        if (coworkers.length > 0) {
          const chosen = coworkers[Math.floor(Math.random() * coworkers.length)];
          bState.targetCoworkerId = chosen.id;
          // Berdiri di depan meja rekan kerja
          return { x: chosen.desk.x, z: chosen.desk.z + 1.2, rot: 0 };
        }
      }
      return { x: npc.desk.x, z: npc.desk.z, rot: 3.14 };
    }

    // 3. Target Jalan Iseng di Koridor
    if (actDef.target === "random_corridor") {
      const rx = (Math.random() - 0.5) * 4.0; // Sekitar koridor tengah
      const rz = (Math.random() - 0.5) * 16.0;
      return { x: rx, z: rz, rot: Math.random() * 6.28 };
    }

    // 4. Target Landmark Khusus Kantor
    if (OFFICE_LANDMARKS[actDef.target]) {
      const lm = OFFICE_LANDMARKS[actDef.target];
      return { x: lm.x, z: lm.z, rot: lm.rot };
    }

    return { x: npc.desk.x, z: npc.desk.z, rot: 3.14 };
  }

  // Pemicu dialog situasional saat aktivitas dimulai
  triggerSituationalDialogue(npc, actKey, context) {
    const { triggerBubble, onChatMessage } = context;
    if (!triggerBubble) return;

    let dialogue = null;

    if (actKey === "bikin_kopi_teh") {
      dialogue = "Rehat sebentar seduh kopi biar konsentrasi tetap tajam ☕";
    } else if (actKey === "tidur_meja") {
      dialogue = "Aduh ngantuk banget... merem 5 menit di meja ya 😴";
    } else if (actKey === "cek_hp") {
      dialogue = "Cek notifikasi WhatsApp dan timeline medsos bentar 📱";
    } else if (actKey === "ngelamun_jendela") {
      dialogue = "Menatap gedung-gedung di luar jendela... adem juga suasananya 🪟";
    } else if (actKey === "dipanggil_bos") {
      dialogue = "Waduh dipanggil bos ke ruang rapat, ada apa ya? 💼";
    } else if (actKey === "dimarahi_bos") {
      dialogue = "Kena semprot bos tadi gara-gara teledor, besok gak diulang lagi deh 😔";
    } else if (actKey === "ke_toilet") {
      dialogue = "Izin ke toilet cuci muka bentar biar fresh 🚻";
    } else if (actKey === "fotokopi_print") {
      dialogue = "Ngeprint dokumen laporan buat arsip fisik 🖨️";
    } else if (actKey === "salat") {
      dialogue = "Waktunya ibadah di musala kantor dulu 🕌";
    } else if (actKey === "ke_ruangan_teman") {
      dialogue = "Hai bro! Mau nanya progres tugas kemarin bentar 👋";
    } else if (actKey === "bantu_teman") {
      dialogue = "Sini aku bantu review codingan/desainnya biar cepet kelar!";
    }

    if (dialogue) {
      triggerBubble(dialogue);
    }
  }

  // Interaksi Tamu Bisnis Eksternal (Pak Tirta)
  handleGuestInteraction(npc, bState, simMinutes, context) {
    const isGuestTime = (simMinutes >= 630 && simMinutes <= 665) || (simMinutes >= 840 && simMinutes <= 875); // 10:30 & 14:00

    if (npc.id === "npc-guest") {
      if (isGuestTime && !this.guestMeetingState.isActive) {
        // Tamu tiba
        this.guestMeetingState.isActive = true;
        this.guestMeetingState.stage = "arriving";
        this.guestMeetingState.timer = 15;
        npc.isInsideOffice = true;
        npc.currentPos = { x: OFFICE_LANDMARKS.entrance.x, z: OFFICE_LANDMARKS.entrance.z };
        
        // Jalan ke lobi
        npc.targetPos = OFFICE_LANDMARKS.lobby;
        npc.waypoints = context.findPath ? context.findPath(npc.currentPos, OFFICE_LANDMARKS.lobby) : [];
        npc.waypointIndex = 0;
        npc.currentStatusLabel = "💼 Tamu Bisnis Tiba di Lobi";
        bState.debugLabel = "[Tamu] Tiba di Lobi";
        if (context.triggerBubble) {
          context.triggerBubble("Selamat pagi, saya Tirta dari PT Solusi Digital ingin bertemu tim Ekalaya.");
        }
        return true;
      }

      if (this.guestMeetingState.isActive) {
        return true; // Tamu dikendalikan oleh state pertemuan
      }
    }

    // Tuan Rumah (Luna atau Budi) yang menyambut tamu
    if (this.guestMeetingState.isActive && (npc.id === "npc-luna" || npc.id === "npc-budi")) {
      if (this.guestMeetingState.hostId === npc.id) {
        if (this.guestMeetingState.stage === "arriving") {
          // Host jalan menemui tamu di Lobi
          npc.targetPos = { x: 0, z: 12.0, rot: 3.14 };
          npc.waypoints = context.findPath ? context.findPath(npc.currentPos, npc.targetPos) : [];
          npc.waypointIndex = 0;
          npc.currentStatusLabel = "🤝 Menyambut Tamu Bisnis";
          bState.debugLabel = "[Host] Sambut Tamu";
          
          if (Math.hypot(npc.currentPos.x - 0, npc.currentPos.z - 12.0) < 1.5) {
            this.guestMeetingState.stage = "meeting";
            if (context.triggerBubble) {
              context.triggerBubble("Selamat datang Pak Tirta! Mari silakan kita diskusi di ruang rapat eksekutif.");
            }

            // Keduanya jalan ke Boardroom
            const guestNpc = context.allNpcs ? context.allNpcs.get("npc-guest") : null;
            if (guestNpc) {
              guestNpc.targetPos = OFFICE_LANDMARKS.boardroom_guest;
              guestNpc.waypoints = context.findPath ? context.findPath(guestNpc.currentPos, OFFICE_LANDMARKS.boardroom_guest) : [];
              guestNpc.waypointIndex = 0;
              guestNpc.currentStatusLabel = "🤝 Diskusi Prospek Bisnis";
            }

            npc.targetPos = OFFICE_LANDMARKS.boardroom_boss;
            npc.waypoints = context.findPath ? context.findPath(npc.currentPos, OFFICE_LANDMARKS.boardroom_boss) : [];
            npc.waypointIndex = 0;
          }
          return true;
        }

        if (this.guestMeetingState.stage === "meeting" && !isGuestTime) {
          // Pertemuan selesai
          this.guestMeetingState.stage = "departing";
          const guestNpc = context.allNpcs ? context.allNpcs.get("npc-guest") : null;
          if (guestNpc) {
            guestNpc.targetPos = OFFICE_LANDMARKS.entrance;
            guestNpc.waypoints = context.findPath ? context.findPath(guestNpc.currentPos, OFFICE_LANDMARKS.entrance) : [];
            guestNpc.waypointIndex = 0;
            guestNpc.currentStatusLabel = "👋 Pamit Pulang";
          }
          if (context.triggerBubble) {
            context.triggerBubble("Terima kasih atas kunjungannya Pak Tirta! Proposal penawaran segera kami kirimkan.");
          }
          setTimeout(() => {
            this.guestMeetingState.isActive = false;
            if (guestNpc) guestNpc.isInsideOffice = false;
          }, 8000);
          return true;
        }
      }
    }

    return false;
  }
}

// Instance singleton
export const behaviorEngine = new BehaviorEngine();
