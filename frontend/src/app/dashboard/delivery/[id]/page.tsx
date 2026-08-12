"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
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
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getWsUrl } from "@/lib/ws";
import dynamic from "next/dynamic";
import DispatchButton from "@/components/DispatchButton";
import ConfirmDialog from "@/components/ConfirmDialog";

const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="ather-card p-4 h-[380px] flex items-center justify-center">
      <span className="text-micro font-bold text-[#64748B]">Loading campus map…</span>
    </div>
  ),
});

// ── Flow Step Definitions ───────────────────────────────────────────────────
const FETCH_DELIVER_STEPS = [
  { key: "pending",             label: "Trip Started",    icon: Clock },
  { key: "pickup_in_progress",  label: "Robot at Origin", icon: MapPin },
  { key: "en_route",            label: "En Route",        icon: TruckIcon },
  { key: "arrived",             label: "Arrived",         icon: Bot },
  { key: "otp_verified",        label: "Unlocked",        icon: Unlock },
  { key: "completed",           label: "Done",            icon: CheckCircle2 },
];

const PRELOADED_STEPS = [
  { key: "pending",      label: "Trip Started", icon: Clock },
  { key: "en_route",     label: "En Route",     icon: TruckIcon },
  { key: "arrived",      label: "Arrived",      icon: Bot },
  { key: "otp_verified", label: "Unlocked",     icon: Unlock },
  { key: "completed",    label: "Done",         icon: CheckCircle2 },
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
    <div className="flex items-center gap-1 w-full overflow-x-auto pb-2 scrollbar-none">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < activeIdx;
        const isActive = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[70px] sm:min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                  isDone
                    ? "bg-[#84E000] border-[#84E000] text-[#0F172A] font-black"
                    : isActive
                    ? "bg-[#FFE234] border-[#0F172A] text-[#0F172A] animate-pulse"
                    : "bg-[#E4E4E0] border-[#D8D8D2] text-[#64748B]"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              </div>
              <span
                className={`text-micro mt-1 text-center leading-tight max-w-[65px] sm:max-w-none break-words ${
                  isDone
                    ? "text-[#84E000] font-black"
                    : isActive
                    ? "text-[#0F172A] font-extrabold"
                    : "text-[#64748B]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${i < activeIdx ? "bg-[#84E000]" : "bg-[#E4E4E0]"}`} />
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
  const isDone = status === "completed" || status === "otp_verified" || status === "compartment_open";

  const eyeColor = isDone ? "#10B981" : isArrived ? "#F59E0B" : isMoving ? "#C6FF00" : "#9CA3AF";

  return (
    <g className={isMoving ? "animate-drive-wobble" : ""}>
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

  // Single OTP State for Sender
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [etaText, setEtaText] = useState<string | null>(null);

  // Ref for promisified start-mission modal confirmation
  const startMissionPendingRef = useRef<{
    resolve: () => void;
    reject: (e: Error) => void;
  } | null>(null);

  useEffect(() => {
    if (delivery?.status !== "en_route" || !delivery?.estimated_arrival) {
      setEtaText(null);
      return;
    }

    const updateEta = () => {
      const targetTime = new Date(delivery.estimated_arrival).getTime();
      const now = Date.now();
      const diffMs = targetTime - now;
      const diffMins = Math.ceil(diffMs / (1000 * 60));

      if (diffMins <= 1) {
        setEtaText("Arriving any moment.");
      } else {
        setEtaText(`Arriving in ~${diffMins} min`);
      }
    };

    updateEta();
    const interval = setInterval(updateEta, 15000);
    return () => clearInterval(interval);
  }, [delivery?.status, delivery?.estimated_arrival]);

  const hasNotifiedArrivalRef = useRef(false);
  const hasNotifiedUnlockedRef = useRef(false);
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
      if (["arrived", "waiting_otp"].includes(data.status) && !otpCode && !hasNotifiedArrivalRef.current) {
        hasNotifiedArrivalRef.current = true;
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

    let isMounted = true;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      if (!isMounted) return;

      const wsUrl = getWsUrl(`/ws/tracking/${id}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isMounted) setSocketConnected(true);
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "initial" || msg.type === "telemetry" || msg.type === "status_change") {
            if (msg.status) {
              setDelivery((prev: any) => (prev ? {
                ...prev,
                status: msg.status,
                receiver_name: msg.receiver_name || prev.receiver_name,
                receiver_email: msg.receiver_email || prev.receiver_email,
              } : null));

              if ((msg.status === "arrived" || msg.status === "waiting_otp") && !hasNotifiedArrivalRef.current) {
                hasNotifiedArrivalRef.current = true;
                toast.success("🚨 ALERT: Robot arrived at destination! OTP generated.", { duration: 4000 });
                generateOrFetchOtp();
              }
              if ((msg.status === "otp_verified" || msg.status === "compartment_open") && !hasNotifiedUnlockedRef.current) {
                hasNotifiedUnlockedRef.current = true;
                toast.success(`🔓 UNLOCKED! Collected by ${msg.receiver_name || "Receiver"}`, { duration: 4000 });
              }
            }
            if (msg.robot) {
              setRobot((prev: any) => (prev ? { ...prev, ...msg.robot } : msg.robot));
            }
          }
        } catch (e) {
          console.error("Failed to parse tracking WebSocket message:", e);
        }
      };

      socket.onclose = () => {
        if (isMounted) {
          setSocketConnected(false);
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      };

      socket.onerror = () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    };

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        if (
          socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING
        ) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [id, token]);

  // ── Start Mission — promisified so DispatchButton phases track real state ──
  const handleStartMissionDispatch = useCallback(async (): Promise<void> => {
    // Step 1: Wait for modal confirmation (promise resolves on "Confirm & Start", rejects on Cancel)
    await new Promise<void>((resolve, reject) => {
      startMissionPendingRef.current = { resolve, reject };
      setShowConfirmModal(true);
    });
    // Step 2: Actual API call (DispatchButton is now in dispatching phase)
    const res = await fetch(`/api/v1/deliveries/${id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Could not start mission");
    toast.success("Mission started! Robot is now moving.");
    fetchDeliveryDetails();
  }, [id, token]);

  // ── Done Fetching — returns Promise<void> for DispatchButton ──
  const handleDoneFetching = useCallback(async (): Promise<void> => {
    const res = await fetch(`/api/v1/deliveries/${id}/fetched`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Could not confirm fetch");
    toast.success("Parcel loaded! Robot is heading to destination. 🚀");
    fetchDeliveryDetails();
  }, [id, token]);

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

  const isPickupPhase = delivery.status === "pickup_in_progress";
  const isArrivedPhase = ["arrived", "waiting_otp"].includes(delivery.status);
  // Item 3: include compartment_open in the unlocked check
  const isUnlocked = ["otp_verified", "compartment_open", "completed"].includes(delivery.status);

  return (
    <div className="space-y-6">
      {/* ── Header — Item 2: min-w-0 + shrink-0 guards against mobile overlap ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-heading font-extrabold tracking-tight truncate">{delivery.tracking_code}</h1>
            <span className={`text-caption font-bold px-2 py-0.5 rounded capitalize shrink-0 ${
              delivery.status === "completed"
                ? "bg-status-success/15 text-status-success border border-status-success/20"
                : isPickupPhase
                ? "bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20"
                : "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
            }`}>
              {delivery.status.replace(/_/g, " ")}
            </span>
            <span className={`text-micro font-bold px-2 py-0.5 rounded border shrink-0 ${
              delivery.is_preloaded
                ? "text-status-info border-status-info/20 bg-status-info/10"
                : "text-brand-lime border-brand-lime/20 bg-brand-lime/5"
            }`}>
              {delivery.is_preloaded ? "Pre-loaded" : "Fetch & Deliver"}
            </span>
          </div>
          <p className="text-caption text-brand-gray/50 truncate">
            Assigned Robot: <span className="text-brand-white font-bold">{robot?.name || "Assigning..."}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
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

      {/* ── Grid ─────────────────────────────────────────────────────────────
          Item 1: Right column comes FIRST in DOM so it stacks above the map
          on mobile. xl: order-1/2 classes restore the left-map, right-intel layout. */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── RIGHT COLUMN: Mission Intel + Start Button + Action Controls ── */}
        <div className="xl:col-span-1 xl:order-2 space-y-5">

          {/* Mission Intel */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title font-bold flex items-center space-x-2">
                <Package className="h-5 w-5 text-brand-lime" />
                <span>Mission Intel</span>
              </h3>
              {etaText && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-micro font-extrabold animate-pulse">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{etaText}</span>
                </div>
              )}
            </div>

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

              <div className="pb-3 border-b border-surface-4/40 space-y-1">
                <span className="text-brand-gray/40 block text-micro">Route Chain</span>
                <span className="font-mono text-micro font-bold text-brand-lime block break-words">
                  {delivery.extra_stops && Array.isArray(delivery.extra_stops) && delivery.extra_stops.length > 0
                    ? [delivery.origin_block, delivery.destination_block, ...delivery.extra_stops].join(" ➔ ")
                    : `${delivery.origin_block} ➔ ${delivery.destination_block}`}
                </span>
              </div>

              <div className="pb-3 border-b border-surface-4/40">
                <span className="text-brand-gray/40 block text-micro">Package</span>
                <span className="font-semibold text-brand-white text-micro truncate block">
                  {delivery.package_description} ({delivery.package_weight_kg}kg)
                </span>
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

          {/* ── Item 1: Start Mission — compact DispatchButton, right-aligned,
              placed DIRECTLY below Mission Intel and above the map on mobile.
              No compartment toggle gating — Item 3 removes that entirely. ── */}
          {delivery.status === "pending" && (
            <div className="flex justify-end">
              <DispatchButton
                label={delivery.is_preloaded ? "Dispatch Robot" : "Start Mission"}
                onConfirm={handleStartMissionDispatch}
                className="px-6 py-2.5 text-caption"
              />
            </div>
          )}

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
                <h4 className="font-extrabold text-title">Parcel Unlocked &amp; Collected</h4>
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
                  <span className="font-semibold text-brand-white">Hatch Opened &amp; Completed</span>
                </p>
              </div>
            </div>
          )}

          {/* ── Mission Action Buttons ──
              Item 3: Compartment toggle block entirely removed.
              Item 1: Pending Start button moved above (DispatchButton above Mission Intel).
              Remaining: pickup phase instruction + Done Fetching DispatchButton,
              en_route Simulate Arrival, Back to Dashboard. ── */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-5 space-y-4">

            {/* Pickup Phase Instruction & Done Fetching DispatchButton */}
            {isPickupPhase && (
              <div className="ather-banner-yellow p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-white/20 text-[#0F172A] shrink-0">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-caption font-black text-[#0F172A]">
                      Robot is at your Origin Block!
                    </h3>
                    <p className="text-micro font-bold text-[#0F172A]/70 mt-0.5">
                      Place the parcel inside the robot compartment, then tap the button below.
                    </p>
                  </div>
                </div>
                <DispatchButton
                  label="Done Fetching — Dispatch to Destination 🚀"
                  onConfirm={handleDoneFetching}
                  className="w-full justify-center"
                />
              </div>
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

        {/* ── LEFT COLUMN: Campus Radar Map ──
            xl:order-1 makes it appear visually first on wide screens,
            but it's second in DOM so mobile stacks right-col (mission intel)
            above map — exactly what Sanjay asked for. ── */}
        <div className="xl:col-span-2 xl:order-1 glassmorphism rounded-3xl border border-surface-4 p-5 flex flex-col space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
            <div>
              <h3 className="text-caption font-bold uppercase tracking-wider text-brand-gray/40">Campus Radar Map</h3>
              <p className="text-micro text-brand-gray/60">Silver Oak University Live Fleet Telemetry</p>
            </div>
            <span className="text-micro font-mono text-brand-lime font-semibold shrink-0">
              {robot?.lat && robot?.lng ? `${robot.lat.toFixed(4)}° N, ${robot.lng.toFixed(4)}° E` : "Silver Oak Campus"}
            </span>
          </div>

          <CampusMap
            robot={
              robot?.lat && robot?.lng
                ? { lat: robot.lat, lng: robot.lng, heading: robot?.heading ?? 0 }
                : undefined
            }
            followRobot={delivery.status === "en_route"}
            height="400px"
            className="w-full"
          />
        </div>
      </div>

      {/* ── Item 4: Confirm Dialog — wired to Start Mission DispatchButton ── */}
      <ConfirmDialog
        open={showConfirmModal}
        title="Start Delivery Trip?"
        message="The robot will begin its route to the origin block once confirmed. This action cannot be undone."
        confirmLabel="Confirm & Start"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowConfirmModal(false);
          startMissionPendingRef.current?.resolve();
          startMissionPendingRef.current = null;
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          startMissionPendingRef.current?.reject(new Error("CANCELLED"));
          startMissionPendingRef.current = null;
        }}
      />
    </div>
  );
}
