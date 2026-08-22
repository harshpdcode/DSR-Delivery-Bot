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
  Layers,
  Package,
  Navigation,
  KeyRound,
  Sparkles,
  Repeat
} from "lucide-react";

// ── Asset Paths & Frame Counts ──
export type AnimationMode = "process" | "hardware";

// Mode 1: 1088 Frames Process Story (all-frames-combined)
const PROCESS_FRAMES = 1088;
const PROCESS_FRAME_PATH = "/process-frames/frame-";

// Mode 2: 3D Hardware Anatomy (dsr video image)
const HARDWARE_DESKTOP_FRAMES = 240;
const HARDWARE_DESKTOP_FRAME_PATH = "/frames/ezgif-frame-";

const HARDWARE_MOBILE_FRAMES = 300;
const HARDWARE_MOBILE_FRAME_PATH = encodeURI("/mobile view frames/ezgif-frame-");

// Hotspot definition for Hardware Mode
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

// ── Chapters for Mode 1: Live Delivery Process Story (1088 frames) ──
const PROCESS_CHAPTERS = [
  { id: "arrival", label: "Arrival", shortLabel: "01 · Bot Arrival", progress: 0.05, color: "#39B54A", title: "Robot Arrival", icon: Zap },
  { id: "loading", label: "Intake", shortLabel: "02 · Parcel Intake", progress: 0.24, color: "#3B82F6", title: "Parcel Loaded", icon: Package },
  { id: "transit", label: "Transit", shortLabel: "03 · Campus Transit", progress: 0.48, color: "#06B6D4", title: "Autonomous Transit", icon: Navigation },
  { id: "otp", label: "OTP Unlock", shortLabel: "04 · Recipient OTP", progress: 0.70, color: "#E49A45", title: "OTP Input", icon: KeyRound },
  { id: "retrieval", label: "Retrieval", shortLabel: "05 · Hatch Release", progress: 0.86, color: "#39B54A", title: "Parcel Collected", icon: Lock },
  { id: "loop", label: "Loop Reset", shortLabel: "06 · Fleet Loop", progress: 0.98, color: "#39B54A", title: "Ready for Next Trip", icon: Repeat }
];

// ── Chapters for Mode 2: 3D Bot Anatomy & Hardware (240/300 frames) ──
const HARDWARE_CHAPTERS = [
  { id: "hero", label: "Hero", shortLabel: "01 · Hero", progress: 0.04, color: "#C6FF00", title: "Campus Delivery", icon: Zap },
  { id: "chassis", label: "Chassis", shortLabel: "02 · Telemetry", progress: 0.25, color: "#3B82F6", title: "Telemetry Stream", icon: Activity },
  { id: "exploded", label: "Exploded", shortLabel: "03 · Breakdown", progress: 0.50, color: "#06B6D4", title: "Modular Subsystems", icon: Layers },
  { id: "vault", label: "OTP Vault", shortLabel: "04 · Vault", progress: 0.72, color: "#F59E0B", title: "Dynamic OTP Vault", icon: Lock },
  { id: "fleet", label: "Fleet", shortLabel: "05 · Mission", progress: 0.94, color: "#10B981", title: "Mission Ready", icon: CheckCircle2 }
];

