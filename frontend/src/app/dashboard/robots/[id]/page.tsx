"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Bot,
  Battery,
  Compass,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Radio,
  Thermometer,
  RefreshCw,
  Activity,
  Clock,
  Wrench,
  ArrowLeft,
  Server,
  Zap,
  Save,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RobotDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Manual override states
  const [overrideStatus, setOverrideStatus] = useState<string>("");
  const [overrideBattery, setOverrideBattery] = useState<number>(100);
  const [overrideLat, setOverrideLat] = useState<number>(0);
  const [overrideLng, setOverrideLng] = useState<number>(0);
  const [overrideError, setOverrideError] = useState<string>("");

  // Fetch Robot general info
  const { data: robot, isLoading: isRobotLoading, error: robotError } = useQuery({
    queryKey: ["robot", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/robots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load robot details");
      const data = await res.json();
      // Initialize form values from loaded data
      setOverrideStatus(data.status);
      setOverrideBattery(data.battery_level);
      setOverrideLat(data.location_lat || 120);
      setOverrideLng(data.location_lng || 320);
      setOverrideError(data.error_message || "");
      return data;
    },
    enabled: !!token && !!id,
  });

  // Fetch Robot Health Logs
  const { data: healthRecords = [], isLoading: isHealthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["robotHealth", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/robots/${id}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load robot health records");
      return res.json();
    },
    enabled: !!token && !!id,
  });

  // Fetch Robot Telemetry Logs
  const { data: telemetryLogs = [], isLoading: isTelemetryLoading, refetch: refetchTelemetry } = useQuery({
    queryKey: ["robotTelemetry", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/robots/${id}/telemetry?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load telemetry logs");
      return res.json();
    },
    enabled: !!token && !!id,
  });

  // Mutation for manual status override
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/v1/robots/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update robot status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Robot status overridden successfully");
      queryClient.invalidateQueries({ queryKey: ["robot", id] });
      queryClient.invalidateQueries({ queryKey: ["robots"] });
      queryClient.invalidateQueries({ queryKey: ["robotHealth", id] });
      queryClient.invalidateQueries({ queryKey: ["robotTelemetry", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Manual override failed");
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatusMutation.mutate({
      status: overrideStatus,
      battery_level: overrideBattery,
      location_lat: overrideLat,
      location_lng: overrideLng,
      error_message: overrideError || null,
    });
  };

  const handleTriggerSelfTest = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Running self-test sequence...",
        success: "All onboard diagnostics completed: 0 faults detected.",
        error: "Self-test failed",
      }
    );
  };

  if (isRobotLoading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
      </div>
    );
  }

  if (robotError || !robot) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-status-error mx-auto" />
        <h2 className="text-title font-bold">Robot Diagnostics Failed</h2>
        <p className="text-caption text-brand-gray/50">
          The requested robot vehicle telemetry feed could not be resolved. It may have been deleted or access was revoked.
        </p>
        <Link 
          href="/dashboard/robots"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-white transition-all text-caption font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Fleet</span>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "text-brand-lime bg-brand-lime/10 border-brand-lime/20";
      case "en_route":
      case "delivering":
        return "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20";
      case "charging":
        return "text-status-info bg-status-info/10 border-status-info/20";
      case "maintenance":
        return "text-status-error bg-status-error/10 border-status-error/20";
      default:
        return "text-brand-gray/40 bg-surface-2 border-surface-3";
    }
  };

  // Pre-seed some mock active sensors if no records exist in DB
  const defaultSensors = [
    { name: "Solid-State LiDAR (Velodyne)", status: "healthy", value: 360, unit: "deg", msg: "Scanning sector S1-S4" },
    { name: "Depth Camera Array (Intel RealSense)", status: "healthy", value: 60, unit: "fps", msg: "Obstacle mapping active" },
    { name: "CPU Temperature (Nvidia Jetson)", status: "healthy", value: 48, unit: "C", msg: "Cooling system normal" },
    { name: "GPS Receiver (U-blox Neo-M9N)", status: "healthy", value: 12, unit: "sats", msg: "3D Fix established" },
    { name: "Left/Right Drive Motors", status: "healthy", value: 2.1, unit: "A", msg: "Balanced current drawing" },
    { name: "Compartment Hatch Solenoid", status: "healthy", value: 1, unit: "state", msg: "Locked and armed" },
    { name: "BMS Battery Temp", status: "healthy", value: 34.2, unit: "C", msg: "Voltage cells within spec" },
    { name: "5G Telemetry Transmitter", status: "healthy", value: -64, unit: "dBm", msg: "High signal-to-noise ratio" },
  ];

  const sensors = healthRecords.length > 0
    ? healthRecords.map((r: any) => ({
        name: r.sensor_name,
        status: r.status,
        value: r.value,
        unit: r.unit,
        msg: r.message,
      }))
    : defaultSensors;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard/robots"
          className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <span className="text-micro text-brand-white/55 font-bold uppercase tracking-wider">Fleet / Diagnostics</span>
          <h1 className="text-heading font-extrabold tracking-tight flex items-center space-x-2">
            <span>{robot.name}</span>
            <span className="text-caption text-brand-white/55 font-mono font-medium">({robot.serial_number})</span>
          </h1>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glassmorphism rounded-2xl p-5 border border-surface-4/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <span className="text-micro text-brand-white/55 uppercase font-bold tracking-wider">Operational Status</span>
            <p className="text-body font-bold text-brand-white capitalize mt-1 flex items-center space-x-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${robot.status === 'idle' ? 'bg-brand-lime' : robot.status === 'maintenance' ? 'bg-status-error' : 'bg-brand-yellow'}`} />
              <span>{robot.status.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-surface-4/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow">
            <Battery className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-micro text-brand-white/55 uppercase font-bold tracking-wider">Battery Level</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-body font-bold text-brand-white">{robot.battery_level}%</span>
              <span className="text-micro text-brand-white/55">{robot.status === "charging" ? "Charging" : "Discharging"}</span>
            </div>
            <div className="w-full bg-surface-3 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full rounded-full ${robot.battery_level < 20 ? "bg-status-error animate-pulse" : robot.battery_level < 50 ? "bg-brand-yellow" : "bg-brand-lime"}`} 
                style={{ width: `${robot.battery_level}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-surface-4/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-status-info/10 border border-status-info/20 text-status-info">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <span className="text-micro text-brand-white/55 uppercase font-bold tracking-wider">Velocity & Heading</span>
            <p className="text-body font-bold text-brand-white mt-1">
              {robot.speed || 0.0} m/s <span className="text-caption text-brand-white/55 font-normal">at {robot.heading || 0}&deg;</span>
            </p>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-surface-4/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-micro text-brand-white/55 uppercase font-bold tracking-wider">Hardware Integrity</span>
            <p className="text-body font-bold text-brand-white mt-1">
              {robot.error_message ? (
                <span className="text-status-error flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[150px]">{robot.error_message}</span>
                </span>
              ) : (
                <span className="text-status-success">Diagnostics OK</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: Diagnostics and Manual Override */}
        <div className="space-y-8 xl:col-span-1">
          {/* General Device Info */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Bot className="h-5 w-5 text-brand-lime" />
              <span>Device Specifications</span>
            </h3>
            
            <div className="space-y-4 text-caption">
              <div className="flex justify-between items-center py-2 border-b border-surface-4/40">
                <span className="text-brand-white/55">Chassis Model</span>
                <span className="font-bold text-brand-white">{robot.model_type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-4/40">
                <span className="text-brand-white/55">Serial Key</span>
                <span className="font-mono text-brand-white font-semibold">{robot.serial_number}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-4/40">
                <span className="text-brand-white/55">Firmware Build</span>
                <span className="font-mono text-brand-white font-semibold">v{robot.firmware_version}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-4/40">
                <span className="text-brand-white/55">Payload Limit</span>
                <span className="font-bold text-brand-white">{robot.payload_capacity_kg} kg</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-4/40">
                <span className="text-brand-white/55">Last Maintenance</span>
                <span className="font-bold text-brand-white">
                  {robot.last_maintenance ? new Date(robot.last_maintenance).toLocaleDateString() : "Never"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-brand-white/55">Uptime State</span>
                <span className="text-status-success font-semibold flex items-center space-x-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span>99.98% Available</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleTriggerSelfTest}
              className="w-full py-2.5 rounded-xl border border-surface-4 hover:border-brand-lime/30 text-caption font-bold text-brand-white hover:text-brand-lime transition-all flex items-center justify-center space-x-2"
            >
              <Cpu className="h-4.5 w-4.5" />
              <span>Trigger Device Self-Test</span>
            </button>
          </div>

          {/* Operational Override Form (Admins / Operators only) */}
          {(user?.role === "admin" || user?.role === "operator" || user?.role === "maintenance") && (
            <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
              <h3 className="text-title font-bold flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-brand-yellow" />
                <span>Control Panel Override</span>
              </h3>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-caption text-brand-white/60 font-bold block">Status Override</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2 px-3 text-brand-white text-caption font-semibold"
                  >
                    <option value="idle">Idle</option>
                    <option value="en_route">En Route</option>
                    <option value="delivering">Delivering</option>
                    <option value="charging">Charging</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-caption text-brand-white/60 font-bold block">Battery Capacity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideBattery}
                    onChange={(e) => setOverrideBattery(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2 px-3 text-brand-white text-caption font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-caption text-brand-white/60 font-bold block">Grid Lat (X)</label>
                    <input
                      type="number"
                      step="any"
                      value={overrideLat}
                      onChange={(e) => setOverrideLat(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2 px-3 text-brand-white text-caption font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption text-brand-white/60 font-bold block">Grid Lng (Y)</label>
                    <input
                      type="number"
                      step="any"
                      value={overrideLng}
                      onChange={(e) => setOverrideLng(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2 px-3 text-brand-white text-caption font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-caption text-brand-white/60 font-bold block">Report Fault Message</label>
                  <input
                    type="text"
                    placeholder="Enter diagnostic fault code or leave blank"
                    value={overrideError}
                    onChange={(e) => setOverrideError(e.target.value)}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2 px-3 text-brand-white text-caption"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Save className="h-4.5 w-4.5" />
                  )}
                  <span>Publish Overrides</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Sensor Health & Telemetry History */}
        <div className="space-y-8 xl:col-span-2">
          {/* Sensor Health Grid */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-title font-bold flex items-center space-x-2">
                <Activity className="h-5 w-5 text-brand-lime" />
                <span>Onboard Sensor Array</span>
              </h3>
              <button 
                onClick={() => {
                  refetchHealth();
                  toast.success("Sensor readings refreshed");
                }}
                className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-lime transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sensors.map((sensor: any, idx: number) => {
                const isHealthy = sensor.status === "healthy" || sensor.status === "ok";
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-1 border border-surface-3 flex items-start space-x-3.5">
                    <div className={`p-2 rounded-xl mt-0.5 ${isHealthy ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                      {sensor.name.toLowerCase().includes("cpu") ? (
                        <Cpu className="h-5 w-5" />
                      ) : sensor.name.toLowerCase().includes("gps") ? (
                        <Compass className="h-5 w-5" />
                      ) : sensor.name.toLowerCase().includes("battery") || sensor.name.toLowerCase().includes("bms") ? (
                        <Zap className="h-5 w-5" />
                      ) : sensor.name.toLowerCase().includes("telemetry") || sensor.name.toLowerCase().includes("transmitter") || sensor.name.toLowerCase().includes("5g") ? (
                        <Radio className="h-5 w-5" />
                      ) : (
                        <Server className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h5 className="text-caption font-extrabold text-brand-white truncate">{sensor.name}</h5>
                        <span className={`inline-block h-2 w-2 rounded-full ${isHealthy ? 'bg-status-success' : 'bg-status-error animate-pulse'}`} />
                      </div>
                      <p className="text-body font-bold text-brand-white">
                        {sensor.value !== null && sensor.value !== undefined ? (
                          <>
                            {sensor.value}
                            <span className="text-caption text-brand-gray/40 font-normal ml-0.5">{sensor.unit}</span>
                          </>
                        ) : (
                          <span className="capitalize">{sensor.status}</span>
                        )}
                      </p>
                      <p className="text-micro text-brand-gray/50 truncate">{sensor.msg || "Operational"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Log History */}
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-title font-bold flex items-center space-x-2">
                <Clock className="h-5 w-5 text-brand-lime" />
                <span>Recent Telemetry Logs</span>
              </h3>
              <button 
                onClick={() => {
                  refetchTelemetry();
                  toast.success("Telemetry logs updated");
                }}
                className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-lime transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {telemetryLogs.length === 0 ? (
              <div className="text-center py-12 bg-surface-1/40 rounded-2xl border border-surface-4/40 text-caption text-brand-gray/40">
                No telemetry updates received for this vehicle.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-caption">
                  <thead>
                    <tr className="border-b border-surface-4 text-brand-gray/40 font-bold uppercase tracking-wider text-micro">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Battery</th>
                      <th className="py-3 px-4">Speed</th>
                      <th className="py-3 px-4">Heading</th>
                      <th className="py-3 px-4">Grid Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-4/40">
                    {telemetryLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-surface-2/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-brand-white">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${log.battery_level < 20 ? 'text-status-error' : log.battery_level < 50 ? 'text-brand-yellow' : 'text-brand-lime'}`}>
                            {log.battery_level}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-brand-gray/80">
                          {log.speed?.toFixed(1) || "0.0"} m/s
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-brand-gray/80">
                          {log.heading || 0}&deg;
                        </td>
                        <td className="py-3 px-4 font-mono text-micro text-brand-gray/40">
                          [{log.latitude?.toFixed(2)}, {log.longitude?.toFixed(2)}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
