"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Bot, RefreshCw, AlertTriangle, CheckCircle, Battery, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RobotsFleetPage() {
  const { token } = useAuthStore();

  const { data: robots = [], isLoading, refetch } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load robots list");
      return res.json();
    },
    enabled: !!token,
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
      default:
        return "text-brand-gray/40 bg-surface-2 border-surface-3";
    }
  };

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
          {robots.map((robot: any) => (
            <div key={robot.id} className="glassmorphism rounded-2xl border border-surface-4 p-6 flex flex-col justify-between hover:border-brand-lime/20 transition-all">
              <div className="space-y-4">
                {/* Robot Info & Status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-surface-1 border border-surface-3 text-brand-lime">
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

              {/* Action buttons */}
              <div className="flex items-center space-x-3 pt-6">
                <Link 
                  href={`/dashboard/robots/${robot.id}`}
                  className="flex-1 text-center py-2 rounded-lg border border-surface-4 hover:border-brand-lime/30 text-caption font-bold text-brand-white hover:text-brand-lime transition-all"
                >
                  Diagnostics
                </Link>
                {robot.battery_level < 20 && (
                  <div className="p-2 rounded-lg bg-status-error/10 text-status-error border border-status-error/20" title="Low Battery Alert">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
