"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Zap,
  ArrowRight,
  ChevronRight,
  Cpu,
  Battery,
  Lock,
  Eye,
  CheckCircle2,
  Activity,
  X,
  Radio,
  Gauge,
  Volume2,
  VolumeX,
  MoveHorizontal,
  ChevronDown,
  Layers
} from "lucide-react";

// Asset Paths & Frame Counts
const DESKTOP_FRAMES = 240;
const DESKTOP_FRAME_PATH = "/frames/ezgif-frame-";

const MOBILE_FRAMES = 300;
const MOBILE_FRAME_PATH = encodeURI("/mobile view frames/ezgif-frame-");

interface HotspotData {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
  specs: { label: string; value: string }[];
  description: string;
  status: string;
}

const DESKTOP_HOTSPOTS: HotspotData[] = [
  {
    id: "lidar",
    title: "Perception Visor & LiDAR Array",
    category: "Sensors & Perception",
    x: 0.68,
    y: 0.28,
    icon: Eye,
    status: "60 FPS Active",
    specs: [
      { label: "LiDAR FOV", value: "360° Omnidirectional" },
      { label: "Detection Range", value: "40 meters" },
      { label: "Depth Mapping", value: "60 fps real-time" },
      { label: "Stereo Vision", value: "Dual RGB-D Depth" }
    ],
    description: "Solid-state multi-beam LiDAR paired with twin stereoscopic cameras for millisecond-level obstacle detection across campus."
  },
  {
    id: "cargo",
    title: "Secure Cargo Vault & Solenoid Lock",
    category: "Payload & Security",
    x: 0.30,
    y: 0.36,
    icon: Lock,
    status: "Dual Deadbolts Armed",
    specs: [
      { label: "Max Payload", value: "15 kg Heavy Duty" },
      { label: "Chamber Volume", value: "28 Liters" },
      { label: "Lock Mechanism", value: "Dual Electromagnetic Solenoids" },
      { label: "Security", value: "Anti-tamper shock telemetry" }
    ],
    description: "Pressurized composite cargo bay insulated against heat and rain, unlocked exclusively via dynamic multi-factor OTP code."
  },
  {
    id: "compute",
    title: "Neural Mainboard & SLAM Compute",
    category: "Autonomous Intelligence",
    x: 0.50,
    y: 0.49,
    icon: Cpu,
    status: "18.4 TFLOPS Online",
    specs: [
      { label: "AI Acceleration", value: "Dual Neural NPUs" },
      { label: "Reaction Time", value: "< 42 ms" },
      { label: "Localization", value: "Centimeter-accurate SLAM" },
      { label: "Data Link", value: "5G Mesh + Wi-Fi 6" }
    ],
    description: "Hardened edge computer executing real-time spatial SLAM path planning, dynamic obstacle avoidance, and encrypted fleet sync."
  },
  {
    id: "battery",
    title: "High-Density 48V LiFePO4 Pack",
    category: "Power Subsystem",
    x: 0.50,
    y: 0.31,
    icon: Battery,
    status: "95% · Optimal",
    specs: [
      { label: "Capacity", value: "1.2 kWh (48V)" },
      { label: "Continuous Runtime", value: "18 Hours Active" },
      { label: "Fast Charge", value: "0 to 80% in 35 mins" },
      { label: "Chemistry", value: "LiFePO4 Non-combustible" }
    ],
    description: "Automotive-grade modular lithium iron phosphate cells with active thermal management and automatic dock contact charging."
  },
  {
    id: "motors",
    title: "6WD Independent Hub Motors",
    category: "Chassis & Drivetrain",
    x: 0.20,
    y: 0.70,
    icon: Gauge,
    status: "Synchronized Drivetrain",
    specs: [
      { label: "Drivetrain", value: "6x Brushless Hub Motors" },
      { label: "Suspension", value: "Rocker-Bogie Articulation" },
      { label: "Max Incline", value: "35° Grade Climb" },
      { label: "Steering", value: "Zero-Turn Pivot Radius" }
    ],
    description: "Independently torqued high-traction wheels with rocker-bogie terrain absorption for pavers, ramps, and grass transitions."
  }
];