export default function ScrollytellingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Mode Toggle: "process" (1088 frames story) vs "hardware" (240 frames 3D anatomy)
  const [animationMode, setAnimationMode] = useState<AnimationMode>("process");

  // Device mode detection
  const [isMobile, setIsMobile] = useState(false);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Independent Cache Buffers
  const processImagesRef = useRef<HTMLImageElement[]>([]);
  const hardwareImagesRef = useRef<HTMLImageElement[]>([]);

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

  // Interactive Hotspot popup (for hardware mode)
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);

  // Drag-to-rotate touch/mouse state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);

  // Chapter Menu dropdown toggle on mobile
  const [mobileChapterMenuOpen, setMobileChapterMenuOpen] = useState(false);

  // Active Total Frames & Chapters
  const totalFrames =
    animationMode === "process"
      ? PROCESS_FRAMES
      : isMobile
      ? HARDWARE_MOBILE_FRAMES
      : HARDWARE_DESKTOP_FRAMES;

  const currentChapters =
    animationMode === "process" ? PROCESS_CHAPTERS : HARDWARE_CHAPTERS;
  const currentHotspots = isMobile ? MOBILE_HOTSPOTS : DESKTOP_HOTSPOTS;

  // ── SOUND SYNTHESIS ENGINE ──
  const playSoundEffect = useCallback(
    (type: "tick" | "chime" | "lock" | "switch") => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioCtx =
            window.AudioContext || (window as any).webkitAudioContext;
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
        } else if (type === "switch") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.16);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
        }
      } catch {
        // Audio fallback
      }
    },
    [soundEnabled]
  );

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

    const activeImages =
      animationMode === "process"
        ? processImagesRef.current
        : hardwareImagesRef.current;
    const firstImg = activeImages[0];
    const mobileDevice = w < 768;
    const isWidescreen = w >= 1024;

    const natW =
      firstImg?.naturalWidth ||
      (animationMode === "process"
        ? 1280
        : mobileDevice
        ? 2160
        : 1920);
    const natH =
      firstImg?.naturalHeight ||
      (animationMode === "process"
        ? 720
        : mobileDevice
        ? 3840
        : 1080);

    let fitScale: number;
    let offsetX: number;
    let offsetY: number;

    if (mobileDevice) {
      if (animationMode === "process") {
        // On Phone: Fit full width cleanly (100% contain to width) so zero robot details/cameras are cropped
        fitScale = targetW / natW;
        const drawWidth = targetW;
        const drawHeight = natH * fitScale;
        
        offsetX = 0;
        // Position comfortably in upper half so it hovers directly above the bottom HUD telemetry cards
        offsetY = Math.max(12, (targetH * 0.44) - (drawHeight / 2));

        geomRef.current = {
          width: targetW,
          height: targetH,
          dpr,
          scale: fitScale,
          drawWidth,
          drawHeight,
          offsetX,
          offsetY,
          gradient: null
        };

        setCanvasLayout({ offsetX, offsetY, drawWidth, drawHeight, dpr });
      } else {
        // Mobile 3D Hardware Anatomy: Contain to width
        fitScale = targetW / natW;
        const drawWidth = targetW;
        const drawHeight = natH * fitScale;
        offsetX = 0;
        offsetY = Math.max(0, (targetH - drawHeight) * 0.20);

        const gradient = ctx.createRadialGradient(
          targetW / 2,
          targetH * 0.35,
          targetW * 0.40,
          targetW / 2,
          targetH * 0.35,
          targetH * 0.70
        );
        gradient.addColorStop(0, "rgba(10, 10, 10, 0)");
        gradient.addColorStop(0.85, "rgba(10, 10, 10, 0.40)");
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
    } else {
      // Desktop & Tablet: Scale to fit with room for HUD overlay
      fitScale =
        Math.min(targetW / natW, targetH / natH) *
        (isWidescreen ? 0.90 : 0.85);
      const drawWidth = natW * fitScale;
      const drawHeight = natH * fitScale;

      // In hardware mode with exploded view, give HUD staging room. In process mode, center nicely.
      const rightShift =
        animationMode === "hardware" && isWidescreen
          ? targetW * 0.14
          : isWidescreen
          ? targetW * 0.08
          : 0;

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
  }, [animationMode]);

  // 2. Fast Frame Blit with Nearest Fallback (Prevents blank flashes during fast seek)
  const drawCanvasFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const activeImages =
        animationMode === "process"
          ? processImagesRef.current
          : hardwareImagesRef.current;

      if (!activeImages || activeImages.length === 0) return;

      const clampedIndex = Math.max(0, Math.min(activeImages.length - 1, frameIndex));
      let img = activeImages[clampedIndex];

      // If requested frame isn't loaded yet during rapid scrub, find closest loaded neighbor
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset < 120; offset++) {
          const prevIdx = clampedIndex - offset;
          if (prevIdx >= 0) {
            const prev = activeImages[prevIdx];
            if (prev && prev.complete && prev.naturalWidth > 0) {
              img = prev;
              break;
            }
          }
          const nextIdx = clampedIndex + offset;
          if (nextIdx < activeImages.length) {
            const next = activeImages[nextIdx];
            if (next && next.complete && next.naturalWidth > 0) {
              img = next;
              break;
            }
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) {
        img = activeImages[0];
      }

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
    },
    [animationMode]
  );

  // 3. Initial Device Detection on Mount
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  // 4. Multi-Tier High-Performance Asset Preloader
  useEffect(() => {
    let isCancelled = false;

    if (animationMode === "process") {
      // ── Preload 1088 Process Story Frames ──
      const frameCount = PROCESS_FRAMES;
      const frameBase = PROCESS_FRAME_PATH;

      // If already preloaded in cache, reuse immediately
      if (
        processImagesRef.current.length === frameCount &&
        processImagesRef.current[0]?.complete
      ) {
        setIsPreloaded(true);
        setLoadPercentage(100);
        updateCanvasGeometry();
        drawCanvasFrame(0);
        return;
      }

      const loadedImages: HTMLImageElement[] = new Array(frameCount);
      let loadedCount = 0;

      setIsPreloaded(false);
      setLoadPercentage(0);

      // Tier 1: Load Frame 1 immediately
      const firstImg = new Image();
      firstImg.src = `${frameBase}0001.jpg`;
      firstImg.onload = () => {
        if (!isCancelled) {
          loadedImages[0] = firstImg;
          loadedCount++;
          processImagesRef.current = loadedImages;
          updateCanvasGeometry();
          drawCanvasFrame(0);
        }
      };

      // Tier 2: Priority Load Keyframes every 4th frame for instant scrub response
      const keyframeIndices: number[] = [];
      const remainingIndices: number[] = [];

      for (let i = 2; i <= frameCount; i++) {
        if (i % 4 === 1 || i === frameCount) {
          keyframeIndices.push(i);
        } else {
          remainingIndices.push(i);
        }
      }

      const loadSingleFrame = (frameNumVal: number, onDone?: () => void) => {
        const frameNum = String(frameNumVal).padStart(4, "0");
        const img = new Image();
        img.src = `${frameBase}${frameNum}.jpg`;
        img.onload = () => {
          if (!isCancelled) {
            loadedImages[frameNumVal - 1] = img;
            loadedCount++;
            const pct = Math.round((loadedCount / frameCount) * 100);
            setLoadPercentage(pct);

            if (loadedCount >= Math.floor(frameCount * 0.25)) {
              setIsPreloaded(true);
            }
            if (onDone) onDone();
          }
        };
        img.onerror = () => {
          if (!isCancelled) {
            loadedImages[frameNumVal - 1] = loadedImages[0] || firstImg;
            loadedCount++;
            if (onDone) onDone();
          }
        };
      };

      // Load Keyframes first in parallel batches
      keyframeIndices.forEach((fNum) => loadSingleFrame(fNum));

      // Stream remaining frames smoothly
      let streamIdx = 0;
      const batchSize = 12;

      const streamNextBatch = () => {
        if (isCancelled || streamIdx >= remainingIndices.length) return;
        const end = Math.min(streamIdx + batchSize, remainingIndices.length);
        for (let k = streamIdx; k < end; k++) {
          loadSingleFrame(remainingIndices[k]);
        }
        streamIdx = end;
        if (streamIdx < remainingIndices.length) {
          setTimeout(streamNextBatch, 30);
        }
      };

      setTimeout(streamNextBatch, 100);
      processImagesRef.current = loadedImages;
    } else {
      // ── Preload 240/300 3D Hardware Frames ──
      const frameCount = isMobile
        ? HARDWARE_MOBILE_FRAMES
        : HARDWARE_DESKTOP_FRAMES;
      const frameBase = isMobile
        ? HARDWARE_MOBILE_FRAME_PATH
        : HARDWARE_DESKTOP_FRAME_PATH;

      if (
        hardwareImagesRef.current.length === frameCount &&
        hardwareImagesRef.current[0]?.complete
      ) {
        setIsPreloaded(true);
        setLoadPercentage(100);
        updateCanvasGeometry();
        drawCanvasFrame(0);
        return;
      }

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
          hardwareImagesRef.current = loadedImages;
          updateCanvasGeometry();
          drawCanvasFrame(0);
        }
      };

      for (let i = 2; i <= frameCount; i++) {
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

      hardwareImagesRef.current = loadedImages;
    }

    return () => {
      isCancelled = true;
    };
  }, [animationMode, isMobile, updateCanvasGeometry, drawCanvasFrame]);

  // 5. Progress to Frame Mapping
  const progressToFrame = useCallback(
    (progress: number, maxFrames: number, mode: AnimationMode): number => {
      const clamped = Math.max(0, Math.min(1, progress));

      if (mode === "process") {
        // Linear continuous lifecycle story mapping (1088 frames)
        return Math.min(maxFrames - 1, Math.floor(clamped * (maxFrames - 1)));
      } else {
        // Hardware mode 3D exploded breakdown curve (240 / 300 frames)
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
      }
    },
    []
  );

  // 6. Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (isDraggingRef.current) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTrackHeight =
        containerRef.current.offsetHeight - window.innerHeight;
      if (scrollTrackHeight <= 0) return;

      const progress = -rect.top / scrollTrackHeight;
      const clamped = Math.max(0, Math.min(1, progress));
      targetProgressRef.current = clamped;
      setScrollProgress(clamped);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
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

  // 7. Smooth Lerp Animation Loop (60 FPS)
  useEffect(() => {
    let lastRenderedFrame = -1;

    const tick = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.18;
      } else {
        currentProgressRef.current = targetProgressRef.current;
      }

      const frameCount = totalFrames;
      const frame = progressToFrame(
        currentProgressRef.current,
        frameCount,
        animationMode
      );

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
  }, [animationMode, totalFrames, progressToFrame, drawCanvasFrame]);

  // 8. Handle Window Resize & Device Transition
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
      updateCanvasGeometry();
      const frameCount = totalFrames;
      const currentFrame = progressToFrame(
        currentProgressRef.current,
        frameCount,
        animationMode
      );
      drawCanvasFrame(currentFrame);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, totalFrames, animationMode, updateCanvasGeometry, progressToFrame, drawCanvasFrame]);

  // 9. Autoplay Orbit / Playback Cycle
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const orbitStep = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // Orbit speed: 18s for 1088 process frames, 12s for 240 hardware frames
      const cycleDuration = animationMode === "process" ? 18 : 12;
      let nextProgress = targetProgressRef.current + deltaSec / cycleDuration;
      if (nextProgress > 1) nextProgress = 0;

      targetProgressRef.current = nextProgress;
      setScrollProgress(nextProgress);

      if (containerRef.current) {
        const containerTop =
          containerRef.current.getBoundingClientRect().top + window.scrollY;
        const scrollTrackHeight =
          containerRef.current.offsetHeight - window.innerHeight;
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
  }, [isPlaying, animationMode]);

  // 10. Mode Switch Toggle Handler
  const handleToggleMode = (newMode: AnimationMode) => {
    if (newMode === animationMode) return;
    playSoundEffect("switch");
    setAnimationMode(newMode);
    setActiveHotspot(null);

    // Re-draw immediately with target mode's frame 0
    setTimeout(() => {
      updateCanvasGeometry();
      const currentFrame = progressToFrame(
        currentProgressRef.current,
        newMode === "process"
          ? PROCESS_FRAMES
          : isMobile
          ? HARDWARE_MOBILE_FRAMES
          : HARDWARE_DESKTOP_FRAMES,
        newMode
      );
      drawCanvasFrame(currentFrame);
    }, 50);
  };

  // 11. Jump to Chapter
  const handleJumpToChapter = (chapterProgress: number) => {
    if (!containerRef.current) return;
    setIsPlaying(false);
    setActiveHotspot(null);
    setMobileChapterMenuOpen(false);
    playSoundEffect("chime");
    const containerTop =
      containerRef.current.getBoundingClientRect().top + window.scrollY;
    const scrollTrackHeight =
      containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerTop + chapterProgress * scrollTrackHeight;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth"
    });
  };

  // 12. Interactive Scrubber Seek Bar Click
  const handleScrubberBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setActiveHotspot(null);
    const bar = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bar.left;
    const progress = Math.max(0, Math.min(1, clickX / bar.width));
    handleJumpToChapter(progress);
  };

  // 13. Drag-to-Rotate / Drag-to-Scrub (Mouse Desktop Only)
  const handlePointerDown = (e: React.PointerEvent) => {
    // IMPORTANT: Ignore touch events on mobile phones so native vertical swipe scroll is 100% smooth and never hijacked
    if (e.pointerType === "touch") return;
    if (
      (e.target as HTMLElement).closest("button, a, input, [role='button']")
    )
      return;
    isDraggingRef.current = true;
    setIsPlaying(false);
    dragStartXRef.current = e.clientX;
    dragStartProgressRef.current = targetProgressRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const sensitivity = 0.0012;
    const nextProgress = Math.max(
      0,
      Math.min(1, dragStartProgressRef.current - deltaX * sensitivity)
    );
    targetProgressRef.current = nextProgress;
    setScrollProgress(nextProgress);

    const containerTop =
      containerRef.current.getBoundingClientRect().top + window.scrollY;
    const scrollTrackHeight =
      containerRef.current.offsetHeight - window.innerHeight;
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

  // Exploded Breakdown stage in hardware mode: active between 36% and 60%
  const isExplodedActive =
    animationMode === "hardware" &&
    scrollProgress >= 0.36 &&
    scrollProgress < 0.60;

  // Active chapter computation based on mode
  const currentChapterIdx =
    animationMode === "process"
      ? scrollProgress < 0.16
        ? 0
        : scrollProgress < 0.36
        ? 1
        : scrollProgress < 0.60
        ? 2
        : scrollProgress < 0.78
        ? 3
        : scrollProgress < 0.92
        ? 4
        : 5
      : scrollProgress < 0.14
      ? 0
      : scrollProgress < 0.36
      ? 1
      : scrollProgress < 0.60
      ? 2
      : scrollProgress < 0.84
      ? 3
      : 4;

  const currentChapter =
    currentChapters[currentChapterIdx] || currentChapters[0];

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
      className="relative w-full bg-[#0A0A0A] touch-pan-y"
      style={{ height: isMobile ? "380vh" : "450vh", touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── STICKY CANVAS VIEWPORT CONTAINER ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A] flex items-center justify-center select-none touch-pan-y">
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
            style={{
              backgroundColor:
                animationMode === "process"
                  ? currentChapter.color
                  : currentChapterIdx === 2
                  ? "#06B6D4"
                  : "#3B82F6"
            }}
          />
          <div className="grid-fade opacity-20" />
        </div>

        {/* Top/Bottom Cinematic Fade Gradients */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-28 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 inset-x-0 h-40 sm:h-36 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pointer-events-none z-20" />

        {/* ── TOP HUD BAR WITH DUAL-MODE TOGGLE SWITCH & AUDIO CONTROLS ── */}
        <div className="absolute top-2.5 sm:top-5 inset-x-2 sm:inset-x-8 z-40 flex items-center justify-between pointer-events-none gap-1.5">
          
          {/* Left: Mode Streaming Status */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            {!isPreloaded ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212]/90 backdrop-blur-xl border border-[#C6FF00]/40 shadow-lg text-[9px] sm:text-[10px] text-white font-extrabold">
                <Radio className="h-3 w-3 text-[#C6FF00] animate-pulse" />
                <span className="hidden sm:inline">
                  {animationMode === "process" ? "LIFECYCLE" : "3D ASSETS"}:
                </span>
                <span>{loadPercentage}%</span>
                <div className="w-8 sm:w-10 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-[#C6FF00] transition-all duration-200"
                    style={{ width: `${loadPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212]/85 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-mono text-white/80 shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF00] animate-pulse" />
                <span className="font-extrabold text-[#C6FF00]">DSR-GO</span>
                <span className="text-white/40">|</span>
                <span>
                  {animationMode === "process"
                    ? "DELIVERY STORY"
                    : "3D ANATOMY"}
                </span>
              </div>
            )}
          </div>

          {/* Center / Right: FUTURISTIC SEGMENTED GLASS MODE TOGGLE PILL */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto sm:ml-0">
            <div className="p-0.5 sm:p-1 rounded-full bg-[#121212]/90 backdrop-blur-xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.7)] flex items-center gap-0.5 sm:gap-1">
              
              {/* Option 1: Live Delivery Story (1088 Frames) */}
              <button
                type="button"
                onClick={() => handleToggleMode("process")}
                className={`relative px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-micro font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  animationMode === "process"
                    ? "bg-[#39B54A] text-white shadow-[0_0_15px_rgba(57,181,74,0.4)] scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title="Watch full campus delivery workflow animation (1088 frames)"
              >
                <Package className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${animationMode === "process" ? "text-white" : "text-[#39B54A]"}`} />
                <span className="font-mono tracking-tight text-[10px] sm:text-xs">Delivery Process</span>
                <span className={`hidden md:inline text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${animationMode === "process" ? "bg-black/20 text-white" : "bg-white/10 text-white/60"}`}>
                  1088 Frm
                </span>
              </button>

              {/* Option 2: 3D Hardware Anatomy (240/300 Frames) */}
              <button
                type="button"
                onClick={() => handleToggleMode("hardware")}
                className={`relative px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-micro font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  animationMode === "hardware"
                    ? "bg-[#06B6D4] text-[#0A0A0A] shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title="Inspect 3D exploded robot teardown and telemetry (240 frames)"
              >
                <Layers className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${animationMode === "hardware" ? "text-[#0A0A0A]" : "text-[#06B6D4]"}`} />
                <span className="font-mono tracking-tight text-[10px] sm:text-xs">3D Anatomy</span>
                <span className={`hidden md:inline text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${animationMode === "hardware" ? "bg-black/20 text-[#0A0A0A]" : "bg-white/10 text-white/60"}`}>
                  240 Frm
                </span>
              </button>
            </div>

            {/* Audio SFX Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSoundEffect("chime");
              }}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-xl border transition-all cursor-pointer shrink-0 ${
                soundEnabled
                  ? "bg-[#C6FF00]/20 border-[#C6FF00]/60 text-[#C6FF00] shadow-[0_0_12px_rgba(198,255,0,0.3)]"
                  : "bg-[#121212]/80 border-white/10 text-white/60 hover:text-white"
              }`}
              title={soundEnabled ? "Mute Sci-Fi SFX" : "Enable Sci-Fi SFX"}
              aria-label="Toggle Sci-Fi SFX"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── 3D EXPLODED BREAKDOWN HUD HOTSPOTS (Only in Hardware Mode 36% - 60%) ── */}
        {animationMode === "hardware" && (
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
        )}

        {/* ── HOTSPOT DETAIL MODAL (Hardware Mode) ── */}
        <AnimatePresence>
          {animationMode === "hardware" && activeHotspot && isExplodedActive && (
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
                        left: `clamp(20px, ${
                          canvasLayout.offsetX / canvasLayout.dpr +
                          (canvasLayout.drawWidth / canvasLayout.dpr) *
                            activeHotspot.x
                        }px, calc(100vw - 360px))`,
                        top: `clamp(90px, ${
                          canvasLayout.offsetY / canvasLayout.dpr +
                          (canvasLayout.drawHeight / canvasLayout.dpr) *
                            activeHotspot.y
                        }px, calc(100vh - 380px))`
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

        {/* ── 4. MISSION COMMAND HUD WING ── */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end sm:justify-center p-3 sm:p-8 lg:p-14 pb-16 sm:pb-8">
          
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── MODE 1: DELIVERY PROCESS STORY HUD (all-frames-combined 1088f) ── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {animationMode === "process" && (
            <>
              {/* ── STAGE 1: ROBOT ARRIVAL (0% – 16%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0 && scrollProgress < 0.16
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#C6FF00]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C6FF00]/15 border border-[#C6FF00]/30 text-[#C6FF00] text-[9px] sm:text-[10px] font-extrabold shadow-[0_0_15px_rgba(198,255,0,0.2)]">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-[#C6FF00]" />
                    <span>01 // STEP 1 · AUTONOMOUS ARRIVAL</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#C6FF00] tracking-widest block">
                      CAMPUS PICKUP POINT
                    </span>
                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      Robot Arrives at Origin.
                    </h1>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    The autonomous delivery unit navigates to your exact pickup location, positioning itself smoothly for package loading.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-2 border-t border-white/10">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                      <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">Status</span>
                      <span className="text-[11px] sm:text-caption font-black text-[#C6FF00] block mt-0.5">Docked · Ready</span>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                      <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">Chamber</span>
                      <span className="text-[11px] sm:text-caption font-black text-white block mt-0.5">Unlocked / Open</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STAGE 2: PARCEL INTAKE & LOADING (16% – 36%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.16 && scrollProgress < 0.36
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#3B82F6]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] text-[9px] sm:text-[10px] font-extrabold">
                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#3B82F6]" />
                    <span>02 // STEP 2 · PARCEL INTAKE</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#3B82F6] tracking-widest block">
                      SECURE LOADING BAY
                    </span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      Package Placed in Vault.
                    </h2>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    The sender deposits the parcel into the thermal cargo bay. Weight sensors register the payload and electromagnetic deadbolts seal the hatch.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="p-2 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between text-micro">
                      <span className="text-white/70">Payload Weight Sensor</span>
                      <span className="font-bold text-[#C6FF00]">2.4 kg Verified</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between text-micro">
                      <span className="text-white/70">Solenoid Hatch Seal</span>
                      <span className="font-bold text-[#3B82F6]">Hermetically Locked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STAGE 3: AUTONOMOUS SLAM TRANSIT (36% – 60%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.36 && scrollProgress < 0.60
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#06B6D4]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] text-[9px] sm:text-[10px] font-extrabold">
                    <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#06B6D4] animate-pulse" />
                    <span>03 // STEP 3 · CAMPUS TRANSIT</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#06B6D4] tracking-widest block">
                      AUTONOMOUS SPATIAL AI
                    </span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      En Route to Destination.
                    </h2>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    Robot cruises across Silver Oak pathways using LiDAR depth mapping and spatial SLAM pathfinding, smoothly bypassing obstacles in real time.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-2 border-t border-white/10">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                      <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">Speed</span>
                      <span className="text-[11px] sm:text-caption font-black text-[#06B6D4] block mt-0.5">1.2 m/s Active</span>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#181818] border border-white/10">
                      <span className="text-[8px] sm:text-[9px] font-mono text-white/50 uppercase block">LiDAR Range</span>
                      <span className="text-[11px] sm:text-caption font-black text-white block mt-0.5">360° 40m FOV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STAGE 4: RECIPIENT ARRIVAL & OTP INPUT (60% – 78%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.60 && scrollProgress < 0.78
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#F59E0B]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[9px] sm:text-[10px] font-extrabold">
                    <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F59E0B]" />
                    <span>04 // STEP 4 · OTP AUTHENTICATION</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#F59E0B] tracking-widest block">
                      DYNAMIC PASSCODE
                    </span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      Receiver Enters OTP.
                    </h2>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    The recipient receives instant push notification upon arrival and keys in their unique 4-digit code to authorize the unlock sequence.
                  </p>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#181818] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/60">
                      <span>VERIFICATION CODE</span>
                      <span className="text-[#F59E0B] font-bold">AUTHENTICATED</span>
                    </div>
                    <div className="flex items-center justify-around gap-1.5 pt-0.5">
                      {["7", "4", "1", "9"].map((d, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-8 sm:w-8 sm:h-9 rounded-lg bg-[#121212] border border-[#F59E0B]/60 flex items-center justify-center font-mono font-black text-micro sm:text-caption text-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STAGE 5: HATCH UNLOCK & RETRIEVAL (78% – 92%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.78 && scrollProgress < 0.92
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#10B981]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[9px] sm:text-[10px] font-extrabold">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#10B981]" />
                    <span>05 // STEP 5 · HATCH RELEASE</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#10B981] tracking-widest block">
                      DELIVERY COMPLETED
                    </span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      Parcel Retrieved.
                    </h2>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    Electromagnetic solenoids release instantly. The vault hatch lifts open and the recipient safely retrieves their parcel.
                  </p>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between text-micro">
                    <span className="text-white/70">Vault Solenoid State</span>
                    <span className="font-extrabold text-[#10B981]">Unlocked &amp; Handed Over</span>
                  </div>
                </div>
              </div>

              {/* ── STAGE 6: FLEET LOOP & RETURN (92% – 100%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.92
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/95 backdrop-blur-2xl border border-[#C6FF00]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C6FF00]/15 border border-[#C6FF00]/30 text-[#C6FF00] text-[9px] sm:text-[10px] font-extrabold">
                    <Repeat className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C6FF00] animate-spin" />
                    <span>06 // STEP 6 · LOOP &amp; READY</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[10px] sm:text-micro font-mono font-extrabold uppercase text-[#C6FF00] tracking-widest block">
                      MISSION LOGGED
                    </span>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      Ready for Next Trip.
                    </h2>
                  </div>

                  <p className="text-micro sm:text-caption text-white/80 leading-relaxed font-medium">
                    The hatch closes smoothly, delivery is signed in the ledger, and the robot resets / returns to base station in a seamless loop.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/register"
                      className="flex-1 px-4 py-2 sm:py-2.5 rounded-full bg-[#C6FF00] text-[#0A0A0A] font-extrabold hover:shadow-[0_0_25px_#C6FF00] hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-1.5"
                    >
                      <span>Request Delivery</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleMode("hardware")}
                      className="px-3.5 py-2 sm:py-2.5 rounded-full border border-white/20 text-white font-bold bg-[#181818] hover:bg-white/10 hover:border-[#06B6D4]/50 transition-all text-xs flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                    >
                      <span>3D Teardown</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#06B6D4]" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── MODE 2: 3D ROBOT ANATOMY HUD (dsr video image 240f) ─────────── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {animationMode === "hardware" && (
            <>
              {/* ── CHAPTER 1: HERO OVERLAY (0% – 14%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[420px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0 && scrollProgress < 0.14
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C6FF00]/15 border border-[#C6FF00]/30 text-[#C6FF00] text-[9px] sm:text-[10px] font-extrabold shadow-[0_0_15px_rgba(198,255,0,0.2)]">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-[#C6FF00]" />
                    <span>SOU Fleet Online · Autonomous Delivery</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
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
                      className="px-3.5 py-2 sm:py-2.5 rounded-full border border-white/20 text-white font-bold bg-[#1A1A1A] hover:bg-white/10 hover:border-[#06B6D4]/50 transition-all text-xs flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                    >
                      <span>3D Explode</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#06B6D4]" />
                    </button>
                  </div>

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

              {/* ── CHAPTER 2: TELEMETRY & CHASSIS (14% – 36%) ── */}
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

              {/* ── CHAPTER 3: EXPLODED BREAKDOWN LIST (36% – 60%) ── */}
              <div
                className={`w-full max-w-sm sm:max-w-md lg:max-w-[400px] transition-all duration-500 pointer-events-none ${
                  scrollProgress >= 0.36 && scrollProgress < 0.60
                    ? "opacity-100 translate-y-0 sm:translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 sm:-translate-x-12 pointer-events-none absolute"
                }`}
              >
                <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#121212]/92 backdrop-blur-2xl border border-[#06B6D4]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-[#06B6D4] uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#06B6D4] animate-pulse" />
                      03 · Modular Subsystems
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/60">5 Units Active</span>
                  </div>

                  {/* Mobile Module Selector Chips */}
                  <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {currentHotspots.map((spot) => {
                      const isSelected = (activeHotspot?.id || currentHotspots[0].id) === spot.id;
                      const Icon = spot.icon;

                      return (
                        <button
                          key={spot.id}
                          type="button"
                          onClick={() => {
                            setActiveHotspot(spot);
                            playSoundEffect("chime");
                          }}
                          className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? "bg-[#06B6D4] text-[#0A0A0A] border-[#06B6D4] shadow-[0_0_12px_#06B6D4]"
                              : "bg-[#181818] border-white/10 text-white/70 hover:text-white"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{spot.title.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Desktop Full Vertical List */}
                  <div className="hidden lg:flex flex-col space-y-1.5 pt-1">
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

              {/* ── CHAPTER 4: OTP VAULT UNLOCK (60% – 84%) ── */}
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

              {/* ── CHAPTER 5: MISSION READY (84% – 100%) ── */}
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
            </>
          )}
        </div>

        {/* ── 5. RESPONSIVE FLOATING TIMELINE SCRUBBER CAPSULE ── */}
        <div
          className={`absolute bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-fit max-w-[calc(100vw-20px)] transition-opacity duration-300 ${
            scrollProgress > 0.96 ? "opacity-0 pointer-events-none" : "opacity-100"
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
                  <span className="hidden sm:inline">
                    {animationMode === "process" ? "PLAY" : "ORBIT"}
                  </span>
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
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-44 py-1.5 rounded-2xl bg-[#161616]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 flex flex-col gap-1"
                  >
                    {currentChapters.map((ch, idx) => (
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
                        <span>{ch.shortLabel || ch.label}</span>
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
              <span className="hidden sm:inline">FRM </span>
              {String(displayFrame).padStart(
                animationMode === "process" ? 4 : 3,
                "0"
              )}{" "}
              <span className="hidden md:inline">/ {totalFrames}</span>
            </div>

            {/* Chapter Jump Tabs (Desktop sm+) */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {currentChapters.map((ch, i) => {
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
