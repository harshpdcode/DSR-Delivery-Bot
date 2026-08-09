"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Bot, RefreshCw, Battery, Compass, WifiOff, Power, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import dynamic from "next/dynamic";

const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="glassmorphism rounded-2xl border border-surface-4 p-4 h-[340px] flex items-center justify-center">
      <span className="text-micro text-brand-gray/40">Loading campus fleet map...</span>
    </div>
  ),
});

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 glassmorphism rounded-3xl border border-status-error/20 bg-status-error/5 p-6">
      <div className="p-4 rounded-full bg-status-error/10 text-status-error">
        <WifiOff className="h-8 w-8" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-body font-bold text-brand-white">Backend Unreachable</p>
        <p className="text-caption text-brand-gray/50 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error font-bold text-body hover:bg-status-error/20 transition-all shadow-xs"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </button>
    </div>
  );
}

function FleetContent() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: robots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}. Check backend is running.`);
      return res.json();
    },
    enabled: !!token,
    retry: 1,
  });

  const toggleMutation = useMutation({
    mutationFn: async (robotId: number) => {
      const res = await fetch(`/api/v1/robots/${robotId}/toggle-status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Toggle failed" }));
        throw new Error(err.detail || "Toggle failed");
      }
      return res.json();
    },
    onSuccess: (updated: any) => {
      toast.success(
        `${updated.name} is now ${updated.status === "offline" ? "INACTIVE 🔴" : "ACTIVE 🟢"}`
      );
      queryClient.invalidateQueries({ queryKey: ["robots"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "text-brand-black bg-brand-lime";
      case "en_route":
        return "text-brand-black bg-brand-yellow";
      case "charging":
        return "text-white bg-blue-600";
      case "maintenance":
        return "text-white bg-red-600";
      case "offline":
        return "text-brand-gray/60 bg-surface-3";
      default:
        return "text-brand-gray/60 bg-surface-3";
    }
  };

  const isActivelyBusy = (status: string) =>
    ["en_route", "delivering", "returning"].includes(status);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-display font-extrabold tracking-tight text-brand-white">Fleet Management</h1>
          <p className="text-body text-brand-gray/60 font-medium">
            Monitor telemetry, battery logs, and real-time campus locations for all active delivery units.
          </p>
        </div>
        <button
          onClick={() => {
            refetch();
            toast.success("Fleet status updated");
          }}
          className="p-3 rounded-xl bg-surface-2 border border-surface-3 hover:bg-brand-lime hover:text-brand-black text-brand-white shadow-xs transition-all flex items-center space-x-2 text-caption font-bold"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Fleet</span>
        </button>
      </div>

      {/* ── ADMIN/OPERATOR LIVE CAMPUS RADAR MAP ────────────────────── */}
      <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-title font-bold text-brand-white flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-brand-lime" />
              <span>Campus Fleet Live Radar Map</span>
            </h3>
            <p className="text-micro text-brand-gray/60 mt-0.5">Real-time GPS coordinates and route telemetry across campus buildings</p>
          </div>
          <span className="text-micro font-bold text-brand-lime px-2.5 py-1 rounded bg-brand-lime/10 border border-brand-lime/20">
            {robots.length} Units Active
          </span>
        </div>

        <div className="h-[360px] rounded-2xl overflow-hidden border border-surface-3 relative">
          <CampusMap
            robotsList={robots.map((r: any) => ({
              id: r.id,
              name: r.name,
              lat: r.location_lat || 23.0906,
              lng: r.location_lng || 72.5344,
              status: r.status,
              heading: r.heading || 45,
            }))}
            followRobot={false}
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
        </div>
      ) : isError ? (
        <ErrorPanel
          message="Could not load robot fleet from the API. Ensure FastAPI backend is running on port 8000."
          onRetry={() => { refetch(); toast.info("Retrying fleet fetch..."); }}
        />
      ) : robots.length === 0 ? (
        <div className="text-center py-16 glassmorphism rounded-3xl border border-surface-4 shadow-sm space-y-4">
          <Bot className="h-12 w-12 text-brand-gray/40 mx-auto" />
          <p className="text-body font-bold text-brand-white">No Robots Configured</p>
          <p className="text-caption text-brand-gray/60 max-w-sm mx-auto">
            Please seed or register autonomous robot vehicles in the database to manage the fleet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot: any) => {
            const isOffline = robot.status === "offline";
            const isBusy = isActivelyBusy(robot.status);

            return (
              <div
                key={robot.id}
                className={`glassmorphism rounded-3xl border border-surface-4 p-6 flex flex-col justify-between space-y-6 ${
                  isOffline ? "opacity-75" : ""
                }`}
              >
                <div className="space-y-4">
                  {/* Robot Info & Status */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {/* Robo.webp Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center p-1 shadow-xs shrink-0">
                        <img src="/Robo.webp" alt="Robo" className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-body font-bold text-brand-white">{robot.name}</h4>
                        <p className="text-micro font-medium text-brand-gray/60">ID: DSR-0{robot.id}</p>
                      </div>
                    </div>
                    <span className={`text-micro font-extrabold px-2.5 py-1 rounded-full uppercase ${getStatusColor(robot.status)}`}>
                      {robot.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Battery Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-caption font-bold text-brand-gray/60">
                      <span className="flex items-center space-x-1">
                        <Battery className="h-4 w-4 text-brand-lime" />
                        <span>Battery Charge</span>
                      </span>
                      <span className="text-brand-white font-extrabold">{robot.battery_level}%</span>
                    </div>
                    <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-lime"
                        style={{ width: `${robot.battery_level}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry snippet */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-micro font-medium text-brand-gray/60 border-t border-surface-3">
                    <div>
                      <span className="block text-brand-gray/40">Model</span>
                      <span className="font-bold text-brand-white">{robot.model_type || "Express Runner"}</span>
                    </div>
                    <div>
                      <span className="block text-brand-gray/40">Payload</span>
                      <span className="font-bold text-brand-white">{robot.payload_capacity_kg || 15} kg</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-surface-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleMutation.mutate(robot.id)}
                    disabled={isBusy || toggleMutation.isPending}
                    className={`w-full py-2.5 px-3 rounded-xl text-caption font-bold flex items-center justify-center space-x-2 transition-all ${
                      isOffline
                        ? "bg-brand-lime text-brand-black hover:shadow-glow-lime"
                        : "bg-surface-2 border border-surface-3 text-brand-gray/60 hover:text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    <span>{isOffline ? "Activate Unit" : "Deactivate Unit"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RobotsPage() {
  return (
    <RoleGuard roles={["admin", "operator"]}>
      <FleetContent />
    </RoleGuard>
  );
}
