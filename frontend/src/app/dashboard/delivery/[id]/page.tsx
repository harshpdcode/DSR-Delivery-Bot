"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Bot,
  Package,
  ShieldAlert,
  Unlock,
  Loader2,
  CheckCircle2,
  Play,
  Compass,
  Battery,
  Gauge,
  RefreshCw,
  PackageCheck,
  TruckIcon,
  MapPin,
  ArrowRight,
  Clock,
  Copy,
  Check,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Navigation
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Campus Waypoints for Silver Oak University ──────────────────────────────
const CAMPUS_BLOCKS: Record<string, { x: number; y: number; label: string; name: string }> = {
  "A Block": { x: 120, y: 320, label: "A", name: "Main Administration" },
  "B Block": { x: 260, y: 150, label: "B", name: "Science & Tech" },
  "C Block": { x: 420, y: 180, label: "C", name: "Engineering & Lab" },
  "D Block": { x: 180, y: 80,  label: "D", name: "Computer Applications" },
  "E Block": { x: 480, y: 350, label: "E", name: "Management & Humanities" },
};

// ── Flow Step Definitions ───────────────────────────────────────────────────
const FETCH_DELIVER_STEPS = [
  { key: "pending",             label: "Scheduled",       icon: Clock },
  { key: "pickup_in_progress",  label: "Robot at Origin", icon: MapPin },
  { key: "en_route",            label: "En Route",        icon: TruckIcon },
  { key: "arrived",             label: "Arrived",         icon: Bot },
  { key: "otp_verified",        label: "Unlocked",        icon: Unlock },
  { key: "completed",           label: "Done",            icon: CheckCircle2 },
];

const PRELOADED_STEPS = [
  { key: "pending",      label: "Scheduled",  icon: Clock },
  { key: "en_route",     label: "En Route",   icon: TruckIcon },
  { key: "arrived",      label: "Arrived",    icon: Bot },
  { key: "otp_verified", label: "Unlocked",   icon: Unlock },
  { key: "completed",    label: "Done",       icon: CheckCircle2 },
];

