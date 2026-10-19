"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { buildOfficeScene, createBlockyAvatar } from "@/lib/officeBuilder";
import { INITIAL_BOTS, OFFICE_ZONES, AVATAR_COLORS } from "@/lib/mockData";
import { PeerNetwork } from "@/lib/peerNetwork";
import {
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
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
} from "lucide-react";
import confetti from "canvas-confetti";

export default function VirtualOffice() {
  const containerRef = useRef(null);

  // User state
  const [userId, setUserId] = useState("user_init");
  const [playerName, setPlayerName] = useState("Raja (Owner)");
  const [playerStatus, setPlayerStatus] = useState("Available"); // Available | Busy | Away
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].hex);
  const [currentZone, setCurrentZone] = useState("Lobi Kantor");
  const [peersNearby, setPeersNearby] = useState([]);
  const [connectedPeersCount, setConnectedPeersCount] = useState(0);
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
      const randomBot = INITIAL_BOTS[Math.floor(Math.random() * INITIAL_BOTS.length)];
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

    // BUILD PLAYER AVATAR
    const player = createBlockyAvatar({
      name: playerName,
      color: avatarColor,
      hatColor: "#0284c7",
      isPlayer: true,
      status: playerStatus,
    });
    player.position.set(0, 0, 8);
    scene.add(player);
    playerAvatarRef.current = player;

    // BUILD INITIAL BOTS
    const botMap = new Map();
    INITIAL_BOTS.forEach((botData) => {
      const botMesh = createBlockyAvatar({
        name: botData.name,
        color: botData.color,
        hatColor: botData.hatColor,
        isPlayer: false,
        status: botData.status,
      });
      botMesh.position.set(botData.position.x, botData.position.y, botData.position.z);
      botMesh.rotation.y = botData.rotation;
      botMesh.userData.action = botData.action;
      botMesh.userData.originalZ = botData.position.z;
      botMesh.userData.originalX = botData.position.x;
      botMesh.userData.role = botData.role;
      botMesh.userData.task = botData.task;
      scene.add(botMesh);
      botMap.set(botData.id, botMesh);
    });
    botsRef.current = botMap;

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
    };

    const handlePointerMove = (e) => {
      if (!isDraggingCamera.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      // Orbit angles: theta (horizontal), phi (vertical)
      cameraAngle.current.theta -= dx * 0.007;
      cameraAngle.current.phi = Math.max(0.15, Math.min(1.2, cameraAngle.current.phi + dy * 0.005));
    };

    const handlePointerUp = () => {
      isDraggingCamera.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

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
          // Emote animations
          if (player.userData.action === "waving") {
            player.userData.waveTimer--;
            player.userData.rightArmPivot.rotation.x = 0;
            player.userData.rightArmPivot.rotation.z = Math.sin(time * 15) * 0.5 + 2.5;
            if (player.userData.waveTimer <= 0) {
              player.userData.action = "idle";
              player.userData.rightArmPivot.rotation.z = 0;
            }
          } else if (player.userData.action === "cheer") {
            player.userData.cheerTimer--;
            player.userData.leftArmPivot.rotation.z = -2.3 + Math.sin(time * 20) * 0.3;
            player.userData.rightArmPivot.rotation.z = 2.3 + Math.sin(time * 20) * 0.3;
            if (player.userData.cheerTimer <= 0) {
              player.userData.action = "idle";
              player.userData.leftArmPivot.rotation.z = 0;
              player.userData.rightArmPivot.rotation.z = 0;
            }
          } else if (player.userData.action === "dance") {
            player.userData.danceTimer--;
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
            player.rotation.y += delta * 12; // 360 fast spin
            if (player.userData.spinTimer <= 0) {
              player.userData.action = "idle";
            }
          } else {
            player.userData.leftLegPivot.rotation.x = THREE.MathUtils.lerp(player.userData.leftLegPivot.rotation.x, 0, 0.2);
            player.userData.rightLegPivot.rotation.x = THREE.MathUtils.lerp(player.userData.rightLegPivot.rotation.x, 0, 0.2);
            player.userData.leftArmPivot.rotation.x = THREE.MathUtils.lerp(player.userData.leftArmPivot.rotation.x, 0, 0.2);
            player.userData.rightArmPivot.rotation.x = THREE.MathUtils.lerp(player.userData.rightArmPivot.rotation.x, 0, 0.2);
            player.userData.leftArmPivot.rotation.z = THREE.MathUtils.lerp(player.userData.leftArmPivot.rotation.z, 0, 0.2);
            player.userData.rightArmPivot.rotation.z = THREE.MathUtils.lerp(player.userData.rightArmPivot.rotation.z, 0, 0.2);
          }
        }

        // Spherical Orbit Camera relative to player (Roblox style rotation)
        const camDistance = 11.0 * zoomLevel;
        const theta = cameraAngle.current.theta;
        const phi = cameraAngle.current.phi;

        const targetCamX = player.position.x + camDistance * Math.sin(theta) * Math.cos(phi);
        const targetCamY = player.position.y + camDistance * Math.sin(phi) + 1.5;
        const targetCamZ = player.position.z + camDistance * Math.cos(theta) * Math.cos(phi);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.12);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.12);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.12);
        camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

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

      // 3. Animate Bots
      botsRef.current.forEach((botMesh) => {
        if (botMesh.userData.action === "typing") {
          botMesh.userData.leftArmPivot.rotation.x = -1.2 + Math.sin(time * 8) * 0.1;
          botMesh.userData.rightArmPivot.rotation.x = -1.2 + Math.cos(time * 8) * 0.1;
        } else if (botMesh.userData.action === "sitting") {
          botMesh.position.y = -0.3;
          botMesh.userData.leftLegPivot.rotation.x = -Math.PI / 2;
          botMesh.userData.rightLegPivot.rotation.x = -Math.PI / 2;
        } else {
          botMesh.userData.torso.position.y = 1.05 + Math.sin(time * 2) * 0.02;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
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

      {/* TOP HEADER: BRAND, STATUS, ZONE */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {!isCleanUIMode ? (
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 shadow-xl pointer-events-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/25 text-white">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">EKALAYA 3D OFFICE</h1>
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wifi className="w-3 h-3 animate-pulse" />
                  LIVE SYNC
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zona: <strong className="text-cyan-300">{currentZone}</strong></span>
              </div>
            </div>
          </div>
        ) : <div />}

        {/* TOP RIGHT: CONTROLS & WORKSPACE INFO */}
        <div className="flex items-center gap-1.5 md:gap-2.5 pointer-events-auto">
          {/* TOGGLE CLEAN UI (Sembunyikan semua UI kecuali kontrol gerak & emote) */}
          <button
            onClick={() => setIsCleanUIMode(!isCleanUIMode)}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95 ${
              isCleanUIMode
                ? "bg-cyan-500 text-white shadow-cyan-500/30 border border-cyan-400"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60"
            }`}
            title={isCleanUIMode ? "Tampilkan Semua UI" : "Sembunyikan UI (Fokus Gerak & Emote)"}
          >
            {isCleanUIMode ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isCleanUIMode ? "Tampilkan UI" : "Sembunyikan UI"}</span>
          </button>

          {!isCleanUIMode && (
            <>
              {/* FULLSCREEN TOGGLE (Menghilangkan URL bar) */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95"
                title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh (Fullscreen)"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4 text-emerald-400" /> : <Maximize className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{isFullscreen ? "Normal" : "Fullscreen"}</span>
              </button>

              {/* DAY / NIGHT MODE TOGGLE */}
              <button
                onClick={() => setIsDayMode(!isDayMode)}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95 ${
                  isDayMode
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-900/80 text-slate-200 border border-slate-700/60 hover:bg-slate-800"
                }`}
                title={isDayMode ? "Ubah ke Mode Malam" : "Ubah ke Mode Siang"}
              >
                {isDayMode ? <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} /> : <Moon className="w-4 h-4 text-cyan-300" />}
                <span className="hidden sm:inline">{isDayMode ? "Siang" : "Malam"}</span>
              </button>

              {/* ZOOM LEVEL / VIEW ANGLE TOGGLE */}
              <button
                onClick={() => {
                  if (zoomLevel === 1) setZoomLevel(1.5);
                  else if (zoomLevel === 1.5) setZoomLevel(0.7);
                  else setZoomLevel(1);
                }}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95"
                title="Ubah Jarak Pandang (Lebar / Normal / Dekat)"
              >
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {zoomLevel === 1.5 ? "Pandangan: Luas" : zoomLevel === 0.7 ? "Pandangan: Dekat" : "Pandangan: Normal"}
                </span>
                <span className="sm:hidden text-[10px] text-cyan-300 font-mono">
                  {zoomLevel === 1.5 ? "Wide" : zoomLevel === 0.7 ? "Close" : "1x"}
                </span>
              </button>

              <button
                onClick={handleCopyInvite}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95"
                title="Salin link undangan untuk rekan tim"
              >
                {inviteCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Undang</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsMemberListOpen(!isMemberListOpen)}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md text-xs font-semibold transition-all shadow-lg active:scale-95"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Anggota ({INITIAL_BOTS.length + 1 + connectedPeersCount})</span>
                <span className="sm:hidden text-xs">{INITIAL_BOTS.length + 1 + connectedPeersCount}</span>
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 backdrop-blur-md transition-all shadow-lg active:scale-95"
                title="Panduan Kontrol & Informasi"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* SPATIAL PROXIMITY RADAR / NEARBY PEERS */}
      {peersNearby.length > 0 && (
        <div className="absolute top-20 left-4 z-10 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-xs text-xs">
            <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Audio Spasial Aktif ({peersNearby.length} di dekat Anda)</span>
            </div>
            <div className="space-y-1.5">
              {peersNearby.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-200 font-medium truncate max-w-[140px]">{peer.name}</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {peer.distance}m (Terdengar Jelas)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN SHARE / PRESENTATION MODE NOTIFICATION */}
      {activeScreenShare && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-auto bg-blue-950/90 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-3 text-xs shadow-2xl">
          <Monitor className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Anda sedang berbagi layar ke proyektor di <strong>Executive Meeting Room</strong></span>
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
              Daftar Anggota ({INITIAL_BOTS.length + 1 + connectedPeersCount})
            </h3>
            <button
              onClick={() => setIsMemberListOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md bg-slate-800"
            >
              Tutup
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
                <p className="text-[10px] text-slate-400 truncate">Status: {playerStatus}</p>
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

            {/* Bots / Colleagues */}
            {INITIAL_BOTS.map((bot) => (
              <div key={bot.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: bot.color }}
                >
                  {bot.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-200 truncate">{bot.name}</p>
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-1 rounded font-medium">
                      {bot.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{bot.task}</p>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    bot.status === "Available"
                      ? "bg-emerald-400"
                      : bot.status === "Busy"
                      ? "bg-rose-400"
                      : "bg-amber-400"
                  }`}
                />
              </div>
            ))}
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

      {/* CHAT DRAWER */}
      {!isCleanUIMode && isChatOpen && (
        <div className="absolute bottom-16 md:bottom-24 left-3 right-3 md:right-auto md:left-4 z-20 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-3.5 md:p-4 shadow-2xl flex flex-col h-64 md:h-80 transition-all animate-in fade-in slide-in-from-bottom-4">
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

      {/* MOBILE MLBB-STYLE ANALOG JOYSTICK & JUMP BUTTON CONTROLS */}
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
