"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RoleGuard from "@/components/RoleGuard";
import {
  Cpu,
  Play,
  BatteryCharging,
  OctagonX,
  RotateCcw,
  Zap,
  Navigation,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type RobotState = "idle" | "dispatched" | "charging" | "emergency_stop" | "fault";

interface Telemetry {
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  heading: number;
  status: RobotState;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  command: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

// ── Campus waypoints (Silver Oak campus simulation) ───────────────────────
const WAYPOINTS = [
  { lat: 23.0395, lng: 72.5079, label: "A Block" },
  { lat: 23.0402, lng: 72.5091, label: "B Block" },
  { lat: 23.0411, lng: 72.5083, label: "C Block" },
  { lat: 23.0408, lng: 72.5068, label: "D Block" },
  { lat: 23.0398, lng: 72.5062, label: "E Block" },
  { lat: 23.0388, lng: 72.5074, label: "Canteen" },
];

const INITIAL_TELEMETRY: Telemetry = {
  lat: 23.0395,
  lng: 72.5079,
  speed: 0,
  battery: 87,
  heading: 0,
  status: "idle",
};

const STATUS_CONFIG: Record<RobotState, { label: string; color: string; bg: string; border: string }> = {
  idle:            { label: "IDLE",           color: "text-brand-lime",     bg: "bg-brand-lime/10",     border: "border-brand-lime/30" },
  dispatched:      { label: "DISPATCHED",     color: "text-brand-yellow",   bg: "bg-brand-yellow/10",   border: "border-brand-yellow/30" },
  charging:        { label: "CHARGING",       color: "text-status-info",    bg: "bg-status-info/10",    border: "border-status-info/30" },
  emergency_stop:  { label: "E-STOP",         color: "text-status-error",   bg: "bg-status-error/10",   border: "border-status-error/30" },
  fault:           { label: "FAULT",          color: "text-brand-gray/50",  bg: "bg-surface-2",          border: "border-surface-4" },
};

// ── Utility ────────────────────────────────────────────────────────────────
let logCounter = 0;
function makeLog(command: string, message: string, type: LogEntry["type"]): LogEntry {
  return { id: `log-${++logCounter}`, timestamp: new Date(), command, message, type };
}

// ── Robot SVG Avatar ───────────────────────────────────────────────────────
function RobotAvatar({ state }: { state: RobotState }) {
  const isMoving      = state === "dispatched";
  const isCharging    = state === "charging";
  const isEmergency   = state === "emergency_stop";

  return (
    <div className={`relative flex items-center justify-center ${isMoving ? "animate-bounce" : ""}`} style={{ animationDuration: "1.2s" }}>
      <svg width="120" height="130" viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <rect x="20" y="45" width="80" height="65" rx="14" fill={isEmergency ? "#EF444430" : "#1F2433"} stroke={isEmergency ? "#EF4444" : isMoving ? "#C6FF00" : isCharging ? "#3B82F6" : "#3A3D4A"} strokeWidth="2"/>

        {/* Face plate */}
        <rect x="30" y="55" width="60" height="35" rx="8" fill="#0D0F17" stroke="#2A2D3A" strokeWidth="1.5"/>

        {/* Eyes */}
        <circle cx="44" cy="70" r="7" fill={isEmergency ? "#EF4444" : isCharging ? "#3B82F6" : "#C6FF00"} opacity={isEmergency ? "1" : "0.9"}>
          {isMoving && <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.8s" repeatCount="indefinite"/>}
        </circle>
        <circle cx="76" cy="70" r="7" fill={isEmergency ? "#EF4444" : isCharging ? "#3B82F6" : "#C6FF00"} opacity={isEmergency ? "1" : "0.9"}>
          {isMoving && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.8s" repeatCount="indefinite"/>}
        </circle>

        {/* Pupil dots */}
        <circle cx="46" cy="68" r="2.5" fill="#0D0F17" opacity={isEmergency ? "0" : "1"}/>
        <circle cx="78" cy="68" r="2.5" fill="#0D0F17" opacity={isEmergency ? "0" : "1"}/>

        {/* Mouth */}
        <path
          d={isEmergency ? "M 44 83 Q 60 78 76 83" : isMoving ? "M 44 83 Q 60 88 76 83" : "M 46 83 Q 60 87 74 83"}
          stroke={isEmergency ? "#EF4444" : "#C6FF00"} strokeWidth="2" strokeLinecap="round" fill="none"
        />

        {/* Antenna */}
        <line x1="60" y1="45" x2="60" y2="25" stroke="#3A3D4A" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="60" cy="22" r="5" fill={isMoving ? "#C6FF00" : isCharging ? "#3B82F6" : isEmergency ? "#EF4444" : "#3A3D4A"}>
          {(isMoving || isCharging) && <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite"/>}
          {(isMoving || isCharging) && <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>}
        </circle>

        {/* Left arm */}
        <rect x="5" y="55" width="16" height="30" rx="8" fill="#1F2433" stroke="#3A3D4A" strokeWidth="1.5"/>
        {/* Right arm */}
        <rect x="99" y="55" width="16" height="30" rx="8" fill="#1F2433" stroke="#3A3D4A" strokeWidth="1.5"/>

        {/* Wheels */}
        <ellipse cx="35" cy="112" rx="13" ry="8" fill="#141720" stroke={isMoving ? "#C6FF00" : "#3A3D4A"} strokeWidth="1.5"/>
        <ellipse cx="85" cy="112" rx="13" ry="8" fill="#141720" stroke={isMoving ? "#C6FF00" : "#3A3D4A"} strokeWidth="1.5"/>
        {isMoving && (
          <>
            <ellipse cx="35" cy="112" rx="13" ry="8" fill="none" stroke="#C6FF00" strokeWidth="1" opacity="0.4">
              <animate attributeName="rx" values="13;16;13" dur="0.6s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="0.6s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="85" cy="112" rx="13" ry="8" fill="none" stroke="#C6FF00" strokeWidth="1" opacity="0.4">
              <animate attributeName="rx" values="13;16;13" dur="0.6s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="0.6s" repeatCount="indefinite"/>
            </ellipse>
          </>
        )}

        {/* Charging bolt */}
        {isCharging && (
          <path d="M 55 58 L 50 72 L 58 72 L 53 86 L 70 68 L 62 68 L 67 58 Z" fill="#3B82F6" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.8s" repeatCount="indefinite"/>
          </path>
        )}

        {/* E-stop X */}
        {isEmergency && (
          <>
            <line x1="47" y1="63" x2="57" y2="73" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="57" y1="63" x2="47" y2="73" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="63" y1="63" x2="73" y2="73" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <line x1="73" y1="63" x2="63" y2="73" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          </>
        )}

        {/* Signal waves (when idle or dispatched) */}
        {(state === "idle" || state === "dispatched") && (
          <>
            <path d="M 90 30 Q 98 22 90 14" stroke="#C6FF00" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
            </path>
            <path d="M 94 32 Q 106 22 94 12" stroke="#C6FF00" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
            </path>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Campus Mini-Map ────────────────────────────────────────────────────────
function CampusMap({ telemetry }: { telemetry: Telemetry }) {
  // Map lat/lng to SVG coords (rough normalization)
  const LAT_MIN = 23.0385, LAT_MAX = 23.0415;
  const LNG_MIN = 72.5058, LNG_MAX = 72.5095;

  const toSVG = (lat: number, lng: number) => ({
    x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 260 + 20,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 160 + 20,
  });

  const robotPos = toSVG(telemetry.lat, telemetry.lng);

  return (
    <div className="glassmorphism rounded-2xl border border-surface-4 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="h-4 w-4 text-brand-lime" />
        <span className="text-caption font-bold text-brand-white">Campus Map</span>
        <span className="ml-auto text-micro text-brand-gray/40">Silver Oak University</span>
      </div>
      <div className="relative bg-surface-1 rounded-xl overflow-hidden border border-surface-3">
        <svg width="300" height="200" className="w-full" viewBox="0 0 300 200">
          {/* Grid lines */}
          {[40, 80, 120, 160].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="300" y2={y} stroke="#1F2433" strokeWidth="1"/>
          ))}
          {[60, 120, 180, 240].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#1F2433" strokeWidth="1"/>
          ))}

          {/* Waypoint nodes */}
          {WAYPOINTS.map((wp, i) => {
            const pos = toSVG(wp.lat, wp.lng);
            return (
              <g key={i}>
                <circle cx={pos.x} cy={pos.y} r="6" fill="#1F2433" stroke="#3A3D4A" strokeWidth="1.5"/>
                <circle cx={pos.x} cy={pos.y} r="3" fill="#3A3D4A"/>
                <text x={pos.x + 9} y={pos.y + 4} fill="#6B7280" fontSize="8" fontFamily="monospace">{wp.label}</text>
              </g>
            );
          })}

          {/* Robot position */}
          <circle cx={robotPos.x} cy={robotPos.y} r="12" fill="#C6FF00" opacity="0.15">
            <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={robotPos.x} cy={robotPos.y} r="6" fill="#C6FF00" opacity="0.9"/>
          <circle cx={robotPos.x} cy={robotPos.y} r="3" fill="#0D0F17"/>

          {/* Heading arrow */}
          {telemetry.status === "dispatched" && (
            <g transform={`translate(${robotPos.x},${robotPos.y}) rotate(${telemetry.heading})`}>
              <path d="M 0 -20 L -4 -12 L 0 -16 L 4 -12 Z" fill="#C6FF00" opacity="0.7"/>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function SimulatorContent() {
  const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_TELEMETRY);
  const [logs, setLogs] = useState<LogEntry[]>([
    makeLog("SYSTEM", "Robot simulator initialized. Ready for commands.", "info"),
  ]);
  const [waypointIdx, setWaypointIdx] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((command: string, message: string, type: LogEntry["type"]) => {
    setLogs(prev => [makeLog(command, message, type), ...prev].slice(0, 50));
  }, []);

  // Auto-scroll log to top on new entry
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  // Cleanup interval on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // ── Dispatch Command ───────────────────────────────────────────────────
  const handleDispatch = useCallback(() => {
    if (telemetry.status === "emergency_stop") {
      addLog("DISPATCH", "Cannot dispatch — Emergency Stop active. Clear fault first.", "error");
      return;
    }
    if (telemetry.battery < 15) {
      addLog("DISPATCH", "Cannot dispatch — Battery critically low (< 15%). Charge first.", "warning");
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);

    const target = WAYPOINTS[selectedTarget];
    addLog("DISPATCH", `Mission start → heading to ${target.label}`, "success");
    setTelemetry(prev => ({ ...prev, status: "dispatched", speed: 2.4, heading: Math.random() * 360 }));

    let step = 0;
    const totalSteps = 20;
    const startLat = telemetry.lat;
    const startLng = telemetry.lng;

    intervalRef.current = setInterval(() => {
      step++;
      const progress = step / totalSteps;

      setTelemetry(prev => ({
        ...prev,
        lat: startLat + (target.lat - startLat) * progress,
        lng: startLng + (target.lng - startLng) * progress,
        speed: 2.4 + Math.sin(step * 0.5) * 0.6,
        battery: Math.max(0, prev.battery - 0.3),
        heading: prev.heading + (Math.random() * 10 - 5),
      }));

      if (step === Math.floor(totalSteps / 2)) {
        addLog("TELEMETRY", `Midpoint reached — ${Math.round(progress * 100)}% complete`, "info");
      }

      if (step >= totalSteps) {
        clearInterval(intervalRef.current!);
        setTelemetry(prev => ({
          ...prev,
          lat: target.lat,
          lng: target.lng,
          speed: 0,
          status: "idle",
        }));
        setWaypointIdx(selectedTarget);
        addLog("DISPATCH", `✓ Arrived at ${target.label} — mission complete`, "success");
      }
    }, 600);
  }, [telemetry, selectedTarget, addLog]);

  // ── Charge Command ─────────────────────────────────────────────────────
  const handleCharge = useCallback(() => {
    if (telemetry.status === "dispatched") {
      addLog("CHARGE", "Cannot charge while in motion. Stop robot first.", "warning");
      return;
    }
    if (telemetry.battery >= 100) {
      addLog("CHARGE", "Battery already at 100%. No charging needed.", "info");
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);

    addLog("CHARGE", "Docking initiated — charging sequence started.", "info");
    setTelemetry(prev => ({ ...prev, status: "charging", speed: 0 }));

    intervalRef.current = setInterval(() => {
      setTelemetry(prev => {
        const newBattery = Math.min(100, prev.battery + 2);
        if (newBattery >= 100) {
          clearInterval(intervalRef.current!);
          addLog("CHARGE", "✓ Battery fully charged (100%). Ready to deploy.", "success");
          return { ...prev, battery: 100, status: "idle" };
        }
        return { ...prev, battery: newBattery };
      });
    }, 400);
  }, [telemetry.status, telemetry.battery, addLog]);

  // ── Emergency Stop ─────────────────────────────────────────────────────
  const handleEmergencyStop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTelemetry(prev => ({ ...prev, status: "emergency_stop", speed: 0 }));
    addLog("E-STOP", "⚠ Emergency stop engaged — all motors halted!", "error");
  }, [addLog]);

  // ── Clear Fault ────────────────────────────────────────────────────────
  const handleClearFault = useCallback(() => {
    setTelemetry(prev => ({ ...prev, status: "idle", speed: 0 }));
    addLog("CLEAR", "Fault cleared — robot returned to IDLE state.", "success");
  }, [addLog]);

  const statusCfg = STATUS_CONFIG[telemetry.status];

  const logTypeStyle: Record<LogEntry["type"], string> = {
    success: "text-brand-lime",
    warning: "text-brand-yellow",
    error:   "text-status-error",
    info:    "text-brand-gray/60",
  };

  const logIconMap: Record<LogEntry["type"], React.ReactNode> = {
    success: <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 text-brand-yellow shrink-0 mt-0.5" />,
    error:   <OctagonX className="h-3.5 w-3.5 text-status-error shrink-0 mt-0.5" />,
    info:    <Radio className="h-3.5 w-3.5 text-brand-gray/40 shrink-0 mt-0.5" />,
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-display font-extrabold tracking-tight flex items-center gap-3">
          <Cpu className="h-8 w-8 text-brand-lime" />
          Robot Simulator
        </h1>
        <p className="text-body text-brand-gray/50 mt-1">
          Interactive demo — command a virtual delivery robot and observe real-time telemetry responses.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: Robot Avatar + Status ─────────────────────────────── */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Robot Card */}
          <div className={`glassmorphism rounded-2xl border p-6 flex flex-col items-center gap-5 transition-all duration-500 ${statusCfg.border}`}>
            <div className="flex items-center justify-between w-full">
              <span className="text-caption font-bold text-brand-white">DSR-Unit Alpha</span>
              <span className={`text-micro font-bold px-2.5 py-1 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>

            <RobotAvatar state={telemetry.status} />

            {/* Battery bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between items-center text-micro">
                <span className="text-brand-gray/50 flex items-center gap-1">
                  <Zap className="h-3 w-3" />Battery
                </span>
                <span className={`font-bold ${telemetry.battery < 20 ? "text-status-error animate-pulse" : telemetry.battery < 50 ? "text-brand-yellow" : "text-brand-lime"}`}>
                  {telemetry.battery.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${telemetry.battery < 20 ? "bg-status-error" : telemetry.battery < 50 ? "bg-brand-yellow" : "bg-brand-lime"}`}
                  style={{ width: `${telemetry.battery}%` }}
                />
              </div>
            </div>
          </div>

          {/* Campus Map */}
          <CampusMap telemetry={telemetry} />
        </div>

        {/* ── Centre: Controls + Telemetry ────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Target Selector */}
          <div className="glassmorphism rounded-2xl border border-surface-4 p-5 space-y-3">
            <p className="text-caption font-bold text-brand-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-brand-lime" />
              Select Target Waypoint
            </p>
            <div className="grid grid-cols-3 gap-2">
              {WAYPOINTS.map((wp, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTarget(i)}
                  disabled={i === waypointIdx}
                  className={`px-3 py-2 rounded-lg text-micro font-bold border transition-all ${
                    i === selectedTarget
                      ? "bg-brand-lime/10 text-brand-lime border-brand-lime/40"
                      : i === waypointIdx
                      ? "bg-surface-2 text-brand-gray/30 border-surface-3 cursor-not-allowed"
                      : "bg-surface-2 text-brand-gray/60 border-surface-3 hover:border-brand-lime/20 hover:text-brand-white"
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Command Console */}
          <div className="glassmorphism rounded-2xl border border-surface-4 p-5 space-y-4">
            <p className="text-caption font-bold text-brand-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-lime" />
              Command Console
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Dispatch */}
              <button
                onClick={handleDispatch}
                disabled={telemetry.status === "dispatched" || telemetry.status === "charging"}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-body border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  telemetry.status === "dispatched" || telemetry.status === "charging"
                    ? "bg-surface-2 text-brand-gray/30 border-surface-3 cursor-not-allowed"
                    : "bg-brand-lime/10 text-brand-lime border-brand-lime/40 hover:bg-brand-lime/20 hover:shadow-glow-lime"
                }`}
              >
                <Play className="h-5 w-5" />
                Dispatch
              </button>

              {/* Charge */}
              <button
                onClick={handleCharge}
                disabled={telemetry.status === "dispatched" || telemetry.status === "charging"}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-body border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  telemetry.status === "dispatched" || telemetry.status === "charging"
                    ? "bg-surface-2 text-brand-gray/30 border-surface-3 cursor-not-allowed"
                    : "bg-status-info/10 text-status-info border-status-info/40 hover:bg-status-info/20"
                }`}
              >
                <BatteryCharging className="h-5 w-5" />
                Charge
              </button>

              {/* Emergency Stop */}
              <button
                onClick={handleEmergencyStop}
                disabled={telemetry.status === "emergency_stop" || telemetry.status === "idle" || telemetry.status === "fault"}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-body border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  telemetry.status === "emergency_stop" || telemetry.status === "idle" || telemetry.status === "fault"
                    ? "bg-surface-2 text-brand-gray/30 border-surface-3 cursor-not-allowed"
                    : "bg-status-error/10 text-status-error border-status-error/40 hover:bg-status-error/20"
                }`}
              >
                <OctagonX className="h-5 w-5" />
                Emergency Stop
              </button>

              {/* Clear Fault */}
              <button
                onClick={handleClearFault}
                disabled={telemetry.status !== "emergency_stop"}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-body border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  telemetry.status !== "emergency_stop"
                    ? "bg-surface-2 text-brand-gray/30 border-surface-3 cursor-not-allowed"
                    : "bg-surface-3 text-brand-white border-surface-4 hover:bg-surface-4"
                }`}
              >
                <RotateCcw className="h-5 w-5" />
                Clear Fault
              </button>
            </div>
          </div>

          {/* Live Telemetry Grid */}
          <div className="glassmorphism rounded-2xl border border-surface-4 p-5 space-y-4">
            <p className="text-caption font-bold text-brand-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-brand-lime" />
              Live Telemetry
              <span className="ml-auto flex items-center gap-1.5 text-micro text-brand-gray/40">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime animate-pulse" />
                STREAMING
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Latitude",  value: telemetry.lat.toFixed(6),         unit: "°N" },
                { label: "Longitude", value: telemetry.lng.toFixed(6),         unit: "°E" },
                { label: "Speed",     value: telemetry.speed.toFixed(1),       unit: "km/h" },
                { label: "Battery",   value: telemetry.battery.toFixed(0),     unit: "%" },
                { label: "Heading",   value: `${((telemetry.heading % 360 + 360) % 360).toFixed(0)}`, unit: "°" },
                { label: "Status",    value: statusCfg.label,                  unit: "" },
              ].map((t) => (
                <div key={t.label} className="bg-surface-1 border border-surface-3 rounded-xl p-3 space-y-1">
                  <p className="text-micro text-brand-gray/40 font-bold uppercase tracking-widest">{t.label}</p>
                  <p className="text-body font-extrabold text-brand-white font-mono">
                    {t.value}
                    {t.unit && <span className="text-micro text-brand-gray/40 ml-0.5">{t.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission Log ─────────────────────────────────────────────────── */}
      <div className="glassmorphism rounded-2xl border border-surface-4 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-caption font-bold text-brand-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-lime" />
            Mission Log
          </p>
          <button
            onClick={() => {
              setLogs([makeLog("SYSTEM", "Log cleared.", "info")]);
            }}
            className="text-micro text-brand-gray/40 hover:text-brand-gray/70 transition-colors"
          >
            Clear
          </button>
        </div>
        <div ref={logContainerRef} className="h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-micro font-mono">
              {logIconMap[log.type]}
              <span className="text-brand-gray/30 shrink-0">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className="text-brand-gray/50 shrink-0 font-bold">[{log.command}]</span>
              <span className={logTypeStyle[log.type]}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <RoleGuard roles={["admin", "operator"]}>
      <SimulatorContent />
    </RoleGuard>
  );
}