const MOBILE_HOTSPOTS: HotspotData[] = [
  {
    id: "lidar",
    title: "Perception Visor & LiDAR Array",
    category: "Sensors & Perception",
    x: 0.58,
    y: 0.30,
    icon: Eye,
    status: "60 FPS Active",
    specs: [
      { label: "LiDAR FOV", value: "360° Omnidirectional" },
      { label: "Detection Range", value: "40 meters" },
      { label: "Depth Mapping", value: "60 fps real-time" },
      { label: "Stereo Vision", value: "Dual RGB-D Depth" }
    ],
    description: "Solid-state multi-beam LiDAR paired with twin stereoscopic cameras for millisecond-level obstacle detection across campus."
  },
  {
    id: "cargo",
    title: "Secure Cargo Vault & Solenoid Lock",
    category: "Payload & Security",
    x: 0.38,
    y: 0.40,
    icon: Lock,
    status: "Dual Deadbolts Armed",
    specs: [
      { label: "Max Payload", value: "15 kg Heavy Duty" },
      { label: "Chamber Volume", value: "28 Liters" },
      { label: "Lock Mechanism", value: "Dual Electromagnetic Solenoids" },
      { label: "Security", value: "Anti-tamper shock telemetry" }
    ],
    description: "Pressurized composite cargo bay insulated against heat and rain, unlocked exclusively via dynamic multi-factor OTP code."
  },
  {
    id: "compute",
    title: "Neural Mainboard & SLAM Compute",
    category: "Autonomous Intelligence",
    x: 0.50,
    y: 0.48,
    icon: Cpu,
    status: "18.4 TFLOPS Online",
    specs: [
      { label: "AI Acceleration", value: "Dual Neural NPUs" },
      { label: "Reaction Time", value: "< 42 ms" },
      { label: "Localization", value: "Centimeter-accurate SLAM" },
      { label: "Data Link", value: "5G Mesh + Wi-Fi 6" }
    ],
    description: "Hardened edge computer executing real-time spatial SLAM path planning, dynamic obstacle avoidance, and encrypted fleet sync."
  },
  {
    id: "battery",
    title: "High-Density 48V LiFePO4 Pack",
    category: "Power Subsystem",
    x: 0.50,
    y: 0.35,
    icon: Battery,
    status: "95% · Optimal",
    specs: [
      { label: "Capacity", value: "1.2 kWh (48V)" },
      { label: "Continuous Runtime", value: "18 Hours Active" },
      { label: "Fast Charge", value: "0 to 80% in 35 mins" },
      { label: "Chemistry", value: "LiFePO4 Non-combustible" }
    ],
    description: "Automotive-grade modular lithium iron phosphate cells with active thermal management and automatic dock contact charging."
  },
  {
    id: "motors",
    title: "6WD Independent Hub Motors",
    category: "Chassis & Drivetrain",
    x: 0.28,
    y: 0.65,
    icon: Gauge,
    status: "Synchronized Drivetrain",
    specs: [
      { label: "Drivetrain", value: "6x Brushless Hub Motors" },
      { label: "Suspension", value: "Rocker-Bogie Articulation" },
      { label: "Max Incline", value: "35° Grade Climb" },
      { label: "Steering", value: "Zero-Turn Pivot Radius" }
    ],
    description: "Independently torqued high-traction wheels with rocker-bogie terrain absorption for pavers, ramps, and grass transitions."
  }
];

const CHAPTERS = [
  { id: "hero", label: "Hero", shortLabel: "01 · Hero", progress: 0.04, color: "#C6FF00" },
  { id: "chassis", label: "Chassis", shortLabel: "02 · Telemetry", progress: 0.25, color: "#3B82F6" },
  { id: "exploded", label: "Exploded", shortLabel: "03 · Breakdown", progress: 0.50, color: "#06B6D4" },
  { id: "vault", label: "OTP Vault", shortLabel: "04 · Vault", progress: 0.72, color: "#F59E0B" },
  { id: "fleet", label: "Fleet", shortLabel: "05 · Mission", progress: 0.94, color: "#10B981" }
];

