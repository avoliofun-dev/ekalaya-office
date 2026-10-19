"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { buildOfficeScene, createBlockyAvatar } from "@/lib/officeBuilder";
import { OFFICE_ZONES, AVATAR_COLORS, COMPANY_PROFILE } from "@/lib/mockData";
import { OfficeSimulationEngine, minutesToTimeString } from "@/lib/simulationEngine";
import { PeerNetwork } from "@/lib/peerNetwork";
import {
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Briefcase,
  Calendar,
  Settings,
  Send,
  Coffee,
  HelpCircle,
  Share2,
  Volume2,
  Sparkles,
  CheckCircle2,
  Compass,
  Monitor,
  Radio,
  Wifi,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Clock,
  Play,
  Pause,
  FastForward,
  SkipForward,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function VirtualOffice() {
  const containerRef = useRef(null);

  // User state & Office Presence State
  const [userId, setUserId] = useState("user_init");
  const [playerName, setPlayerName] = useState("Raja (Owner)");
  const [playerStatus, setPlayerStatus] = useState("Monitoring"); // Mode Pengawas Kantor
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].hex);
  const [currentZone, setCurrentZone] = useState("Ruang Pengawas Kantor");
  const [isInOffice, setIsInOffice] = useState(false); // Default: Avatar disembunyikan (Mode Pengawas 24 Jam)
  const [peersNearby, setPeersNearby] = useState([]);
  const [connectedPeersCount, setConnectedPeersCount] = useState(0);

  // 24-HOUR SIMULATION ENGINE STATE
  const simulationEngineRef = useRef(null);
  const [simulatedTimeStr, setSimulatedTimeStr] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ekalaya_sim_minutes");
      if (stored) return minutesToTimeString(parseFloat(stored));
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
    return "08:30";
  });
  const [isTimeAccelerated, setIsTimeAccelerated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ekalaya_sim_accelerated") === "true";
    }
    return false;
  });
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [npcListState, setNpcListState] = useState([]);

  // Day/Night and Camera Zoom state
  const [isDayMode, setIsDayMode] = useState(true); // Default SIANG
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = standard, 1.5 = wide / jauh, 0.7 = close
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCleanUIMode, setIsCleanUIMode] = useState(false); // Mode Bersih / Sembunyikan UI
  const rootRef = useRef(null);
  const ambientLightRef = useRef(null);
  const dirLightRef = useRef(null);

  // Fullscreen toggle function - Request fullscreen on rootRef so all UI remains visible!
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    const elem = rootRef.current || document.documentElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Sync isFullscreen state if user exits via browser gesture/esc
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Client-side initialization of user id and saved name
  useEffect(() => {
    const savedName = localStorage.getItem("ekalaya_name");
    if (savedName) setPlayerName(savedName);
    setUserId("user_" + Math.random().toString(36).substring(2, 8));

    // Detect mobile / touch capability
    if (typeof window !== "undefined") {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobileDevice(hasTouch || window.innerWidth < 768);
    }
  }, []);

  // Audio/Video controls
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [activeScreenShare, setActiveScreenShare] = useState(false);

  // Chat & UI state
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "Rani (Lead Product)",
      text: "Selamat datang di kantor virtual 3D Ekalaya! 👋",
      time: "15:00",
      isOwner: false,
    },
    {
      id: "2",
      sender: "Budi (Backend Dev)",
      text: "Keren banget suasananya, siap meeting di Executive Room jam 16:00 nanti.",
      time: "15:02",
      isOwner: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // 3D Scene Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const playerAvatarRef = useRef(null);
  const botsRef = useRef(new Map());
  const peerAvatarsRef = useRef(new Map()); // Real human peers
  const peerNetworkRef = useRef(null);
  const keysPressed = useRef({});
  const joystickVector = useRef({ x: 0, z: 0 }); // Touch Joystick vector for mobile
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Roblox-style camera rotation state (mouse drag / touch swipe)
  const cameraAngle = useRef({ theta: 0, phi: 0.45 }); // Orbit angles
  const isDraggingCamera = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });

  // Jump physics state
  const playerVelocityY = useRef(0);
  const isGrounded = useRef(true);

  // Trigger jump function
  const triggerJump = () => {
    if (isGrounded.current && playerAvatarRef.current) {
      playerVelocityY.current = 6.2;
      isGrounded.current = false;
    }
  };

  // Trigger emote (Minimal 4 gerakan: Wave, Cheer/Clap, Dance/Joged, Coffee/Sit)
  const triggerEmote = (emoteType) => {
    if (!playerAvatarRef.current) return;
    const avatar = playerAvatarRef.current;

    if (emoteType === "wave") {
      avatar.userData.action = "waving";
      avatar.userData.waveTimer = 70;
      confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
      addSystemMessage(`${playerName} melambaikan tangan! 👋`);
    } else if (emoteType === "cheer") {
      avatar.userData.action = "cheer";
      avatar.userData.cheerTimer = 70;
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.7 } });
      addSystemMessage(`${playerName} memberikan tepuk tangan meriah! 🎉`);
    } else if (emoteType === "dance") {
      avatar.userData.action = "dance";
      avatar.userData.danceTimer = 120; // 2 seconds dance
      confetti({ particleCount: 40, spread: 100, origin: { y: 0.75 } });
      addSystemMessage(`${playerName} asyik berjoget disco! 💃🕺`);
    } else if (emoteType === "spin") {
      avatar.userData.action = "spin";
      avatar.userData.spinTimer = 60;
      addSystemMessage(`${playerName} berputar 360 derajat! 🌀`);
    } else if (emoteType === "coffee") {
      setPlayerStatus("Away");
      addSystemMessage(`${playerName} sedang istirahat minum kopi di pantry ☕`);
    }
  };

  const addSystemMessage = (text) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "Sistem",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystem: true,
      },
    ]);
  };

  // Toggle mode waktu dipercepat (1 hari = 10 menit vs Realtime 24 jam)
  const toggleTimeSpeed = () => {
    const nextAcc = !isTimeAccelerated;
    setIsTimeAccelerated(nextAcc);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ekalaya_sim_accelerated", nextAcc ? "true" : "false");
        if (!nextAcc) {
          // Jika kembali ke realtime, reset sim_minutes agar sinkron dengan jam nyata komputer
          localStorage.removeItem("ekalaya_sim_minutes");
        }
      } catch (e) {}
    }
    if (simulationEngineRef.current) {
      simulationEngineRef.current.isAccelerated = nextAcc;
      if (!nextAcc) {
        const now = new Date();
        simulationEngineRef.current.simulatedMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      }
    }
    addSystemMessage(
      nextAcc
        ? "⚡ Mode Dipercepat Aktif: 1 Hari = 10 Menit (Cocok untuk uji siklus penuh)"
        : "🕒 Mode Waktu Nyata (Realtime 24 Jam) Aktif: Jam sinkron dengan jam komputer saat ini"
    );
  };

  // Skip waktu simulasi maju 1 jam (Fitur pengujian mudah)
  const skipOneHour = () => {
    if (simulationEngineRef.current) {
      simulationEngineRef.current.simulatedMinutes = (simulationEngineRef.current.simulatedMinutes + 60) % 1440;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ekalaya_sim_minutes", simulationEngineRef.current.simulatedMinutes.toString());
        } catch (e) {}
      }
      setSimulatedTimeStr(minutesToTimeString(simulationEngineRef.current.simulatedMinutes));
      addSystemMessage(`⏩ Waktu dimajukan 1 jam ke pukul ${minutesToTimeString(simulationEngineRef.current.simulatedMinutes)}`);
    }
  };

  // Aksi Masuk / Keluar Kantor
  const toggleOfficePresence = () => {
    if (isInOffice) {
      // Keluar dari kantor
      setIsInOffice(false);
      setPlayerStatus("Away");
      if (playerAvatarRef.current) {
        // Pindahkan avatar keluar pintu lobi atau sembunyikan
        playerAvatarRef.current.position.set(0, 0, 11.5);
        playerAvatarRef.current.visible = false;
      }
      addSystemMessage(`${playerName} telah keluar dari kantor (Check-out) 🚪👋`);
    } else {
      // Masuk ke kantor
      setIsInOffice(true);
      setPlayerStatus("Available");
      if (playerAvatarRef.current) {
        playerAvatarRef.current.position.set(0, 0, 7.5);
        playerAvatarRef.current.visible = true;
      }
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.6 } });
      addSystemMessage(`${playerName} telah masuk ke dalam kantor (Check-in)! Selamat bekerja 🏢💼`);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: playerName,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwner: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Broadcast chat to real peers
    if (peerNetworkRef.current) {
      peerNetworkRef.current.sendChat({
        ...newMsg,
        isOwner: false, // For other recipients
      });
    }

    // Bot automatic reply simulation if addressing bots
    setTimeout(() => {
      const npcs = simulationEngineRef.current ? Array.from(simulationEngineRef.current.npcStates.values()) : [];
      if (npcs.length === 0) return;
      const randomBot = npcs[Math.floor(Math.random() * npcs.length)];
      const replies = [
        "Sip mantap pak!",
        "Segera saya selesaikan tugas ini 👍",
        "Boleh, mau diskusi sebentar di meeting room?",
        "Gas lanjut!",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: randomBot.name,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwner: false,
        },
      ]);
    }, 1800);
  };

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    }
  };

  // Setup 3D Three.js & Peer Network
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();
    const bgColor = isDayMode ? 0xcbe4f9 : 0x090d16;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, isDayMode ? 0.015 : 0.035);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      50, // Slightly wider default FOV
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 10, 14);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING (Day vs Night)
    const ambientIntensity = isDayMode ? 2.2 : 1.1;
    const ambientColor = isDayMode ? 0xffffff : 0x93c5fd;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunIntensity = isDayMode ? 3.0 : 1.5;
    const sunColor = isDayMode ? 0xfff7ed : 0x60a5fa;
    const dirLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    dirLight.position.set(12, 25, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 45;
    dirLight.shadow.camera.left = -18;
    dirLight.shadow.camera.right = 18;
    dirLight.shadow.camera.top = 18;
    dirLight.shadow.camera.bottom = -18;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const warmPointColor = isDayMode ? 0xfef08a : 0x38bdf8;
    const pointLight = new THREE.PointLight(warmPointColor, isDayMode ? 1.0 : 2.0, 18);
    pointLight.position.set(0, 4, 0);
    scene.add(pointLight);

    // BUILD OFFICE
    buildOfficeScene(scene);

    // BUILD PLAYER AVATAR (Hanya tampil jika Owner memilih masuk kantor)
    const player = createBlockyAvatar({
      name: playerName,
      color: avatarColor,
      hatColor: "#0284c7",
      isPlayer: true,
      status: playerStatus,
    });
    player.position.set(0, 0, isInOffice ? 8 : 12);
    player.visible = isInOffice; // Disembunyikan secara default sesuai permintaan user
    scene.add(player);
    playerAvatarRef.current = player;

    // INISIALISASI MESIN SIMULASI 24 JAM
    const simEngine = new OfficeSimulationEngine({
      isAccelerated: isTimeAccelerated,
    });
    simulationEngineRef.current = simEngine;
    setSimulatedTimeStr(minutesToTimeString(simEngine.simulatedMinutes));

    // BUILD 4 KARYAWAN OTONOM (Rina, Dimas, Sari, Budi)
    const botMap = new Map();
    simEngine.npcStates.forEach((npc) => {
      const npcMesh = createBlockyAvatar({
        name: `${npc.name} (${npc.title.split(" ")[0]})`,
        color: npc.avatarColor,
        hatColor: npc.hatColor,
        isPlayer: false,
        status: npc.currentStatusLabel,
      });

      npcMesh.position.set(npc.currentPos.x, 0, npc.currentPos.z);
      npcMesh.rotation.y = npc.rotation;
      npcMesh.visible = npc.isInsideOffice; // Sembunyi jika sedang di rumah/pulang

      npcMesh.userData.id = npc.id;
      npcMesh.userData.name = npc.name;
      npcMesh.userData.title = npc.title;
      npcMesh.userData.action = npc.action;
      npcMesh.userData.role = npc.role;
      npcMesh.userData.task = npc.currentStatusLabel;
      npcMesh.userData.status = npc.currentStatusLabel;

      scene.add(npcMesh);
      botMap.set(npc.id, npcMesh);
    });
    botsRef.current = botMap;
    setNpcListState(Array.from(simEngine.npcStates.values()));

    // SETUP PEER NETWORK (Multiplayer Sync)
    const peerNetwork = new PeerNetwork(
      "ekalaya_hq",
      (peerId, peerData) => {
        // Peer joined
        if (!peerAvatarsRef.current.has(peerId) && peerData) {
          const peerAvatar = createBlockyAvatar({
            name: peerData.name || "Colleague",
            color: peerData.color || "#10b981",
            hatColor: "#059669",
            isPlayer: false,
            status: peerData.status || "Available",
          });
          peerAvatar.position.set(peerData.x || 0, 0, peerData.z || 8);
          peerAvatar.userData.role = "Member";
          peerAvatar.userData.task = "Berkolaborasi di Kantor";
          scene.add(peerAvatar);
          peerAvatarsRef.current.set(peerId, peerAvatar);
          setConnectedPeersCount(peerAvatarsRef.current.size);
          addSystemMessage(`${peerData.name || "Rekan kerja baru"} bergabung ke kantor virtual! 🚀`);
        }
      },
      (peerId) => {
        // Peer left
        const avatar = peerAvatarsRef.current.get(peerId);
        if (avatar) {
          scene.remove(avatar);
          peerAvatarsRef.current.delete(peerId);
          setConnectedPeersCount(peerAvatarsRef.current.size);
        }
      },
      (peerId, data) => {
        // Peer updated position
        const avatar = peerAvatarsRef.current.get(peerId);
        if (avatar && data) {
          avatar.userData.targetX = data.x;
          avatar.userData.targetZ = data.z;
          avatar.userData.targetRot = data.rot;
          avatar.userData.action = data.action;
        }
      },
      (chatData) => {
        // Received real chat from another peer
        setChatMessages((prev) => [...prev, chatData]);
      }
    );

    peerNetwork.init(userId, {
      name: playerName,
      color: avatarColor,
      status: playerStatus,
      x: player.position.x,
      z: player.position.z,
    });
    peerNetworkRef.current = peerNetwork;

    // KEYBOARD LISTENERS
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.code === "Space") {
        triggerJump();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // ROBLOX-STYLE TOUCH / MOUSE CAMERA ROTATION
    const handlePointerDown = (e) => {
      // Don't drag camera if touching joystick or UI buttons
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest(".touch-none")) {
        return;
      }
      isDraggingCamera.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    };

    const handlePointerMove = (e) => {
      if (!isDraggingCamera.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      // Orbit angles: theta (horizontal), phi (vertical)
      cameraAngle.current.theta -= dx * 0.008;
      // Clamp vertical phi angle so camera doesn't flip upside down
      cameraAngle.current.phi = Math.max(0.1, Math.min(1.35, cameraAngle.current.phi + dy * 0.006));
    };

    const handlePointerUp = (e) => {
      isDraggingCamera.current = false;
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    // RESIZE & ORIENTATION CHANGE LISTENER (Mobile landscape & portrait support)
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 400);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    // ANIMATION & SYNC LOOP
    let animationFrameId;
    let clock = new THREE.Clock();
    let lastNetworkSync = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Move Player
      if (playerAvatarRef.current) {
        const player = playerAvatarRef.current;
        const speed = 4.5 * delta;
        let inputX = 0;
        let inputZ = 0;

        if (keysPressed.current["w"] || keysPressed.current["arrowup"]) inputZ -= 1;
        if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) inputZ += 1;
        if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) inputX -= 1;
        if (keysPressed.current["d"] || keysPressed.current["arrowright"]) inputX += 1;

        // Mobile touch joystick input
        if (joystickVector.current.x !== 0 || joystickVector.current.z !== 0) {
          inputX += joystickVector.current.x;
          inputZ += joystickVector.current.z;
        }

        const isMoving = inputX !== 0 || inputZ !== 0;

        // Jump physics (Gravity & Velocity)
        if (!isGrounded.current) {
          playerVelocityY.current -= 18 * delta; // Gravity
          player.position.y += playerVelocityY.current * delta;
          if (player.position.y <= 0) {
            player.position.y = 0;
            playerVelocityY.current = 0;
            isGrounded.current = true;
          }
        }

        if (isMoving) {
          const len = Math.hypot(inputX, inputZ);
          const normX = inputX / len;
          const normZ = inputZ / len;

          // Align movement relative to camera orientation!
          const theta = cameraAngle.current.theta;
          const moveX = normX * Math.cos(theta) + normZ * Math.sin(theta);
          const moveZ = -normX * Math.sin(theta) + normZ * Math.cos(theta);

          const nextX = player.position.x + moveX * speed;
          const nextZ = player.position.z + moveZ * speed;

          if (nextX > -10 && nextX < 10) player.position.x = nextX;
          if (nextZ > -10 && nextZ < 10) player.position.z = nextZ;

          const targetRot = Math.atan2(moveX, moveZ);
          player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRot, 0.25);

          player.userData.stepCycle += delta * 12;
          const swing = Math.sin(player.userData.stepCycle) * 0.6;
          player.userData.leftLegPivot.rotation.x = swing;
          player.userData.rightLegPivot.rotation.x = -swing;
          player.userData.leftArmPivot.rotation.x = -swing;
          player.userData.rightArmPivot.rotation.x = swing;
        } else {
          // --- AKSI OTOMATIS BERDASARKAN RUANGAN / ZONA & RANDOM IDLE EMOTES ---
          // Jika avatar sedang diam di suatu zona, jalankan aksi alami tanpa perlu klik tombol:
          const pX = player.position.x;
          const pZ = player.position.z;

          // Inisialisasi timer random action di userData jika belum ada
          if (!player.userData.randomActionTimer) {
            player.userData.randomActionTimer = Math.floor(Math.random() * 200) + 150; // Tiap 4-6 detik
          }
          player.userData.randomActionTimer--;

          // Pemicu Aksi Random / Spontan saat berdiam
          if (player.userData.randomActionTimer <= 0 && (!player.userData.action || player.userData.action === "idle")) {
            player.userData.randomActionTimer = Math.floor(Math.random() * 260) + 200;
            // Pilih aksi acak yang seru dan natural
            const randomChoices = ["wave", "cheer", "dance", "stretch", "spin"];
            const chosen = randomChoices[Math.floor(Math.random() * randomChoices.length)];
            
            if (chosen === "wave") {
              player.userData.action = "waving";
              player.userData.waveTimer = 60;
            } else if (chosen === "cheer") {
              player.userData.action = "cheer";
              player.userData.cheerTimer = 50;
            } else if (chosen === "dance") {
              player.userData.action = "dance";
              player.userData.danceTimer = 70;
            } else if (chosen === "spin") {
              player.userData.action = "spin";
              player.userData.spinTimer = 40;
            }
          }

          // A. Deteksi Zona Lounge & Pantry (Sofa / Bar Kopi: X: 1 s/d 8.5, Z: 2 s/d 8.5)
          const inLoungePantry = pX >= 1.0 && pX <= 8.5 && pZ >= 2.0 && pZ <= 8.5;
          // B. Deteksi Zona Executive Meeting Room (Sekitar Meja Bundar: X: -8 s/d -1, Z: 2 s/d 8)
          const inMeetingRoom = pX >= -8.0 && pX <= -1.0 && pZ >= 2.0 && pZ <= 8.0;
          // C. Deteksi Zona Meja Kerja Engineering Bay (X: -8 s/d -1, Z: -8 s/d -1)
          const inEngineeringBay = pX >= -8.0 && pX <= -1.0 && pZ >= -8.0 && pZ <= -1.0;
          // D. Deteksi Zona Meja Kerja Product & Design Bay (X: 1 s/d 8, Z: -8 s/d -1)
          const inProductBay = pX >= 1.0 && pX <= 8.0 && pZ >= -8.0 && pZ <= -1.0;

          // Terapkan Aksi Kontekstual jika tidak sedang dalam emote khusus (wave/cheer/dance/spin)
          const isBusyWithEmote = ["waving", "cheer", "dance", "spin"].includes(player.userData.action);

          if (!isBusyWithEmote) {
            if (inLoungePantry) {
              // Otomatis Santai / Minum Kopi di Pantry Sofa
              player.position.y = -0.28; // Pose duduk di sofa
              player.userData.leftLegPivot.rotation.x = -Math.PI / 2.2;
              player.userData.rightLegPivot.rotation.x = -Math.PI / 2.2;
              // Tangan santai memegang cangkir kopi
              player.userData.rightArmPivot.rotation.x = -0.8 + Math.sin(time * 3) * 0.15;
              player.userData.rightArmPivot.rotation.z = -0.3;
              player.userData.leftArmPivot.rotation.x = -0.4;
              player.userData.leftArmPivot.rotation.z = 0;
            } else if (inMeetingRoom) {
              // Otomatis Duduk Rapat & Menyimak Diskusi di Meeting Room
              player.position.y = -0.28;
              player.userData.leftLegPivot.rotation.x = -Math.PI / 2.2;
              player.userData.rightLegPivot.rotation.x = -Math.PI / 2.2;
              player.userData.leftArmPivot.rotation.x = -0.6;
              player.userData.rightArmPivot.rotation.x = -0.6;
              player.userData.leftArmPivot.rotation.z = 0;
              player.userData.rightArmPivot.rotation.z = 0;
            } else if (inEngineeringBay || inProductBay) {
              // Otomatis Mengetik Laptop & Coding / Desain di Workstation
              player.position.y = 0;
              player.userData.leftLegPivot.rotation.x = 0;
              player.userData.rightLegPivot.rotation.x = 0;
              player.userData.leftArmPivot.rotation.x = -1.25 + Math.sin(time * 8) * 0.08;
              player.userData.rightArmPivot.rotation.x = -1.25 + Math.cos(time * 8) * 0.08;
              player.userData.leftArmPivot.rotation.z = 0;
              player.userData.rightArmPivot.rotation.z = 0;
            } else {
              // Lobi Kantor / Koridor: Pose Berdiri Santai
              player.position.y = 0;
              player.userData.leftLegPivot.rotation.x = THREE.MathUtils.lerp(player.userData.leftLegPivot.rotation.x, 0, 0.2);
              player.userData.rightLegPivot.rotation.x = THREE.MathUtils.lerp(player.userData.rightLegPivot.rotation.x, 0, 0.2);
              player.userData.leftArmPivot.rotation.x = THREE.MathUtils.lerp(player.userData.leftArmPivot.rotation.x, 0, 0.2);
              player.userData.rightArmPivot.rotation.x = THREE.MathUtils.lerp(player.userData.rightArmPivot.rotation.x, 0, 0.2);
              player.userData.leftArmPivot.rotation.z = THREE.MathUtils.lerp(player.userData.leftArmPivot.rotation.z, 0, 0.2);
              player.userData.rightArmPivot.rotation.z = THREE.MathUtils.lerp(player.userData.rightArmPivot.rotation.z, 0, 0.2);
              player.userData.torso.position.y = 1.05 + Math.sin(time * 2) * 0.02;
            }
          }

          // Emote animations (Wave, Cheer, Dance, Spin)
          if (player.userData.action === "waving") {
            player.userData.waveTimer--;
            player.position.y = 0;
            player.userData.leftLegPivot.rotation.x = 0;
            player.userData.rightLegPivot.rotation.x = 0;
            player.userData.rightArmPivot.rotation.x = 0;
            player.userData.rightArmPivot.rotation.z = Math.sin(time * 15) * 0.5 + 2.5;
            if (player.userData.waveTimer <= 0) {
              player.userData.action = "idle";
              player.userData.rightArmPivot.rotation.z = 0;
            }
          } else if (player.userData.action === "cheer") {
            player.userData.cheerTimer--;
            player.position.y = 0;
            player.userData.leftLegPivot.rotation.x = 0;
            player.userData.rightLegPivot.rotation.x = 0;
            player.userData.leftArmPivot.rotation.z = -2.3 + Math.sin(time * 20) * 0.3;
            player.userData.rightArmPivot.rotation.z = 2.3 + Math.sin(time * 20) * 0.3;
            if (player.userData.cheerTimer <= 0) {
              player.userData.action = "idle";
              player.userData.leftArmPivot.rotation.z = 0;
              player.userData.rightArmPivot.rotation.z = 0;
            }
          } else if (player.userData.action === "dance") {
            player.userData.danceTimer--;
            player.position.y = 0;
            player.rotation.y += delta * 4; // Fun disco spin
            player.userData.torso.position.y = 1.05 + Math.abs(Math.sin(time * 10)) * 0.25;
            player.userData.leftArmPivot.rotation.z = Math.sin(time * 12) * 1.5 - 1.0;
            player.userData.rightArmPivot.rotation.z = -Math.sin(time * 12) * 1.5 + 1.0;
            if (player.userData.danceTimer <= 0) {
              player.userData.action = "idle";
              player.userData.torso.position.y = 1.05;
              player.userData.leftArmPivot.rotation.z = 0;
              player.userData.rightArmPivot.rotation.z = 0;
            }
          } else if (player.userData.action === "spin") {
            player.userData.spinTimer--;
            player.position.y = 0;
            player.rotation.y += delta * 12; // 360 fast spin
            if (player.userData.spinTimer <= 0) {
              player.userData.action = "idle";
            }
          }
        }

        // Spherical Orbit Camera: Mode Pengawas Kantor (Panoramic Overview) atau Mengikuti Player
        const camDistance = (isInOffice ? 11.0 : 16.5) * zoomLevel;
        const theta = cameraAngle.current.theta;
        const phi = cameraAngle.current.phi;

        // Titik fokus kamera: ke tengah kantor (0, 1.2, 0) jika avatar dibuang/pengawas, atau ke avatar jika sedang masuk kantor
        const focusX = isInOffice ? player.position.x : 0;
        const focusY = isInOffice ? player.position.y + 1.2 : 1.2;
        const focusZ = isInOffice ? player.position.z : 0;

        const targetCamX = focusX + camDistance * Math.sin(theta) * Math.cos(phi);
        const targetCamY = focusY + camDistance * Math.sin(phi) + 2.0;
        const targetCamZ = focusZ + camDistance * Math.cos(theta) * Math.cos(phi);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.12);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.12);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.12);
        camera.lookAt(focusX, focusY, focusZ);

        // Send network state update (throttled 20Hz / 50ms)
        if (time - lastNetworkSync > 0.05 && peerNetworkRef.current) {
          lastNetworkSync = time;
          peerNetworkRef.current.updateMyState({
            x: player.position.x,
            z: player.position.z,
            rot: player.rotation.y,
            action: isMoving ? "walking" : player.userData.action,
            name: playerName,
            color: avatarColor,
            status: playerStatus,
          });
        }

        // Check Zone & Spatial Proximity
        const pX = player.position.x;
        const pZ = player.position.z;

        let zoneFound = "Lobi Kantor";
        for (const zone of OFFICE_ZONES) {
          if (
            pX >= zone.bounds.minX &&
            pX <= zone.bounds.maxX &&
            pZ >= zone.bounds.minZ &&
            pZ <= zone.bounds.maxZ
          ) {
            zoneFound = zone.name;
            break;
          }
        }
        setCurrentZone(zoneFound);

        // Check nearby peers (Bots + Real peers)
        const nearby = [];
        botsRef.current.forEach((botMesh, botId) => {
          const dist = Math.hypot(pX - botMesh.position.x, pZ - botMesh.position.z);
          if (dist < 4.8) {
            nearby.push({
              id: botId,
              name: botMesh.userData.name,
              status: botMesh.userData.status,
              distance: dist.toFixed(1),
            });
          }
        });

        peerAvatarsRef.current.forEach((pMesh, pId) => {
          const dist = Math.hypot(pX - pMesh.position.x, pZ - pMesh.position.z);
          if (dist < 4.8) {
            nearby.push({
              id: pId,
              name: pMesh.userData.name,
              status: pMesh.userData.status,
              distance: dist.toFixed(1),
            });
          }
        });

        setPeersNearby(nearby);
      }

      // 2. Interpolate Real Peer Avatars
      peerAvatarsRef.current.forEach((peerMesh) => {
        if (peerMesh.userData.targetX !== undefined) {
          peerMesh.position.x = THREE.MathUtils.lerp(peerMesh.position.x, peerMesh.userData.targetX, 0.3);
          peerMesh.position.z = THREE.MathUtils.lerp(peerMesh.position.z, peerMesh.userData.targetZ, 0.3);
          peerMesh.rotation.y = THREE.MathUtils.lerp(peerMesh.rotation.y, peerMesh.userData.targetRot || 0, 0.3);

          if (peerMesh.userData.action === "walking") {
            peerMesh.userData.stepCycle += delta * 12;
            const swing = Math.sin(peerMesh.userData.stepCycle) * 0.6;
            peerMesh.userData.leftLegPivot.rotation.x = swing;
            peerMesh.userData.rightLegPivot.rotation.x = -swing;
            peerMesh.userData.leftArmPivot.rotation.x = -swing;
            peerMesh.userData.rightArmPivot.rotation.x = swing;
          } else {
            peerMesh.userData.leftLegPivot.rotation.x = 0;
            peerMesh.userData.rightLegPivot.rotation.x = 0;
            peerMesh.userData.leftArmPivot.rotation.x = 0;
            peerMesh.userData.rightArmPivot.rotation.x = 0;
          }
        }
      });

      // 3. Update Mesin Simulasi 24 Jam & Animate 4 Karyawan Otonom
      if (simulationEngineRef.current) {
        const engine = simulationEngineRef.current;
        engine.update(delta, addSystemMessage, (chat) => {
          setChatMessages((prev) => [...prev, chat]);
        });

        // Sinkronisasi display jam tiap frame
        setSimulatedTimeStr(minutesToTimeString(engine.simulatedMinutes));

        // Animate setiap NPC mesh mengikuti rute waypoints & status kegiatan
        engine.npcStates.forEach((npc, npcId) => {
          const npcMesh = botsRef.current.get(npcId);
          if (!npcMesh) return;

          // Visibilitas (Sembunyi jika tidur di rumah/pulang)
          npcMesh.visible = npc.isInsideOffice;

          // Update teks nametag, status aktivitas, dan bubble obrolan di atas kepala
          const activeBubble = engine.getBubbleForNpc(npcId);
          if (npcMesh.userData.updateOverheadDisplay) {
            npcMesh.userData.updateOverheadDisplay(
              npc.name,
              npc.currentStatusLabel,
              activeBubble
            );
          }

          // Pergerakan Pathfinding Waypoints
          if (npc.waypoints && npc.waypoints.length > 0 && npc.waypointIndex < npc.waypoints.length) {
            const wp = npc.waypoints[npc.waypointIndex];
            const dx = wp.x - npc.currentPos.x;
            const dz = wp.z - npc.currentPos.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 0.15) {
              const moveSpeed = (isTimeAccelerated ? 4.5 : 2.5) * delta;
              npc.currentPos.x += (dx / dist) * moveSpeed;
              npc.currentPos.z += (dz / dist) * moveSpeed;

              npcMesh.position.x = npc.currentPos.x;
              npcMesh.position.z = npc.currentPos.z;

              // Rotasi hadap ke waypoint
              const targetRot = Math.atan2(dx, dz);
              npcMesh.rotation.y = THREE.MathUtils.lerp(npcMesh.rotation.y, targetRot, 0.2);

              // Animasi langkah berjalan
              npcMesh.userData.stepCycle = (npcMesh.userData.stepCycle || 0) + delta * 11;
              const swing = Math.sin(npcMesh.userData.stepCycle) * 0.6;
              npcMesh.userData.leftLegPivot.rotation.x = swing;
              npcMesh.userData.rightLegPivot.rotation.x = -swing;
              npcMesh.userData.leftArmPivot.rotation.x = -swing;
              npcMesh.userData.rightArmPivot.rotation.x = swing;
              npcMesh.userData.torso.position.y = 1.05 + Math.abs(Math.sin(npcMesh.userData.stepCycle * 2)) * 0.08;
              npcMesh.position.y = 0;
              return;
            } else {
              // Lanjut ke waypoint berikutnya
              npc.waypointIndex++;
              if (npc.waypointIndex >= npc.waypoints.length) {
                npc.waypoints = [];
                // Samakan rotasi tujuan
                if (npc.targetPos && npc.targetPos.rot !== undefined) {
                  npc.rotation = npc.targetPos.rot;
                  npcMesh.rotation.y = npc.targetPos.rot;
                }
              }
            }
          }

          // Animasi Aksi saat Berhenti di Tempat (Action States)
          const act = npc.action || "idle";

          if (act === "typing") {
            npcMesh.position.y = 0;
            npcMesh.userData.leftLegPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.leftLegPivot.rotation.x, 0, 0.2);
            npcMesh.userData.rightLegPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.rightLegPivot.rotation.x, 0, 0.2);
            npcMesh.userData.leftArmPivot.rotation.x = -1.25 + Math.sin(time * 8) * 0.1;
            npcMesh.userData.rightArmPivot.rotation.x = -1.25 + Math.cos(time * 8) * 0.1;
            npcMesh.userData.leftArmPivot.rotation.z = 0;
            npcMesh.userData.rightArmPivot.rotation.z = 0;
          } else if (act === "sitting") {
            npcMesh.position.y = -0.3;
            npcMesh.userData.leftLegPivot.rotation.x = -Math.PI / 2;
            npcMesh.userData.rightLegPivot.rotation.x = -Math.PI / 2;
            npcMesh.userData.leftArmPivot.rotation.x = -0.5;
            npcMesh.userData.rightArmPivot.rotation.x = -0.5;
          } else if (act === "waving") {
            npcMesh.position.y = 0;
            npcMesh.userData.leftLegPivot.rotation.x = 0;
            npcMesh.userData.rightLegPivot.rotation.x = 0;
            npcMesh.userData.rightArmPivot.rotation.x = 0;
            npcMesh.userData.rightArmPivot.rotation.z = Math.sin(time * 12) * 0.5 + 2.4;
            npcMesh.userData.leftArmPivot.rotation.z = 0;
          } else if (act === "cheer") {
            npcMesh.position.y = 0;
            npcMesh.userData.leftArmPivot.rotation.z = -2.2 + Math.sin(time * 18) * 0.3;
            npcMesh.userData.rightArmPivot.rotation.z = 2.2 + Math.sin(time * 18) * 0.3;
          } else if (act === "dance") {
            npcMesh.position.y = 0;
            npcMesh.rotation.y += delta * 2.5;
            npcMesh.userData.leftArmPivot.rotation.z = Math.sin(time * 10) * 1.2 - 0.8;
            npcMesh.userData.rightArmPivot.rotation.z = -Math.sin(time * 10) * 1.2 + 0.8;
          } else {
            // Idle alami
            npcMesh.position.y = 0;
            npcMesh.userData.leftLegPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.leftLegPivot.rotation.x, 0, 0.2);
            npcMesh.userData.rightLegPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.rightLegPivot.rotation.x, 0, 0.2);
            npcMesh.userData.leftArmPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.leftArmPivot.rotation.x, 0, 0.2);
            npcMesh.userData.rightArmPivot.rotation.x = THREE.MathUtils.lerp(npcMesh.userData.rightArmPivot.rotation.x, 0, 0.2);
            npcMesh.userData.torso.position.y = 1.05 + Math.sin(time * 2) * 0.02;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("pointerdown", handlePointerDown);
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerup", handlePointerUp);
        container.removeEventListener("pointercancel", handlePointerUp);
      }
      if (peerNetworkRef.current) {
        peerNetworkRef.current.destroy();
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [avatarColor, playerName, playerStatus, userId, isDayMode, zoomLevel]);

  return (
    <div ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WEBGL VIEWPORT */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* TOP HEADER: BRAND, WORK CYCLE HUD & ACTIONS */}
      <header className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
        {!isCleanUIMode ? (
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-xl pointer-events-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-base shadow-lg shadow-cyan-500/25 text-white">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold tracking-tight text-white">EKALAYA 3D OFFICE</h1>
                <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wifi className="w-2.5 h-2.5 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>Zona: <strong className="text-cyan-300">{currentZone}</strong></span>
              </div>
            </div>
          </div>
        ) : <div />}

        {/* 24-HOUR SIMULATION HUD (TENGAH HEADER - KONTROL REALTIME & DIPERCEPAT) */}
        {!isCleanUIMode && (
          <div className="order-3 md:order-2 mx-auto pointer-events-auto max-w-[94vw]">
            <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-cyan-500/40 shadow-xl text-xs">
              <span className="text-base select-none">
                {isTimeAccelerated ? "⚡" : "🕒"}
              </span>
              <div className="text-left flex items-center gap-2">
                <span className="font-bold text-white tracking-wide text-xs">
                  {simulatedTimeStr} WIB
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 border ${
                    isTimeAccelerated
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-cyan-950/90 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: isTimeAccelerated ? "2s" : "10s" }} />
                  {isTimeAccelerated ? "1 Hari = 10m" : "Realtime 24J"}
                </span>
              </div>

              {/* Kontrol Kecepatan Waktu & Loncat Jam */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
                <button
                  onClick={toggleTimeSpeed}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                    isTimeAccelerated
                      ? "bg-amber-500/30 text-amber-200 border-amber-500/50 hover:bg-amber-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750"
                  }`}
                  title={isTimeAccelerated ? "Ubah ke Mode Waktu Nyata (Realtime)" : "Ubah ke Mode Dipercepat (1 Hari = 10 Menit)"}
                >
                  {isTimeAccelerated ? "⚡ Percepat Aktif" : "⚡ Percepat"}
                </button>
                <button
                  onClick={skipOneHour}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold transition-all active:scale-95"
                  title="Majukan waktu 1 jam ke depan"
                >
                  +1 Jam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOP RIGHT: CONTROLS & WORKSPACE INFO */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 pointer-events-auto ml-auto">
          {/* TOGGLE CLEAN UI */}
          <button
            onClick={() => setIsCleanUIMode(!isCleanUIMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-xs font-semibold transition-all shadow-md active:scale-95 ${
              isCleanUIMode
                ? "bg-cyan-500 text-white shadow-cyan-500/30 border border-cyan-400"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60"
            }`}
            title={isCleanUIMode ? "Tampilkan Semua UI" : "Sembunyikan UI (Fokus Bersih)"}
          >
            {isCleanUIMode ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isCleanUIMode ? "Tampilkan" : "Bersih"}</span>
          </button>

          {!isCleanUIMode && (
            <>
              {/* TOMBOL MASUK / KELUAR DARI KANTOR */}
              <button
                onClick={toggleOfficePresence}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold transition-all shadow-md active:scale-95 border ${
                  isInOffice
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                    : "bg-emerald-500/25 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/35"
                }`}
                title={isInOffice ? "Keluar Kantor (Mode Pengawas)" : "Masuk ke Dalam Kantor Sebagai Avatar"}
              >
                {isInOffice ? <LogOut className="w-3.5 h-3.5 text-rose-400" /> : <LogIn className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden sm:inline">{isInOffice ? "Keluar" : "Masuk Avatar"}</span>
              </button>

              {/* FULLSCREEN TOGGLE */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 p-2 md:px-2.5 md:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-md active:scale-95"
                title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              {/* DAY / NIGHT MODE TOGGLE */}
              <button
                onClick={() => setIsDayMode(!isDayMode)}
                className={`p-2 md:px-2.5 md:py-1.5 rounded-xl backdrop-blur-md text-xs font-semibold transition-all shadow-md active:scale-95 ${
                  isDayMode
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-900/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800"
                }`}
                title={isDayMode ? "Mode Malam" : "Mode Siang"}
              >
                {isDayMode ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} /> : <Moon className="w-3.5 h-3.5 text-cyan-300" />}
              </button>

              {/* ZOOM LEVEL / VIEW ANGLE TOGGLE */}
              <button
                onClick={() => {
                  if (zoomLevel === 1) setZoomLevel(1.5);
                  else if (zoomLevel === 1.5) setZoomLevel(0.7);
                  else setZoomLevel(1);
                }}
                className="flex items-center gap-1 p-2 md:px-2.5 md:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-md active:scale-95"
                title="Jarak Pandang (Luas / Dekat / Normal)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">
                  {zoomLevel === 1.5 ? "Luas" : zoomLevel === 0.7 ? "Dekat" : "Normal"}
                </span>
              </button>

              {/* DAFTAR ANGGOTA */}
              <button
                onClick={() => {
                  if (simulationEngineRef.current) {
                    setNpcListState(Array.from(simulationEngineRef.current.npcStates.values()));
                  }
                  setIsMemberListOpen(!isMemberListOpen);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-md active:scale-95"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>({npcListState.length + 1 + connectedPeersCount})</span>
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 backdrop-blur-md transition-all shadow-md active:scale-95"
                title="Panduan Kontrol"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* BANNER STATUS MODE PENGAWAS (HANYA MUNCUL DI POJOK KANAN BAWAH SECARA MINIMALIS & TIDAK MENUTUPI AREA TENGAH) */}
      {!isInOffice && !isCleanUIMode && (
        <div className="absolute top-20 right-3 z-10 pointer-events-auto bg-slate-900/90 border border-cyan-500/30 text-slate-200 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 text-[11px] shadow-lg animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-medium">Mode Kamera CCTV Aktif</span>
        </div>
      )}

      {/* SPATIAL PROXIMITY RADAR / PEERS (DILETAKKAN DI KIRI ATAS SECARA RAPI TANPA MENUTUP HEADER) */}
      {peersNearby.length > 0 && isInOffice && (
        <div className="absolute top-20 left-4 z-10 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 shadow-xl max-w-xs text-xs">
            <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-1.5">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Audio Spasial ({peersNearby.length} di dekat Anda)</span>
            </div>
            <div className="space-y-1">
              {peersNearby.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/40">
                  <span className="text-slate-200 font-medium truncate max-w-[130px]">{peer.name}</span>
                  <span className="text-[9px] text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800/40">
                    {peer.distance}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN SHARE NOTIFICATION */}
      {activeScreenShare && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-auto bg-blue-950/90 border border-blue-500/50 text-blue-200 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 text-xs shadow-xl">
          <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Berbagi layar ke proyektor di Meeting Room</span>
          <button
            onClick={() => setActiveScreenShare(false)}
            className="ml-2 text-rose-400 hover:text-rose-300 font-semibold underline"
          >
            Hentikan
          </button>
        </div>
      )}

      {/* SIDEBAR: MEMBER LIST (SLIDE OUT) */}
      {isMemberListOpen && (
        <div className="absolute top-20 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Daftar Anggota ({npcListState.length + 1 + connectedPeersCount})
            </h3>
            <button
              onClick={() => setIsMemberListOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md bg-slate-800"
            >
              Tutup
            </button>
          </div>

          {/* Kartu Profil Perusahaan */}
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/30 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{COMPANY_PROFILE.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mb-0.5">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>Berdiri Sejak: <strong className="text-white">{COMPANY_PROFILE.foundedDate}</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Founder: <strong className="text-amber-300">{COMPANY_PROFILE.owner}</strong> • Status: <span className="text-emerald-400 font-semibold">{COMPANY_PROFILE.status}</span>
            </p>
          </div>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {/* Player self */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/80 border border-cyan-500/40">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {playerName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">{playerName}</p>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 rounded font-semibold border border-amber-500/30">
                    Owner
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Mulai Aktif: 19 Oktober 2026, 07:00 WIB</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            </div>

            {/* Live Peer Colleagues */}
            {Array.from(peerAvatarsRef.current.entries()).map(([peerId, peerMesh]) => (
              <div key={peerId} className="flex items-center gap-3 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-xs text-white">
                  {peerMesh.userData.name ? peerMesh.userData.name[0] : "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-cyan-200 truncate">{peerMesh.userData.name}</p>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-medium border border-cyan-500/30">
                      Live Peer
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Aktif bergerak di ruang kerja</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 animate-pulse" />
              </div>
            ))}

            {/* 4 Karyawan Otonom 24 Jam dengan Status & Needs */}
            {(simulationEngineRef.current ? Array.from(simulationEngineRef.current.npcStates.values()) : npcListState).map((npc) => {
              const statusColor =
                npc.currentStatusLabel === "Bekerja"
                  ? "bg-blue-400"
                  : npc.currentStatusLabel === "Makan"
                  ? "bg-amber-400"
                  : npc.currentStatusLabel === "Meeting"
                  ? "bg-purple-400"
                  : npc.currentStatusLabel === "Istirahat" || npc.currentStatusLabel === "Ngopi"
                  ? "bg-emerald-400"
                  : npc.currentStatusLabel === "Tidur" || npc.currentStatusLabel === "Pulang"
                  ? "bg-slate-500"
                  : "bg-cyan-400";

              return (
                <div key={npc.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-colors">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-md relative"
                    style={{ backgroundColor: npc.avatarColor }}
                  >
                    {npc.name[0]}
                    {!npc.isInsideOffice && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-900 border border-slate-700 px-1 rounded-full text-slate-400">
                        Zzz
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-200 truncate">{npc.name}</p>
                      <span className="text-[9px] bg-slate-700 text-slate-300 px-1 rounded font-medium">
                        {npc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-cyan-300 font-medium">
                        {npc.currentStatusLabel}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        • {npc.personality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                      <span>Energi: {Math.round(npc.needs.energy)}%</span>
                      <span>Lapar: {Math.round(npc.needs.hunger)}%</span>
                      <span>Sosial: {Math.round(npc.needs.social)}%</span>
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${statusColor}`}
                    title={`Aktivitas: ${npc.currentStatusLabel}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CUSTOMIZE AVATAR MODAL */}
      {isCustomizing && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Kustomisasi Avatar Anda
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Nama Tampilan</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (typeof window !== "undefined") localStorage.setItem("ekalaya_name", e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Masukkan nama Anda..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Pilih Warna Baju / Outfit</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setAvatarColor(c.hex)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                        avatarColor === c.hex
                          ? "border-cyan-400 bg-cyan-950/40 text-cyan-300"
                          : "border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="truncate">{c.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Status Kerja</label>
                <div className="flex gap-2">
                  {["Available", "Busy", "Away"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setPlayerStatus(st)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        playerStatus === st
                          ? "border-cyan-400 bg-cyan-950/40 text-cyan-300"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCustomizing(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg"
              >
                Selesai & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP / CONTROLS MODAL */}
      {isHelpOpen && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Panduan Virtual Office 3D
              </h3>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800">
                Tutup
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <p className="font-semibold text-white mb-1">🎮 Navigasi & Kontrol Avatar</p>
                <p className="text-slate-400 leading-relaxed">
                  Gunakan tombol <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300 font-mono">W</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300 font-mono">A</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300 font-mono">S</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-cyan-300 font-mono">D</kbd> atau tombol Panah pada keyboard untuk berjalan bebas di sekitar kantor.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <p className="font-semibold text-white mb-1">🌐 Sinkronisasi Multi-Pengguna</p>
                <p className="text-slate-400 leading-relaxed">
                  Buka website ini di 2 tab atau jendela browser berbeda. Anda akan melihat avatar satu sama lain bergerak secara live real-time, dan chat terkirim secara langsung antar tab tanpa server luar!
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <p className="font-semibold text-white mb-1">🏢 Ruangan & Zona Kantor</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li><strong>Engineering Bay:</strong> Ruang kerja tim teknis & developer</li>
                  <li><strong>Product & Design Bay:</strong> Meja kerja desainer & manajer produk</li>
                  <li><strong>Executive Meeting Room:</strong> Ruang meeting kaca dengan proyektor</li>
                  <li><strong>Relax & Coffee Lounge:</strong> Sofa santai & mesin kopi pantry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CONTROLS DOCK (Hanya tampilkan Emote jika Clean UI Mode aktif) */}
      <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 md:gap-2 bg-slate-900/90 backdrop-blur-xl px-3 md:px-5 py-2 md:py-3 rounded-2xl md:rounded-3xl border border-slate-700/80 shadow-2xl max-w-[95vw] overflow-x-auto">
        {!isCleanUIMode && (
          <>
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all shadow-md active:scale-95 ${
                isMuted
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                  : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/25"
              }`}
              title={isMuted ? "Nyalakan Mikrofon" : "Matikan Mikrofon (Muted)"}
            >
              {isMuted ? <MicOff className="w-4 h-4 md:w-5 md:h-5 text-rose-400" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all shadow-md active:scale-95 ${
                !isVideoOn
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                  : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/25"
              }`}
              title={isVideoOn ? "Matikan Kamera" : "Nyalakan Kamera"}
            >
              {!isVideoOn ? <VideoOff className="w-4 h-4 md:w-5 md:h-5 text-rose-400" /> : <Video className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={() => setActiveScreenShare(!activeScreenShare)}
              className={`hidden sm:flex p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all shadow-md active:scale-95 ${
                activeScreenShare
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
              title="Berbagi Layar (Screen Share)"
            >
              <Monitor className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />
          </>
        )}

        {/* Emote 1: Wave */}
        <button
          onClick={() => triggerEmote("wave")}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all shadow-md active:scale-95 text-xs md:text-base flex items-center gap-1"
          title="Lambaikan Tangan (Wave)"
        >
          <span>👋</span>
          <span className="hidden lg:inline text-[10px]">Halo</span>
        </button>

        {/* Emote 2: Cheer */}
        <button
          onClick={() => triggerEmote("cheer")}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-pink-300 transition-all shadow-md active:scale-95 text-xs md:text-base flex items-center gap-1"
          title="Tepuk Tangan (Cheer)"
        >
          <span>🎉</span>
          <span className="hidden lg:inline text-[10px]">Tepuk</span>
        </button>

        {/* Emote 3: Dance Disco */}
        <button
          onClick={() => triggerEmote("dance")}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-purple-300 transition-all shadow-md active:scale-95 text-xs md:text-base flex items-center gap-1"
          title="Joget Disco (Dance)"
        >
          <span>💃</span>
          <span className="hidden lg:inline text-[10px]">Joget</span>
        </button>

        {/* Emote 4: Spin 360 */}
        <button
          onClick={() => triggerEmote("spin")}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-all shadow-md active:scale-95 text-xs md:text-base flex items-center gap-1"
          title="Putar 360 (Spin)"
        >
          <span>🌀</span>
          <span className="hidden lg:inline text-[10px]">Spin</span>
        </button>

        {/* Emote 5: Coffee Break */}
        <button
          onClick={() => triggerEmote("coffee")}
          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all shadow-md active:scale-95"
          title="Istirahat Kopi di Pantry"
        >
          <Coffee className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {!isCleanUIMode && (
          <>
            <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />

            {/* Customize Avatar Button */}
            <button
              onClick={() => setIsCustomizing(true)}
              className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
              title="Ganti Baju & Pengaturan Profil"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all shadow-md active:scale-95 ${
                isChatOpen
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
              title="Buka/Tutup Chat Kantor"
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </>
        )}
      </div>

      {/* CHAT DRAWER (Diletakkan di Kanan Bawah atau Kiri secara rapi, tanpa menutupi dock tengah) */}
      {!isCleanUIMode && isChatOpen && (
        <div className="absolute bottom-16 md:bottom-20 right-3 md:right-4 z-20 w-[92vw] sm:w-80 md:w-88 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-3.5 shadow-2xl flex flex-col h-60 md:h-72 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <MessageSquare className="w-3.5 h-3.5" />
              Obrolan Kantor Virtual
            </span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white text-[11px] px-2 py-0.5 bg-slate-800 rounded-md"
            >
              Tutup
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-2xl ${
                  msg.isSystem
                    ? "bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-[11px]"
                    : msg.isOwner
                    ? "bg-cyan-600/20 border border-cyan-500/30 ml-4 text-slate-100"
                    : "bg-slate-800/70 border border-slate-700/50 mr-4 text-slate-200"
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-cyan-400">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                )}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan untuk tim..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE MLBB-STYLE ANALOG JOYSTICK & JUMP BUTTON CONTROLS (Hanya saat isInOffice aktif) */}
      {isInOffice && (
        <>
          {/* 1. ANALOG JOYSTICK (LEFT SIDE) */}
          <div className="md:hidden absolute bottom-12 left-5 z-20 select-none touch-none">
            <div
              className="relative w-32 h-32 rounded-full bg-slate-900/60 border-2 border-cyan-500/40 backdrop-blur-md flex items-center justify-center shadow-2xl active:border-cyan-400"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = (touch.clientX - centerX) / (rect.width / 2);
                const dy = (touch.clientY - centerY) / (rect.height / 2);
                joystickVector.current = { x: Math.max(-1, Math.min(1, dx)), z: Math.max(-1, Math.min(1, dy)) };
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = (touch.clientX - centerX) / (rect.width / 2);
                const dy = (touch.clientY - centerY) / (rect.height / 2);
                joystickVector.current = { x: Math.max(-1, Math.min(1, dx)), z: Math.max(-1, Math.min(1, dy)) };
              }}
              onTouchEnd={() => {
                joystickVector.current = { x: 0, z: 0 };
              }}
            >
              {/* Inner Joystick Thumb */}
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-white/40 shadow-xl flex items-center justify-center text-white font-black text-xs transition-transform pointer-events-none"
                style={{
                  transform: `translate(${joystickVector.current.x * 24}px, ${joystickVector.current.z * 24}px)`,
                }}
              >
                🕹️
              </div>
            </div>
          </div>

          {/* 2. JUMP BUTTON & ACTION CONTROLS (RIGHT SIDE) */}
          <div className="md:hidden absolute bottom-12 right-5 z-20 flex flex-col items-center gap-2 select-none touch-none">
            {/* JUMP ACTION BUTTON (Besar ala MLBB) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); triggerJump(); }}
              onClick={triggerJump}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white/50 active:scale-90 text-white font-extrabold text-sm shadow-2xl flex flex-col items-center justify-center shadow-cyan-500/40"
            >
              <span>⏫</span>
              <span className="text-[10px] tracking-tight">LONCAT</span>
            </button>

            {/* ROTATE CAM HINT */}
            <div className="bg-slate-900/70 border border-slate-700/60 px-2 py-1 rounded-lg text-[9px] text-cyan-300 pointer-events-none">
              👆 Geser layar untuk putar kamera
            </div>
          </div>
        </>
      )}

      {/* QUICK INSTRUCTION TOOLTIP (BOTTOM RIGHT) */}
      <div className="hidden lg:flex absolute bottom-6 right-6 z-10 pointer-events-none items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <span>Geser layar / mouse untuk memutar kamera CCTV pengawas 360°</span>
      </div>

      {/* QUICK INSTRUCTION TOOLTIP (BOTTOM RIGHT) */}
      <div className="hidden lg:flex absolute bottom-6 right-6 z-10 pointer-events-none items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <span>Gunakan tombol</span>
        <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono font-bold">
          WASD
        </span>
        <span>atau</span>
        <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono font-bold">
          Panah
        </span>
        <span>untuk berjalan</span>
      </div>
    </div>
  );
}
