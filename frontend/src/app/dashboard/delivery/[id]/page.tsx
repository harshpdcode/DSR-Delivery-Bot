"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
  Bot, 
  MapPin, 
  Package, 
  ShieldAlert, 
  Unlock, 
  Loader2, 
  CheckCircle2, 
  Play, 
  Compass, 
  Battery, 
  Gauge, 
  KeyRound,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// Coordinates and details for campus blocks
const CAMPUS_BLOCKS: Record<string, { x: number; y: number; label: string; name: string }> = {
  "A Block": { x: 120, y: 320, label: "A", name: "Main Administration" },
  "B Block": { x: 260, y: 150, label: "B", name: "Science & Tech" },
  "C Block": { x: 420, y: 180, label: "C", name: "Engineering & Lab" },
  "D Block": { x: 180, y: 80, label: "D", name: "Computer Applications" },
  "E Block": { x: 480, y: 350, label: "E", name: "Management & Humanities" },
};

export default function TrackingPage() {
  const { id } = useParams();
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [robot, setRobot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  // OTP State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Fetch initial state
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
    } catch (err: any) {
      toast.error(err.message || "Failed to load tracking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDeliveryDetails();
    }
  }, [token, id]);

  // WebSocket Connection
  useEffect(() => {
    if (!id || !token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/tracking/${id}`;
    
    const connectWs = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setSocketConnected(true);
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "initial" || msg.type === "telemetry" || msg.type === "status_change") {
          if (msg.status) {
            setDelivery((prev: any) => prev ? { ...prev, status: msg.status } : null);
          }
          if (msg.robot) {
            setRobot((prev: any) => prev ? { ...prev, ...msg.robot } : msg.robot);
          }
        }
      };

      socket.onclose = () => {
        setSocketConnected(false);
        // Retry connection after 3 seconds
        setTimeout(connectWs, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWs();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [id, token]);

  // Operations and Simulation Actions
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

  const handleSimulateArrival = async () => {
    if (!robot) return;
    setSimulationActive(true);
    try {
      // Direct mock status update in backend for arrival
      const destCoords = CAMPUS_BLOCKS[delivery.destination_block] || { x: 200, y: 200 };
      const res = await fetch(`/api/v1/robots/${robot.id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: "arrived",
          battery_level: Math.max(robot.battery_level - 5, 20),
          location_lat: destCoords.x,
          location_lng: destCoords.y
        }),
      });

      if (!res.ok) throw new Error("Simulating arrival failed");

      // Update delivery status in database to arrived
      // To bypass hardware triggers, update state.
      setDelivery((prev: any) => ({ ...prev, status: "arrived" }));
      toast.success("Simulation: Robot has arrived at destination!");
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSimulationActive(false);
    }
  };

  const handleGenerateOTP = async () => {
    try {
      const res = await fetch("/api/v1/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: parseInt(id as string),
          send_via: "email"
        }),
      });

      if (!res.ok) throw new Error("Could not request OTP");
      const data = await res.json();
      
      // Extract dev OTP from API response
      const match = data.message.match(/Dev OTP: (\d+)/);
      if (match) {
        setDevOtp(match[1]);
      }
      
      toast.success("OTP sent to receiver!");
      setOtpModalOpen(true);
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue) return;
    setOtpLoading(true);
    try {
      const res = await fetch("/api/v1/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: parseInt(id as string),
          otp: otpValue
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("OTP Verified! Compartment unlocked.");
        setOtpModalOpen(false);
        setOtpValue("");
        fetchDeliveryDetails();
      } else {
        toast.error(data.message || "Invalid OTP entered");
      }
    } catch (err: any) {
      toast.error("Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      const res = await fetch(`/api/v1/deliveries/${id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to complete delivery");
      toast.success("Delivery completed successfully!");
      fetchDeliveryDetails();
    } catch (err: any) {
      toast.error(err.message);
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
      </div>
    );
  }

  // Calculate current positions for SVG map rendering
  const originBlock = CAMPUS_BLOCKS[delivery.origin_block];
  const destBlock = CAMPUS_BLOCKS[delivery.destination_block];

  // Interpolate robot position on map
  let robotX = originBlock?.x || 100;
  let robotY = originBlock?.y || 100;

  if (delivery.status === "completed" || delivery.status === "returning") {
    robotX = destBlock?.x || 100;
    robotY = destBlock?.y || 100;
  } else if (delivery.status === "en_route" && robot?.lat && robot?.lng) {
    // If coordinates are set (lat represents x, lng represents y in dev simulation)
    robotX = robot.lat;
    robotY = robot.lng;
  } else if (delivery.status === "arrived" || delivery.status === "waiting_otp" || delivery.status === "otp_verified") {
    robotX = destBlock?.x || 100;
    robotY = destBlock?.y || 100;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-heading font-extrabold tracking-tight">{delivery.tracking_code}</h1>
            <span className={`text-caption font-bold px-2 py-0.5 rounded capitalize ${
              delivery.status === "completed" 
                ? "bg-status-success/15 text-status-success border border-status-success/20" 
                : "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
            }`}>
              {delivery.status.replace("_", " ")}
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
            socketConnected ? "bg-status-success/10 border-status-success/20 text-status-success" : "bg-status-warning/10 border-status-warning/20 text-status-warning"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? "bg-status-success animate-pulse" : "bg-status-warning"}`} />
            <span>{socketConnected ? "Live Telemetry Active" : "Connecting Live Feed..."}</span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column: Campus Map Representation */}
        <div className="xl:col-span-2 glassmorphism rounded-3xl border border-surface-4 p-6 flex flex-col justify-between h-[500px] relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 space-y-1">
            <h3 className="text-caption font-bold uppercase tracking-wider text-brand-gray/40">Campus Radar Map</h3>
            <p className="text-micro text-brand-gray/60">Silver Oak University Campus Map Grid</p>
          </div>

          {/* SVG Map Canvas */}
          <div className="flex-1 flex items-center justify-center w-full h-full">
            <svg viewBox="0 0 600 450" className="w-full h-full max-h-[400px]">
              {/* Background Grid Pattern */}
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />

              {/* Connecting path */}
              {originBlock && destBlock && (
                <path 
                  d={`M ${originBlock.x} ${originBlock.y} L ${destBlock.x} ${destBlock.y}`}
                  stroke="#C6FF00" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="opacity-50"
                />
              )}

              {/* Render Blocks */}
              {Object.entries(CAMPUS_BLOCKS).map(([blockName, b]) => {
                const isOrigin = blockName === delivery.origin_block;
                const isDest = blockName === delivery.destination_block;
                const isSelected = isOrigin || isDest;
                
                return (
                  <g key={blockName} className="cursor-pointer">
                    <circle 
                      cx={b.x} 
                      cy={b.y} 
                      r={isSelected ? "18" : "12"}
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
                      <circle 
                        cx={b.x} 
                        cy={b.y} 
                        r="32" 
                        className="fill-none stroke-status-success/20 animate-pulse-slow" 
                        strokeWidth="1.5"
                      />
                    )}
                    <text 
                      x={b.x} 
                      y={b.y + 4} 
                      textAnchor="middle" 
                      className={`text-[10px] font-extrabold fill-brand-white`}
                    >
                      {b.label}
                    </text>
                    <text 
                      x={b.x} 
                      y={b.y + 24} 
                      textAnchor="middle" 
                      className={`text-[8px] font-bold ${isSelected ? "fill-brand-lime" : "fill-brand-gray/30"}`}
                    >
                      {blockName}
                    </text>
                  </g>
                );
              })}

              {/* Moving Robot Icon */}
              {robot && (
                <g transform={`translate(${robotX}, ${robotY})`} className="transition-all duration-1000 ease-out">
                  <circle r="12" className="fill-brand-black stroke-brand-yellow" strokeWidth="2" />
                  <circle r="22" className="fill-none stroke-brand-yellow/30 ring-indicator" strokeWidth="1" />
                  <g transform="translate(-7, -7)">
                    <Bot className="h-3.5 w-3.5 text-brand-yellow" />
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right column: Details and Controls */}
        <div className="space-y-6">
          {/* Mission Stats */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Package className="h-5 w-5 text-brand-lime" />
              <span>Mission Intel</span>
            </h3>

            <div className="space-y-4 text-caption">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-4/40">
                <div>
                  <span className="text-brand-gray/40 block">Sender</span>
                  <span className="font-semibold text-brand-white">You</span>
                </div>
                <div>
                  <span className="text-brand-gray/40 block">Receiver</span>
                  <span className="font-semibold text-brand-white truncate block">{delivery.receiver_name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-4/40">
                <div>
                  <span className="text-brand-gray/40 block">Route</span>
                  <span className="font-semibold text-brand-white">{delivery.origin_block} &rarr; {delivery.destination_block}</span>
                </div>
                <div>
                  <span className="text-brand-gray/40 block">Package Details</span>
                  <span className="font-semibold text-brand-white truncate block">{delivery.package_description} ({delivery.package_weight_kg}kg)</span>
                </div>
              </div>

              {robot && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Battery className="h-5 w-5 text-brand-lime mb-1" />
                    <span className="text-micro text-brand-gray/40">Battery</span>
                    <span className="font-bold text-brand-white">{robot.battery_level}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Gauge className="h-5 w-5 text-brand-yellow mb-1" />
                    <span className="text-micro text-brand-gray/40">Speed</span>
                    <span className="font-bold text-brand-white">{robot.speed || 0.0} m/s</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-1 border border-surface-3 flex flex-col items-center">
                    <Compass className="h-5 w-5 text-status-info mb-1" />
                    <span className="text-micro text-brand-gray/40">Heading</span>
                    <span className="font-bold text-brand-white">{robot.heading || 0}&deg;</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Center */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Play className="h-5 w-5 text-brand-lime" />
              <span>Control Operations</span>
            </h3>

            <div className="space-y-4">
              {/* Mission Pending State */}
              {delivery.status === "pending" && (
                <button
                  onClick={handleStartMission}
                  className="w-full py-3 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Mission</span>
                </button>
              )}

              {/* Simulation Arrival Helper */}
              {delivery.status === "en_route" && (
                <button
                  onClick={handleSimulateArrival}
                  disabled={simulationActive}
                  className="w-full py-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow font-bold hover:bg-brand-yellow/20 transition-all flex items-center justify-center space-x-2"
                >
                  {simulationActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Compass className="h-5 w-5" />}
                  <span>Simulate Arrival</span>
                </button>
              )}

              {/* OTP Generation (Request Unlock Code) */}
              {(delivery.status === "arrived" || delivery.status === "waiting_otp") && (
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateOTP}
                    className="w-full py-3 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
                  >
                    <KeyRound className="h-5 w-5" />
                    <span>Generate OTP Unlock Code</span>
                  </button>
                  {delivery.status === "waiting_otp" && (
                    <button
                      onClick={() => setOtpModalOpen(true)}
                      className="w-full py-3 rounded-xl border border-surface-4 hover:bg-surface-2 transition-colors flex items-center justify-center space-x-2 text-brand-white font-bold"
                    >
                      <Unlock className="h-5 w-5" />
                      <span>Enter Lock Code</span>
                    </button>
                  )}
                </div>
              )}

              {/* Compartment is open / Complete */}
              {delivery.status === "otp_verified" && (
                <button
                  onClick={handleCompleteDelivery}
                  className="w-full py-3 rounded-xl bg-status-success text-brand-white font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
                >
                  <Unlock className="h-5 w-5" />
                  <span>Verify Compartment Lock & Return</span>
                </button>
              )}

              {/* Mission Completed */}
              {delivery.status === "completed" && (
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  <div>
                    <span className="font-bold text-caption block">Mission Succeeded</span>
                    <span className="text-micro text-brand-gray/50">The package was successfully verified and collected.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── OTP Verification Modal ────────────────────── */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 backdrop-blur-md p-6">
          <div className="w-full max-w-sm glassmorphism rounded-2xl p-6 border border-surface-4 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-title font-bold">Verification</h3>
              <button 
                onClick={() => setOtpModalOpen(false)}
                className="text-brand-gray hover:text-brand-white text-caption font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-caption text-brand-gray/60">
                Enter the 6-digit secure code sent to the recipient to unlock the robot cargo hatch.
              </p>

              {/* Dev Helper */}
              {devOtp && (
                <div className="p-3 rounded bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-micro font-mono">
                  [DEV MODE] OTP CODE: <span className="font-extrabold underline text-body">{devOtp}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-3 px-4 text-center tracking-[0.5em] text-title font-bold text-brand-white"
              />

              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otpValue.length < 6}
                className="w-full py-3 rounded-lg bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {otpLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                <span>Unlock Compartment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