export default function ScrollytellingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Device mode detection
  const [isMobile, setIsMobile] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Sound FX State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Canvas render geometry cache
  const geomRef = useRef<{
    width: number;
    height: number;
    dpr: number;
    scale: number;
    drawWidth: number;
    drawHeight: number;
    offsetX: number;
    offsetY: number;
    gradient: CanvasGradient | null;
  }>({
    width: 0,
    height: 0,
    dpr: 1,
    scale: 1,
    drawWidth: 0,
    drawHeight: 0,
    offsetX: 0,
    offsetY: 0,
    gradient: null
  });

  // Layout alignment state
  const [canvasLayout, setCanvasLayout] = useState({
    offsetX: 0,
    offsetY: 0,
    drawWidth: 0,
    drawHeight: 0,
    dpr: 1
  });

  // Animation & Lerp states
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const [displayFrame, setDisplayFrame] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Autoplay state
  const [isPlaying, setIsPlaying] = useState(false);

  // Interactive Hotspot popup
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);

  // Drag-to-rotate touch/mouse state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);

  // Chapter Menu dropdown toggle on mobile
  const [mobileChapterMenuOpen, setMobileChapterMenuOpen] = useState(false);

  // Active Total Frames & Hotspots
  const totalFrames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
  const currentHotspots = isMobile ? MOBILE_HOTSPOTS : DESKTOP_HOTSPOTS;

  // ── SOUND SYNTHESIS ENGINE ──
  const playSoundEffect = useCallback((type: "tick" | "chime" | "lock") => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "chime") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "lock") {
        osc.type = "square";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // 1. Update & Cache Canvas Geometry
  const updateCanvasGeometry = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const firstImg = imagesRef.current[0];
    const mobileDevice = w < 768;
    const isWidescreen = w >= 1024;
    const natW = firstImg?.naturalWidth || (mobileDevice ? 2160 : 1920);
    const natH = firstImg?.naturalHeight || (mobileDevice ? 3840 : 1080);

    let fitScale: number;
    let offsetX: number;
    let offsetY: number;

    if (mobileDevice) {
      // On Phone: 9:16 portrait frame is scaled so the full robot sits in the upper 60% of the screen
      fitScale = Math.min(targetW / natW, (targetH * 0.65) / natH) * 1.0;
      const drawWidth = natW * fitScale;
      const drawHeight = natH * fitScale;
      offsetX = (targetW - drawWidth) / 2;
      offsetY = 25 * dpr; // Positioned safely below the top status bar

      const gradient = ctx.createRadialGradient(
        targetW / 2,
        targetH * 0.32,
        targetW * 0.35,
        targetW / 2,
        targetH * 0.32,
        targetH * 0.65
      );
      gradient.addColorStop(0, "rgba(10, 10, 10, 0)");
      gradient.addColorStop(0.80, "rgba(10, 10, 10, 0.45)");
      gradient.addColorStop(1, "rgba(10, 10, 10, 1)");

      geomRef.current = {
        width: targetW,
        height: targetH,
        dpr,
        scale: fitScale,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
        gradient
      };

      setCanvasLayout({ offsetX, offsetY, drawWidth, drawHeight, dpr });
    } else {
      // On Desktop: Widescreen containment shifted rightward to give HUD Command Wing left staging
      fitScale = Math.min(targetW / natW, targetH / natH) * (isWidescreen ? 0.90 : 0.85);
      const drawWidth = natW * fitScale;
      const drawHeight = natH * fitScale;
      
      // Shift robot slightly to the right on wide displays to make room for left HUD
      const rightShift = isWidescreen ? targetW * 0.14 : 0;
      offsetX = (targetW - drawWidth) / 2 + rightShift;
      offsetY = (targetH - drawHeight) / 2;

      const centerX = offsetX + drawWidth / 2;
      const centerY = offsetY + drawHeight / 2;
      const minDim = Math.min(targetW, targetH);

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        minDim * 0.38,
        centerX,
        centerY,
        minDim * 0.85
      );
      gradient.addColorStop(0, "rgba(10, 10, 10, 0)");
      gradient.addColorStop(0.70, "rgba(10, 10, 10, 0.45)");
      gradient.addColorStop(1, "rgba(10, 10, 10, 1)");

      geomRef.current = {
        width: targetW,
        height: targetH,
        dpr,
        scale: fitScale,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
        gradient
      };

      setCanvasLayout({ offsetX, offsetY, drawWidth, drawHeight, dpr });
    }
  }, []);

  // 2. High-Performance Canvas Frame Draw
  const drawCanvasFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const g = geomRef.current;
    if (g.width === 0) return;

    // Fast clear
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, g.width, g.height);

    // Blit frame
    ctx.drawImage(img, g.offsetX, g.offsetY, g.drawWidth, g.drawHeight);

    // Vignette mask
    if (g.gradient) {
      ctx.fillStyle = g.gradient;
      ctx.fillRect(0, 0, g.width, g.height);
    }
  }, []);

  // 3. Initial Device Detection on Mount
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  // 4. Asset Preloading Pipeline
  useEffect(() => {
    let isCancelled = false;
    const frameCount = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
    const frameBase = isMobile ? MOBILE_FRAME_PATH : DESKTOP_FRAME_PATH;

    const loadedImages: HTMLImageElement[] = new Array(frameCount);
    let loadedCount = 0;

    setIsPreloaded(false);
    setLoadPercentage(0);

    const firstImg = new Image();
    firstImg.src = `${frameBase}001.jpg`;
    firstImg.onload = () => {
      if (!isCancelled) {
        loadedImages[0] = firstImg;
        loadedCount++;
        setLoadPercentage(Math.round((loadedCount / frameCount) * 100));
        imagesRef.current = loadedImages;
        updateCanvasGeometry();
        drawCanvasFrame(0);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      if (i === 1) continue;
      const frameNum = String(i).padStart(3, "0");
      const img = new Image();
      img.src = `${frameBase}${frameNum}.jpg`;
      img.onload = () => {
        if (!isCancelled) {
          loadedImages[i - 1] = img;
          loadedCount++;
          const pct = Math.round((loadedCount / frameCount) * 100);
          setLoadPercentage(pct);

          if (loadedCount === frameCount) {
            setIsPreloaded(true);
          }
        }
      };
      img.onerror = () => {
        if (!isCancelled) {
          loadedImages[i - 1] = loadedImages[0] || firstImg;
          loadedCount++;
        }
      };
    }

    imagesRef.current = loadedImages;

    return () => {
      isCancelled = true;
    };
  }, [isMobile, updateCanvasGeometry, drawCanvasFrame]);

  // 5. Progress to Frame Mapping
  const progressToFrame = useCallback((progress: number, maxFrames: number): number => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (clamped <= 0.12) return 0;
    if (clamped <= 0.54) {
      const t = (clamped - 0.12) / (0.54 - 0.12);
      return Math.round(t * (maxFrames - 1));
    }
    if (clamped <= 0.86) {
      const t = (clamped - 0.54) / (0.86 - 0.54);
      return Math.round((1 - t) * (maxFrames - 1));
    }
    return 0;
  }, []);

  // 6. Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (isDraggingRef.current) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTrackHeight = containerRef.current.offsetHeight - window.innerHeight;
      if (scrollTrackHeight <= 0) return;

      const progress = -rect.top / scrollTrackHeight;
      const clamped = Math.max(0, Math.min(1, progress));
      targetProgressRef.current = clamped;
      setScrollProgress(clamped);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Pause autoplay on user interaction
  useEffect(() => {
    const handleWheel = () => {
      if (isPlaying) setIsPlaying(false);
    };
    const handleTouchStart = () => {
      if (isPlaying) setIsPlaying(false);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isPlaying]);

  // 7. Smooth Lerp Animation Loop
  useEffect(() => {
    let lastRenderedFrame = -1;

    const tick = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.16;
      } else {
        currentProgressRef.current = targetProgressRef.current;
      }

      const frameCount = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
      const frame = progressToFrame(currentProgressRef.current, frameCount);
      if (frame !== lastRenderedFrame) {
        lastRenderedFrame = frame;
        drawCanvasFrame(frame);
        setDisplayFrame(frame + 1);
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isMobile, progressToFrame, drawCanvasFrame]);

  // 8. Handle Window Resize & Device Transition
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
      updateCanvasGeometry();
      const frameCount = mobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
      const currentFrame = progressToFrame(currentProgressRef.current, frameCount);
      drawCanvasFrame(currentFrame);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, updateCanvasGeometry, progressToFrame, drawCanvasFrame]);

  // 9. Autoplay Orbit Cycle
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const orbitStep = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      let nextProgress = targetProgressRef.current + deltaSec / 12;
      if (nextProgress > 1) nextProgress = 0;

      targetProgressRef.current = nextProgress;
      setScrollProgress(nextProgress);

      if (containerRef.current) {
        const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
        const scrollTrackHeight = containerRef.current.offsetHeight - window.innerHeight;
        window.scrollTo({
          top: containerTop + nextProgress * scrollTrackHeight,
          behavior: "instant" as ScrollBehavior
        });
      }

      animId = requestAnimationFrame(orbitStep);
    };

    animId = requestAnimationFrame(orbitStep);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // 10. Jump to Chapter
  const handleJumpToChapter = (chapterProgress: number) => {
    if (!containerRef.current) return;
    setIsPlaying(false);
    setActiveHotspot(null);
    setMobileChapterMenuOpen(false);
    playSoundEffect("chime");
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const scrollTrackHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerTop + chapterProgress * scrollTrackHeight;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth"
    });
  };

  // 11. Interactive Scrubber Seek Bar Click
  const handleScrubberBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setActiveHotspot(null);
    const bar = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bar.left;
    const progress = Math.max(0, Math.min(1, clickX / bar.width));
    handleJumpToChapter(progress);
  };

  // 12. Drag-to-Rotate (Pointer events with inertia)
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
    isDraggingRef.current = true;
    setIsPlaying(false);
    dragStartXRef.current = e.clientX;
    dragStartProgressRef.current = targetProgressRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const sensitivity = isMobile ? 0.0016 : 0.0012;
    const nextProgress = Math.max(0, Math.min(1, dragStartProgressRef.current - deltaX * sensitivity));
    targetProgressRef.current = nextProgress;
    setScrollProgress(nextProgress);

    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const scrollTrackHeight = containerRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: containerTop + nextProgress * scrollTrackHeight,
      behavior: "instant" as ScrollBehavior
    });
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  // Exploded Breakdown stage: active between 36% and 60%
  const isExplodedActive = scrollProgress >= 0.36 && scrollProgress < 0.60;

  // Active chapter computation
  const currentChapterIdx =
    scrollProgress < 0.14 ? 0 :
    scrollProgress < 0.36 ? 1 :
    scrollProgress < 0.60 ? 2 :
    scrollProgress < 0.84 ? 3 : 4;

  const currentChapter = CHAPTERS[currentChapterIdx];

  // Helper to calculate exact hotspot position on canvas
  const getHotspotPixelStyle = (spot: HotspotData) => {
    const { offsetX, offsetY, drawWidth, drawHeight, dpr } = canvasLayout;
    if (!drawWidth || !dpr) {
      return { left: `${spot.x * 100}%`, top: `${spot.y * 100}%` };
    }
    const leftPx = (offsetX + drawWidth * spot.x) / dpr;
    const topPx = (offsetY + drawHeight * spot.y) / dpr;
    return { left: `${leftPx}px`, top: `${topPx}px` };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#0A0A0A]"
      style={{ height: "450vh" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── STICKY CANVAS VIEWPORT CONTAINER ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A] flex items-center justify-center select-none">
        
        {/* High-DPI HTML5 Hardware-Accelerated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none z-10 will-change-transform"
        />

        {/* Dynamic Ambient Backlight Glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 -top-20 -left-20 transition-colors duration-1000"
            style={{ backgroundColor: currentChapter.color }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 bottom-0 right-0 transition-colors duration-1000"
            style={{ backgroundColor: currentChapterIdx === 2 ? "#06B6D4" : "#3B82F6" }}
          />
          <div className="grid-fade opacity-20" />
        </div>

        {/* Top/Bottom Cinematic Fade Gradients */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-28 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 inset-x-0 h-40 sm:h-36 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pointer-events-none z-20" />

        {/* ── TOP HUD BAR (TELEMETRY BADGE & AUDIO CONTROLS) ── */}
        <div className="absolute top-2.5 sm:top-5 inset-x-3 sm:inset-x-8 z-40 flex items-center justify-between pointer-events-none">
          {/* Left: Streaming Status */}
          <div className="pointer-events-auto">
            {!isPreloaded ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212]/90 backdrop-blur-xl border border-[#C6FF00]/40 shadow-lg text-[10px] text-white font-extrabold">
                <Radio className="h-3 w-3 text-[#C6FF00] animate-pulse" />
                <span>3D ASSETS: {loadPercentage}%</span>
                <div className="w-10 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-[#C6FF00] transition-all duration-200"
                    style={{ width: `${loadPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF00] animate-pulse" />
                <span className="font-extrabold text-[#C6FF00]">DSR-GO</span>
                <span className="text-white/40">|</span>
                <span>SOU CAMPUS</span>
              </div>
            )}
          </div>

          {/* Right: Audio FX & Drag Hint */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212]/70 border border-white/10 text-[10px] font-mono text-white/60">
              <MoveHorizontal className="h-3 w-3 text-[#C6FF00]" />
              <span>Drag / Scroll to Rotate 3D Model</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSoundEffect("chime");
              }}
              className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-[#C6FF00]/20 border-[#C6FF00]/60 text-[#C6FF00]"
                  : "bg-[#121212]/80 border-white/10 text-white/60 hover:text-white"
              }`}
              title={soundEnabled ? "Mute Sci-Fi Audio FX" : "Enable Sci-Fi Audio FX"}
              aria-label="Toggle Sci-Fi SFX"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* ── 3. 3D EXPLODED BREAKDOWN HUD HOTSPOTS (36% - 60%) ── */}
        <div
          className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
            isExplodedActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Top Banner Guide for Exploded View */}
          <div className="absolute top-12 sm:top-18 inset-x-4 text-center pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] text-[9px] sm:text-xs font-extrabold backdrop-blur-md shadow-lg">
              <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
              <span>EXPLODED BREAKDOWN · TAP HOTSPOT TO INSPECT</span>
            </div>
          </div>

          {currentHotspots.map((spot) => {
            const Icon = spot.icon;
            const isSelected = activeHotspot?.id === spot.id;
            const spotPos = getHotspotPixelStyle(spot);

            return (
              <div
                key={spot.id}
                style={spotPos}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveHotspot(isSelected ? null : spot);
                    playSoundEffect("chime");
                  }}
                  className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full focus:outline-none transition-transform group-hover:scale-110 cursor-pointer"
                  aria-label={spot.title}
                >
                  <span className="absolute inset-0 rounded-full bg-[#06B6D4]/30 animate-ping" />
                  <span className="absolute -inset-1 rounded-full border border-[#06B6D4]/60 animate-pulse" />
                  <div
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                      isSelected
                        ? "bg-[#06B6D4] text-[#0A0A0A] border-[#06B6D4] shadow-[0_0_15px_#06B6D4] scale-110"
                        : "bg-[#111111]/90 text-[#06B6D4] border-[#06B6D4]/80 backdrop-blur-md group-hover:border-[#06B6D4] group-hover:bg-[#06B6D4]/20"
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                </button>

                <div
                  className={`hidden sm:block absolute left-1/2 -translate-x-1/2 top-11 px-2.5 py-0.5 rounded-lg bg-[#111111]/95 border backdrop-blur-xl whitespace-nowrap text-[10px] font-extrabold tracking-wider pointer-events-none transition-all duration-200 ${
                    isSelected
                      ? "border-[#06B6D4] text-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105"
                      : "border-white/15 text-white/90 group-hover:border-[#06B6D4]/50 group-hover:text-white"
                  }`}
                >
                  {spot.title.split("&")[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── HOTSPOT DETAIL MODAL / RESPONSIVE BOTTOM SHEET ── */}
        <AnimatePresence>
          {activeHotspot && isExplodedActive && (
            <>
              <div
                onClick={() => setActiveHotspot(null)}
                className="fixed inset-0 z-35 bg-black/50 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed bottom-20 left-3 right-3 sm:absolute sm:bottom-auto sm:left-auto sm:right-auto z-40 max-w-sm w-[92vw] sm:w-[340px] p-4 sm:p-5 rounded-3xl bg-[#121212]/95 backdrop-blur-2xl border border-[#06B6D4]/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] mx-auto"
                style={{
                  ...(typeof window !== "undefined" && window.innerWidth >= 640
                    ? {
                        left: `clamp(20px, ${canvasLayout.offsetX / canvasLayout.dpr + (canvasLayout.drawWidth / canvasLayout.dpr) * activeHotspot.x}px, calc(100vw - 360px))`,
                        top: `clamp(90px, ${canvasLayout.offsetY / canvasLayout.dpr + (canvasLayout.drawHeight / canvasLayout.dpr) * activeHotspot.y}px, calc(100vh - 380px))`
                      }
                    : {})
                }}
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4]">
                      <activeHotspot.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-extrabold text-[#06B6D4] uppercase tracking-widest block">
                        {activeHotspot.category}
                      </span>
                      <h4 className="text-xs sm:text-caption font-black text-white leading-tight">
                        {activeHotspot.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(null)}
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-micro text-white/80 mt-2 leading-relaxed font-medium">
                  {activeHotspot.description}
                </p>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                  {activeHotspot.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-[#1A1A1A] border border-white/10"
                    >
                      <span className="text-[9px] font-mono uppercase text-white/50 block">
                        {spec.label}
                      </span>
                      <span className="text-micro font-extrabold text-white block mt-0.5">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 text-[10px] font-mono font-extrabold text-[#06B6D4]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
                    {activeHotspot.status}
                  </span>
                  <span className="text-white/40">DSR-Alpha 01</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── 4. MISSION COMMAND HUD WING (DESKTOP LEFT-FLANK / MOBILE ANCHORED BOTTOM COCKPIT) ── */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end sm:justify-center p-3 sm:p-8 lg:p-14 pb-16 sm:pb-8">
          
          {/* ══════════ CHAPTER 1: HERO OVERLAY (0% – 14%) ══════════ */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
              scrollProgress >= 0 && scrollProgress < 0.14
                ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
            }`}
          >
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
              
              {/* Mission Badge */}
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C6FF00]/15 border border-[#C6FF00]/30 text-[#C6FF00] text-[9px] sm:text-[10px] font-extrabold shadow-[0_0_15px_rgba(198,255,0,0.2)]">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-[#C6FF00]" />
                <span>SOU Fleet Online · Autonomous Delivery</span>
              </div>

              {/* Title Block */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="morph-wrap">
                  <span className="morph-word text-[11px] sm:text-caption font-mono font-black uppercase tracking-[0.25em] text-[#C6FF00]">
                    AUTONOMOUS
                  </span>
                  <span className="morph-word text-[11px] sm:text-caption font-mono font-black uppercase tracking-[0.25em] text-[#C6FF00]">
                    EFFORTLESS
                  </span>
                  <span className="morph-word text-[11px] sm:text-caption font-mono font-black uppercase tracking-[0.25em] text-[#C6FF00]">
                    SILENT
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight">
                  CAMPUS<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] via-[#FFE234] to-[#C6FF00]">
                    DELIVERY.
                  </span>
                </h1>
              </div>

              <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                Point-to-point courier robotics for Silver Oak University. Dispatch in seconds, track live, and unlock with dynamic OTP.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                <Link
                  href="/register"
                  className="flex-1 px-4 py-2 sm:py-2.5 rounded-full bg-[#C6FF00] text-[#0A0A0A] font-extrabold hover:shadow-[0_0_25px_#C6FF00] hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>Request Delivery</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleJumpToChapter(0.50)}
                  className="px-3.5 py-2 sm:py-2.5 rounded-full border border-white/20 text-white font-bold bg-[#1A1A1A] hover:bg-white/10 hover:border-[#C6FF00]/50 transition-all text-xs flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                >
                  <span>3D Explode</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#C6FF00]" />
                </button>
              </div>

              {/* 4-Stat Telemetry Strip */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-2 border-t border-white/10">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                  <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">Autonomous</span>
                  <span className="text-[11px] sm:text-caption font-black text-[#C6FF00] block mt-0.5">100% Edge AI</span>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                  <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">Coverage</span>
                  <span className="text-[11px] sm:text-caption font-black text-[#FFE234] block mt-0.5">6 SOU Blocks</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ CHAPTER 2: TELEMETRY & CHASSIS (14% – 36%) ══════════ */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:max-w-[400px] transition-all duration-500 pointer-events-none ${
              scrollProgress >= 0.14 && scrollProgress < 0.36
                ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
            }`}
          >
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#3B82F6] uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#3B82F6] animate-pulse" />
                  02 · Telemetry Stream
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#1A1A1A] border border-white/10 text-white/80">
                  DSR-Alpha 01
                </span>
              </div>

              <h2 className="text-micro sm:text-title font-black text-white leading-tight">
                Everything, one glance.
              </h2>
              
              <p className="text-[11px] sm:text-caption text-white/75 leading-relaxed font-medium">
                Live sensor feed, active weight sensing, and battery telemetry streamed in real-time.
              </p>

              <div className="space-y-1.5 sm:space-y-2 pt-0.5">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between">
                  <span className="text-micro font-semibold text-white/70">LiFePO4 Power Cell</span>
                  <span className="text-micro font-black text-[#C6FF00]">95% (18h Runtime)</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between">
                  <span className="text-micro font-semibold text-white/70">Payload Chamber</span>
                  <span className="text-micro font-black text-white">15kg Heavy-Duty</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between">
                  <span className="text-micro font-semibold text-white/70">Neural SLAM Link</span>
                  <span className="text-micro font-black text-[#3B82F6]">&lt;42ms Latency</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ CHAPTER 3: EXPLODED BREAKDOWN LIST (36% – 60%) ══════════ */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:max-w-[400px] transition-all duration-500 pointer-events-none hidden lg:block ${
              scrollProgress >= 0.36 && scrollProgress < 0.60
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-12 pointer-events-none absolute"
            }`}
          >
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212]/90 backdrop-blur-2xl border border-[#06B6D4]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2.5">
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#06B6D4] uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#06B6D4] animate-pulse" />
                  03 · Modular Subsystems
                </span>
                <span className="text-[9px] font-mono text-white/50">5 Units Armed</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {currentHotspots.map((spot) => {
                  const isSelected = activeHotspot?.id === spot.id;
                  const Icon = spot.icon;

                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        setActiveHotspot(isSelected ? null : spot);
                        playSoundEffect("chime");
                      }}
                      className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#06B6D4]/20 border-[#06B6D4] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : "bg-[#181818] border-white/10 text-white/80 hover:border-white/30 hover:bg-[#202020]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-[#06B6D4]" />
                        <span className="text-micro font-bold">{spot.title.split("&")[0]}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#06B6D4] font-extrabold">{spot.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══════════ CHAPTER 4: OTP VAULT UNLOCK (60% – 84%) ══════════ */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:max-w-[400px] transition-all duration-500 pointer-events-none ${
              scrollProgress >= 0.60 && scrollProgress < 0.84
                ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
            }`}
          >
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#F59E0B]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#F59E0B] uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#F59E0B]" />
                  04 · Dynamic OTP Vault
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                  Armed
                </span>
              </div>

              <h2 className="text-micro sm:text-title font-black text-white leading-tight">
                Verify, then it opens.
              </h2>
              
              <p className="text-[11px] sm:text-caption text-white/75 leading-relaxed font-medium">
                Dual electromagnetic deadbolts stay hermetically sealed until recipient inputs 4-digit code.
              </p>

              {/* OTP Keypad Simulation */}
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#181818] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/60">
                  <span>RECIPIENT PASSCODE</span>
                  <span className="text-[#F59E0B] font-bold">MATCH CONFIRMED</span>
                </div>
                <div className="flex items-center justify-around gap-1.5">
                  {["7", "4", "1", "9"].map((digit, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-9 sm:w-8 sm:h-10 rounded-xl bg-[#121212] border border-[#F59E0B]/60 flex items-center justify-center font-mono font-black text-micro sm:text-title text-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ CHAPTER 5: MISSION READY & FINAL DISPATCH (84% – 100%) ══════════ */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
              scrollProgress >= 0.84
                ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
            }`}
          >
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/95 backdrop-blur-2xl border border-[#10B981]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-2 sm:space-y-3">
              
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[9px] sm:text-[10px] font-extrabold">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#10B981]" />
                <span>05 · Reassembled &amp; Mission Ready</span>
              </div>

              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                The whole fleet, at your command.
              </h2>

              <p className="text-[11px] sm:text-caption text-white/75 leading-relaxed font-medium">
                DSR Go autonomous campus delivery system is fully operational across Silver Oak blocks.
              </p>

              <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                <Link
                  href="/register"
                  className="flex-1 px-4 py-2 sm:py-2.5 rounded-full bg-[#C6FF00] text-[#0A0A0A] font-extrabold hover:shadow-[0_0_25px_#C6FF00] hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>Dispatch Bot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#dashboard"
                  className="px-3.5 py-2 sm:py-2.5 rounded-full border border-white/20 text-white font-bold bg-[#181818] hover:bg-white/10 hover:border-[#C6FF00]/40 transition-all text-xs flex items-center justify-center space-x-1 shrink-0"
                >
                  <span>Explore UI</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#C6FF00]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. RESPONSIVE FLOATING TIMELINE SCRUBBER CAPSULE ── */}
        <div
          className={`absolute bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-fit max-w-[calc(100vw-20px)] transition-opacity duration-300 ${
            scrollProgress > 0.94 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="px-2 py-1 sm:px-4 sm:py-2.5 rounded-full bg-[#121212]/95 backdrop-blur-2xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Play/Pause Orbit Button */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(!isPlaying);
                playSoundEffect("tick");
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#1A1A1A] hover:bg-[#C6FF00]/20 border border-white/15 hover:border-[#C6FF00]/40 text-white text-[10px] sm:text-micro font-mono font-extrabold transition-all shrink-0 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 text-[#C6FF00]" />
                  <span className="hidden sm:inline">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-[#C6FF00]" />
                  <span className="hidden sm:inline">ORBIT</span>
                </>
              )}
            </button>

            {/* Mobile Chapter Selector Dropdown Pill */}
            <div className="relative sm:hidden">
              <button
                type="button"
                onClick={() => setMobileChapterMenuOpen(!mobileChapterMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-white/15 text-[10px] font-extrabold text-white cursor-pointer"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: currentChapter.color }}
                />
                <span>{currentChapter.label}</span>
                <ChevronDown className="h-3 w-3 text-white/60" />
              </button>

              <AnimatePresence>
                {mobileChapterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-36 py-1.5 rounded-2xl bg-[#161616]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 flex flex-col gap-1"
                  >
                    {CHAPTERS.map((ch, idx) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleJumpToChapter(ch.progress)}
                        className={`px-3 py-1 text-left text-[11px] font-bold flex items-center justify-between transition-colors ${
                          currentChapterIdx === idx
                            ? "text-[#C6FF00] bg-white/5"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span>{ch.label}</span>
                        {currentChapterIdx === idx && (
                          <span className="h-1 w-1 rounded-full bg-[#C6FF00]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Frame Counter */}
            <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-white/10 text-[10px] sm:text-micro font-mono text-[#C6FF00] font-extrabold tracking-wider shrink-0">
              <span className="hidden sm:inline">FRM </span>{String(displayFrame).padStart(3, "0")} <span className="hidden md:inline">/ {totalFrames}</span>
            </div>

            {/* Chapter Jump Tabs (Desktop sm+) */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {CHAPTERS.map((ch, i) => {
                const isActive = currentChapterIdx === i;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleJumpToChapter(ch.progress)}
                    className={`px-2.5 py-1 rounded-full text-micro font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#C6FF00] text-[#0A0A0A] shadow-[0_0_12px_#C6FF00] scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>

            {/* Scrub Seek Bar (desktop) */}
            <div
              onClick={handleScrubberBarClick}
              className="hidden md:flex items-center gap-2 shrink-0 cursor-pointer group pl-1"
              title="Click to seek"
            >
              <span className="text-[10px] font-mono text-white/60 font-extrabold w-7 text-right">
                {Math.round(scrollProgress * 100)}%
              </span>
              <div className="w-14 h-1.5 rounded-full bg-white/20 overflow-hidden group-hover:h-2 transition-all">
                <div
                  className="h-full bg-[#C6FF00] rounded-full"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
