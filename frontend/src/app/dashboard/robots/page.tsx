"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Bot, RefreshCw, Battery, Compass, WifiOff, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 glassmorphism rounded-2xl border border-status-error/20 bg-status-error/5">
      <div className="p-4 rounded-full bg-status-error/10 border border-status-error/20">
        <WifiOff className="h-8 w-8 text-status-error" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-body font-bold text-brand-white">Backend Unreachable</p>
        <p className="text-caption text-brand-gray/50 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error font-bold text-body hover:bg-status-error/20 transition-all"
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
        return "text-brand-lime bg-brand-lime/10 border-brand-lime/20";
      case "en_route":
        return "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20";
      case "charging":
        return "text-status-info bg-status-info/10 border-status-info/20";
      case "maintenance":
        return "text-status-error bg-status-error/10 border-status-error/20";
      case "offline":
        return "text-brand-gray/50 bg-surface-2 border-surface-3";
      default:
        return "text-brand-gray/40 bg-surface-2 border-surface-3";
    }
  };

  const isActivelyBusy = (status: string) =>
    ["en_route", "delivering", "returning"].includes(status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display font-extrabold tracking-tight">Fleet Management</h1>
          <p className="text-body text-brand-gray/50">
            Monitor telemetry, battery logs, and operations for all active delivery units.
          </p>
        </div>
        <button
          onClick={() => {
            refetch();
            toast.success("Fleet status updated");
          }}
          className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-lime transition-all"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Fleet Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
        </div>
      ) : isError ? (
        <ErrorPanel
          message="Could not load robot fleet from the API. Ensure the FastAPI backend is running on port 8000."
          onRetry={() => { refetch(); toast.info("Retrying fleet fetch..."); }}
        />
      ) : robots.length === 0 ? (
        <div className="text-center py-16 glassmorphism rounded-2xl border border-surface-4 space-y-4">
          <Bot className="h-12 w-12 text-brand-gray/20 mx-auto" />
          <p className="text-body font-bold text-brand-white">No Robots Configured</p>
          <p className="text-caption text-brand-gray/50 max-w-sm mx-auto">
            Please seed or register autonomous robot vehicles in the database to manage the fleet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot: any) => {
            const isOffline = robot.status === "offline";
            const isBusy = isActivelyBusy(robot.status);
            const isToggling = toggleMutation.isPending && toggleMutation.variables === robot.id;

            return (
              <div
                key={robot.id}
                className={`glassmorphism rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  isOffline
                    ? "border-surface-3 opacity-70"
                    : "border-surface-4 hover:border-brand-lime/20"
                }`}
              >
                <div className="space-y-4">
                  {/* Robot Info & Status */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${isOffline ? "bg-surface-2 border-surface-3 text-brand-gray/30" : "bg-surface-1 border-surface-3 text-brand-lime"}`}>
                        <Bot className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-body font-extrabold text-brand-white">{robot.name}</h4>
                        <p className="text-micro text-brand-gray/40">ID: DSR-0{robot.id}</p>
                      </div>
                    </div>
                    <span className={`text-micro font-bold px-2 py-0.5 rounded border capitalize ${getStatusColor(robot.status)}`}>
                      {robot.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Battery & Hardware Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-caption">
                      <span className="text-brand-gray/50 flex items-center space-x-1">
                        <Battery className="h-4 w-4" />
                        <span>Battery Charge</span>
                      </span>
                      <span className={`font-semibold ${
                        robot.battery_level < 20
                          ? "text-status-error animate-pulse"
                          : robot.battery_level < 50
                          ? "text-brand-yellow"
                          : "text-brand-lime"
                      }`}>
                        {robot.battery_level}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          robot.battery_level < 20
                            ? "bg-status-error"
                            : robot.battery_level < 50
                            ? "bg-brand-yellow"
                            : "bg-brand-lime"
                        }`}
                        style={{ width: `${robot.battery_level}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry snippet */}
                  <div className="grid grid-cols-2 gap-4 pt-2 text-micro text-brand-gray/50 border-t border-surface-4/40">
                    <div className="flex items-center space-x-1">
                      <Compass className="h-3.5 w-3.5 text-brand-gray/30" />
                      <span>Lat: {robot.location_lat?.toFixed(4) || "0.0000"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Compass className="h-3.5 w-3.5 text-brand-gray/30" />
                      <span>Lng: {robot.location_lng?.toFixed(4) || "0.0000"}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons — Admin Override Controls */}
                <div className="space-y-3 pt-6">
                  {/* Active / Idle Toggle — Primary Admin Control */}
                  <button
                    onClick={() => toggleMutation.mutate(robot.id)}
                    disabled={isBusy || isToggling}
                    title={
                      isBusy
                        ? "Cannot toggle while robot is actively delivering"
                        : isOffline
                        ? "Set robot to ACTIVE (Idle)"
                        : "Set robot to INACTIVE (Offline)"
                    }
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-caption transition-all border ${
                      isBusy || isToggling
                        ? "opacity-40 cursor-not-allowed border-surface-4 text-brand-gray/40 bg-surface-2"
                        : isOffline
                        ? "border-brand-lime/40 bg-brand-lime/10 text-brand-lime hover:bg-brand-lime hover:text-brand-black"
                        : "border-status-error/30 bg-status-error/10 text-status-error hover:bg-status-error/20"
                    }`}
                  >
                    {isToggling ? (
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : isOffline ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                    <span>{isOffline ? "Set Active" : "Set Inactive"}</span>
                  </button>

                  {/* Force Compartment Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/v1/robots/${robot.id}/compartment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ action: "open" }),
                          });
                          if (!res.ok) throw new Error("Compartment control failed");
                          toast.success(`Robot ${robot.name}: Compartment Force Unlocked 🔓`);
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-surface-1 hover:bg-brand-lime/10 border border-surface-4 hover:border-brand-lime/30 text-micro font-bold text-brand-gray/80 hover:text-brand-lime transition-all flex items-center justify-center space-x-1"
                      title="Admin Force Open Compartment Door"
                    >
                      <span>{"Force Unlock 🔓"}</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/v1/robots/${robot.id}/compartment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ action: "close" }),
                          });
                          if (!res.ok) throw new Error("Compartment control failed");
                          toast.success(`Robot ${robot.name}: Compartment Door Locked 🔒`);
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-surface-1 hover:bg-surface-2 border border-surface-4 text-micro font-bold text-brand-gray/80 hover:text-brand-white transition-all flex items-center justify-center space-x-1"
                      title="Admin Force Lock Compartment Door"
                    >
                      <span>{"Force Lock 🔒"}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/dashboard/robots/${robot.id}`}
                      className="flex-1 text-center py-2 rounded-lg border border-surface-4 hover:border-brand-lime/30 text-caption font-bold text-brand-white hover:text-brand-lime transition-all"
                    >
                      {"Diagnostics"}
                    </Link>

                    <button
                      disabled={isOffline}
                      onClick={async () => {
                        const targetBlock = prompt("Enter target block to dispatch robot (e.g., A Block, B Block, C Block, D Block, E Block):", "B Block");
                        if (!targetBlock) return;
                        try {
                          const res = await fetch(`/api/v1/robots/${robot.id}/dispatch`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ destination_block: targetBlock }),
                          });
                          if (!res.ok) throw new Error("Dispatch failed");
                          toast.success(`Dispatched ${robot.name} to ${targetBlock}`);
                          refetch();
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-caption font-bold transition-all ${
                        isOffline
                          ? "opacity-40 cursor-not-allowed bg-surface-2 border-surface-3 text-brand-gray/40"
                          : "bg-brand-lime/10 border border-brand-lime/30 text-brand-lime hover:bg-brand-lime hover:text-brand-black"
                      }`}
                      title={isOffline ? "Robot is offline" : "Dispatch Robot to Campus Block"}
                    >
                      {"Dispatch 🚀"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RobotsFleetPage() {
  return (
    <RoleGuard roles={["admin", "operator"]}>
      <FleetContent />
    </RoleGuard>
  );
}