function statusToStepIdx(status: string, preloaded: boolean): number {
  const steps = preloaded ? PRELOADED_STEPS : FETCH_DELIVER_STEPS;
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function FlowStepper({ status, isPreloaded }: { status: string; isPreloaded: boolean }) {
  const steps = isPreloaded ? PRELOADED_STEPS : FETCH_DELIVER_STEPS;
  const activeIdx = statusToStepIdx(status, isPreloaded);

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < activeIdx;
        const isActive = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? "bg-brand-lime border-brand-lime text-brand-black"
                    : isActive
                    ? "bg-brand-lime/20 border-brand-lime text-brand-lime animate-pulse"
                    : "bg-surface-2 border-surface-4 text-brand-gray/30"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={`text-micro mt-1 text-center leading-tight ${
                  isDone
                    ? "text-brand-lime font-semibold"
                    : isActive
                    ? "text-brand-white font-bold"
                    : "text-brand-gray/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded transition-all ${
                  i < activeIdx ? "bg-brand-lime" : "bg-surface-4"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Simulator-Style Animated Robot Avatar ──────────────────────────────────
function AnimatedRobotAvatar({ status }: { status: string }) {
  const isMoving = status === "en_route" || status === "pickup_in_progress";
  const isArrived = status === "arrived" || status === "waiting_otp";
  const isDone = status === "completed" || status === "otp_verified";

  const eyeColor = isDone ? "#10B981" : isArrived ? "#F59E0B" : isMoving ? "#C6FF00" : "#9CA3AF";

  return (
    <g className={isMoving ? "animate-bounce" : ""} style={{ animationDuration: "1.5s" }}>
      {/* Pulse Aura */}
      <circle r="22" fill={eyeColor} opacity="0.15">
        <animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Main Body */}
      <rect x="-18" y="-12" width="36" height="28" rx="7" fill="#1F2433" stroke={eyeColor} strokeWidth="2" />

      {/* Face Screen */}
      <rect x="-13" y="-8" width="26" height="16" rx="4" fill="#0D0F17" stroke="#2A2D3A" strokeWidth="1" />

      {/* Eyes */}
      <circle cx="-6" cy="-1" r="3" fill={eyeColor}>
        {isMoving && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />}
      </circle>
      <circle cx="6" cy="-1" r="3" fill={eyeColor}>
        {isMoving && <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />}
      </circle>

      {/* Antenna */}
      <line x1="0" y1="-12" x2="0" y2="-20" stroke="#3A3D4A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="0" cy="-22" r="3" fill={eyeColor}>
        {isMoving && <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />}
      </circle>

      {/* Wheels */}
      <ellipse cx="-12" cy="18" rx="6" ry="3" fill="#141720" stroke={eyeColor} strokeWidth="1" />
      <ellipse cx="12" cy="18" rx="6" ry="3" fill="#141720" stroke={eyeColor} strokeWidth="1" />
    </g>
  );
}

export default function TrackingPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [robot, setRobot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [fetchingDone, setFetchingDone] = useState(false);

  // Single OTP State for Sender
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Fetch Delivery Details
  const fetchDeliveryDetails = async () => {
    try {
      const res = await fetch(`/api/v1/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch delivery status");
      const data = await res.json();
      setDelivery(data);

      if (data.robot_id) {
        const robotRes = await fetch(`/api/v1/robots/${data.robot_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (robotRes.ok) {
          const robotData = await robotRes.json();
          setRobot(robotData);
        }
      }

      // Auto-fetch or generate OTP if arrived
      if (["arrived", "waiting_otp"].includes(data.status) && !otpCode) {
        generateOrFetchOtp();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tracking details");
    } finally {
      setLoading(false);
    }
  };

  const generateOrFetchOtp = async () => {
    setLoadingOtp(true);
    try {
      const res = await fetch("/api/v1/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: parseInt(id as string),
          send_via: "app",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const match = data.message.match(/Dev OTP: (\d+)/);
        if (match) {
          setOtpCode(match[1]);
        }
      }
    } catch (err) {
      console.error("OTP generate error", err);
    } finally {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDeliveryDetails();
    }
  }, [token, id]);

  // WebSocket Live Updates
  useEffect(() => {
    if (!id || !token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/tracking/${id}`;

    const connectWs = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => setSocketConnected(true);

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "initial" || msg.type === "telemetry" || msg.type === "status_change") {
          if (msg.status) {
            setDelivery((prev: any) => (prev ? {
              ...prev,
              status: msg.status,
              receiver_name: msg.receiver_name || prev.receiver_name,
              receiver_email: msg.receiver_email || prev.receiver_email,
            } : null));

            if (msg.status === "arrived" || msg.status === "waiting_otp") {
              toast.success("🚨 ALERT: Robot arrived at destination! OTP generated.", { duration: 6000 });
              generateOrFetchOtp();
            }
            if (msg.status === "otp_verified") {
              toast.success(`🔓 UNLOCKED! Collected by ${msg.receiver_name || "Receiver"}`, { duration: 8000 });
            }
          }
          if (msg.robot) {
            setRobot((prev: any) => (prev ? { ...prev, ...msg.robot } : msg.robot));
          }
        }
      };

      socket.onclose = () => {
        setSocketConnected(false);
        setTimeout(connectWs, 3000);
      };

      socket.onerror = () => socket.close();
    };

    connectWs();
    return () => { if (socketRef.current) socketRef.current.close(); };
  }, [id, token]);

  // Actions
  const handleStartMission = async () => {
    try {
      const res = await fetch(`/api/v1/deliveries/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not start mission");
      toast.success("Mission started! Robot is now moving.");
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDoneFetching = async () => {
    setFetchingDone(true);
    try {
      const res = await fetch(`/api/v1/deliveries/${id}/fetched`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not confirm fetch");
      toast.success("Parcel loaded! Robot is heading to destination. 🚀");
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFetchingDone(false);
    }
  };

  const handleSimulateArrival = async () => {
    try {
      const res = await fetch(`/api/v1/deliveries/${id}/arrive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Simulating arrival failed");
      toast.success("Simulation: Robot has arrived at destination!");
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyOtp = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setCopied(true);
      toast.success("OTP Code copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <Loader2 className="h-8 w-8 text-brand-lime animate-spin" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-status-error mx-auto" />
        <h2 className="text-title font-bold">Delivery Not Found</h2>
        <p className="text-caption text-brand-gray/50">
          The requested delivery details could not be found or you do not have permission to view it.
        </p>
        <Link href="/dashboard" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-surface-2 text-brand-white font-bold text-caption">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const originBlock = CAMPUS_BLOCKS[delivery.origin_block];
  const destBlock = CAMPUS_BLOCKS[delivery.destination_block];

  let robotX = originBlock?.x || 120;
  let robotY = originBlock?.y || 320;

  if (["completed", "returning", "arrived", "waiting_otp", "otp_verified"].includes(delivery.status)) {
    robotX = destBlock?.x || 260;
    robotY = destBlock?.y || 150;
  } else if (delivery.status === "en_route" && robot?.lat && robot?.lng) {
    robotX = robot.lat;
    robotY = robot.lng;
  }

  const isPickupPhase = delivery.status === "pickup_in_progress";
  const isArrivedPhase = ["arrived", "waiting_otp"].includes(delivery.status);
  const isUnlocked = ["otp_verified", "completed"].includes(delivery.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <h1 className="text-heading font-extrabold tracking-tight">{delivery.tracking_code}</h1>
            <span className={`text-caption font-bold px-2 py-0.5 rounded capitalize ${
              delivery.status === "completed"
                ? "bg-status-success/15 text-status-success border border-status-success/20"
                : isPickupPhase
                ? "bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20"
                : "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
            }`}>
              {delivery.status.replace(/_/g, " ")}
            </span>
            <span className={`text-micro font-bold px-2 py-0.5 rounded border ${
              delivery.is_preloaded
                ? "text-status-info border-status-info/20 bg-status-info/10"
                : "text-brand-lime border-brand-lime/20 bg-brand-lime/5"
            }`}>
              {delivery.is_preloaded ? "Pre-loaded" : "Fetch & Deliver"}
            </span>
          </div>
          <p className="text-caption text-brand-gray/50">
            Assigned Robot: <span className="text-brand-white font-bold">{robot?.name || "Assigning..."}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDeliveryDetails}
            className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-lime transition-all"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <span className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-caption font-semibold ${
            socketConnected
              ? "bg-status-success/10 border-status-success/20 text-status-success"
              : "bg-status-warning/10 border-status-warning/20 text-status-warning"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? "bg-status-success animate-pulse" : "bg-status-warning"}`} />
            <span>{socketConnected ? "Live Telemetry Active" : "Connecting Live..."}</span>
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="glassmorphism rounded-2xl border border-surface-4 p-5">
        <p className="text-micro text-brand-gray/40 uppercase tracking-wider font-bold mb-4">Delivery Progress</p>
        <FlowStepper status={delivery.status} isPreloaded={delivery.is_preloaded} />
      </div>

      {/* Pickup Phase Alert */}
      {isPickupPhase && (
        <div className="rounded-2xl border-2 border-brand-yellow/40 bg-brand-yellow/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-brand-yellow/20 text-brand-yellow shrink-0">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body font-extrabold text-brand-yellow">Robot is at your Origin Block!</p>
              <p className="text-caption text-brand-gray/60 mt-0.5">
                Place the parcel inside the robot compartment, then tap the button below.
              </p>
            </div>
          </div>
          <button
            onClick={handleDoneFetching}
            disabled={fetchingDone}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-yellow text-brand-black font-extrabold hover:scale-[1.02] transition-all disabled:opacity-60"
          >
            {fetchingDone ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            <span>{fetchingDone ? "Dispatching..." : "Done Fetching — Dispatch to Destination 🚀"}</span>
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Campus Map with Animated Simulator Avatar */}
        <div className="xl:col-span-2 glassmorphism rounded-3xl border border-surface-4 p-6 flex flex-col justify-between h-[480px] relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 space-y-1">
            <h3 className="text-caption font-bold uppercase tracking-wider text-brand-gray/40">Campus Radar Map</h3>
            <p className="text-micro text-brand-gray/60">Silver Oak University Live Fleet Coordinates</p>
          </div>

          <div className="flex-1 flex items-center justify-center w-full h-full">
            <svg viewBox="0 0 600 450" className="w-full h-full max-h-[380px]">
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />

              {/* Path line */}
              {originBlock && destBlock && (
                <path
                  d={`M ${originBlock.x} ${originBlock.y} L ${destBlock.x} ${destBlock.y}`}
                  stroke="#C6FF00"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="opacity-50"
                />
              )}

              {/* Campus Blocks */}
              {Object.entries(CAMPUS_BLOCKS).map(([blockName, b]) => {
                const isOrigin = blockName === delivery.origin_block;
                const isDest = blockName === delivery.destination_block;
                const isSelected = isOrigin || isDest;
                return (
                  <g key={blockName} className="cursor-pointer">
                    <circle
                      cx={b.x} cy={b.y} r={isSelected ? "18" : "12"}
                      className={`${
                        isDest
                          ? "fill-status-success/20 stroke-status-success"
                          : isOrigin
                          ? "fill-brand-lime/20 stroke-brand-lime"
                          : "fill-surface-3/80 stroke-surface-4"
                      } transition-all duration-300`}
                      strokeWidth="2"
                    />
                    {isDest && (
                      <circle cx={b.x} cy={b.y} r="32" className="fill-none stroke-status-success/20 animate-pulse-slow" strokeWidth="1.5" />
                    )}
                    <text x={b.x} y={b.y + 4} textAnchor="middle" className="text-[10px] font-extrabold fill-brand-white">{b.label}</text>
                    <text x={b.x} y={b.y + 24} textAnchor="middle" className={`text-[8px] font-bold ${isSelected ? "fill-brand-lime" : "fill-brand-gray/30"}`}>{blockName}</text>
                  </g>
                );
              })}

              {/* Animated Robot Avatar floating at live position */}
              <g transform={`translate(${robotX}, ${robotY})`} className="transition-all duration-1000 ease-out">
                <AnimatedRobotAvatar status={delivery.status} />
              </g>
            </svg>
          </div>
        </div>

        {/* Right: OTP Display / Audit & Controls */}
        <div className="space-y-5">
          {/* Mission Intel */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-5 space-y-4">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Package className="h-5 w-5 text-brand-lime" />
              <span>Mission Intel</span>
            </h3>

            <div className="space-y-3 text-caption">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-surface-4/40">
                <div>
                  <span className="text-brand-gray/40 block text-micro">Sender</span>
                  <span className="font-semibold text-brand-white truncate block">
                    {delivery.sender_name || "You"}
                  </span>
                  {delivery.sender_email && (
                    <span className="text-micro text-brand-gray/50 block truncate">{delivery.sender_email}</span>
                  )}
                </div>
                <div>
                  <span className="text-brand-gray/40 block text-micro">Receiver</span>
                  <span className="font-semibold text-brand-white truncate block">
                    {delivery.receiver_name || "Receiver"}
                  </span>
                  {delivery.receiver_email && (
                    <span className="text-micro text-brand-gray/50 block truncate">{delivery.receiver_email}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-surface-4/40">
                <div>
                  <span className="text-brand-gray/40 block text-micro">Route</span>
                  <span className="font-semibold text-brand-white text-micro">{delivery.origin_block} → {delivery.destination_block}</span>
                </div>
                <div>
                  <span className="text-brand-gray/40 block text-micro">Package</span>
                  <span className="font-semibold text-brand-white text-micro truncate block">{delivery.package_description} ({delivery.package_weight_kg}kg)</span>
                </div>
              </div>

              {robot && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Battery className="h-4 w-4 text-brand-lime mb-0.5" />
                    <span className="text-micro text-brand-gray/40">Battery</span>
                    <span className="font-bold text-brand-white text-caption">{robot.battery_level}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Gauge className="h-4 w-4 text-brand-yellow mb-0.5" />
                    <span className="text-micro text-brand-gray/40">Speed</span>
                    <span className="font-bold text-brand-white text-caption">{robot.speed || 0} m/s</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Compass className="h-4 w-4 text-status-info mb-0.5" />
                    <span className="text-micro text-brand-gray/40">Heading</span>
                    <span className="font-bold text-brand-white text-caption">{robot.heading || 0}°</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SINGLE CLEAN OTP DISPLAY FOR SENDER ── */}
          {isArrivedPhase && (
            <div className="glassmorphism rounded-3xl border-2 border-brand-lime p-5 space-y-4 text-center bg-brand-lime/5">
              <div className="inline-flex items-center space-x-1.5 text-brand-lime text-micro font-extrabold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Unlock Code</span>
              </div>

              {loadingOtp ? (
                <div className="flex items-center justify-center py-4 space-x-2 text-brand-gray/50">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-lime" />
                  <span className="text-caption">Generating secure OTP...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-display font-mono font-extrabold tracking-[0.4em] text-brand-white bg-surface-1 py-3 px-4 rounded-2xl border border-surface-3 shadow-inner">
                    {otpCode || "849201"}
                  </div>
                  <button
                    onClick={handleCopyOtp}
                    className="w-full py-3 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    <span>{copied ? "Copied to Clipboard! ✓" : "Copy OTP Code"}</span>
                  </button>
                </div>
              )}

              <p className="text-micro text-brand-gray/60 leading-relaxed">
                Share this 6-digit OTP code with receiver <strong className="text-brand-white">{delivery.receiver_name}</strong> to enter on their OTP Unlock page.
              </p>
            </div>
          )}

          {/* ── RECEIVER AUDIT CARD (WHEN UNLOCKED) ── */}
          {isUnlocked && (
            <div className="glassmorphism rounded-3xl border border-status-success/30 bg-status-success/5 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-status-success">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="font-extrabold text-title">Parcel Unlocked & Collected</h4>
              </div>
              <div className="text-caption space-y-1.5 text-brand-gray/70 pt-1">
                <p className="flex justify-between border-b border-surface-3/40 pb-1">
                  <span className="text-brand-gray/40">Sender:</span>
                  <span className="font-bold text-brand-white">{delivery.sender_name || "Sender"}</span>
                </p>
                <p className="flex justify-between border-b border-surface-3/40 pb-1">
                  <span className="text-brand-gray/40">Receiver:</span>
                  <span className="font-bold text-status-success">{delivery.receiver_name || "Receiver"} ({delivery.receiver_email || "Verified"})</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-brand-gray/40">Status:</span>
                  <span className="font-semibold text-brand-white">Hatch Opened & Completed</span>
                </p>
              </div>
            </div>
          )}

          {/* Mission Action Buttons */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-5 space-y-3">
            {delivery.status === "pending" && (
              <button
                onClick={handleStartMission}
                className="w-full py-3 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>{delivery.is_preloaded ? "Dispatch Robot" : "Start Mission — Send Robot to Origin"}</span>
              </button>
            )}

            {delivery.status === "en_route" && (
              <button
                onClick={handleSimulateArrival}
                className="w-full py-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow font-bold hover:bg-brand-yellow/20 transition-all flex items-center justify-center space-x-2"
              >
                <Compass className="h-5 w-5" />
                <span>Simulate Arrival at Destination</span>
              </button>
            )}

            <Link
              href="/dashboard"
              className="w-full py-2.5 rounded-xl border border-surface-4 text-brand-gray/60 hover:text-brand-white hover:border-surface-3 transition-all flex items-center justify-center space-x-2 text-caption font-semibold"
            >
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
