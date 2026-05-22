"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { 
  Package, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardOverview() {
  const { token } = useAuthStore();

  // Fetch Deliveries
  const { data: deliveries = [], isLoading: loadingDeliveries } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const res = await fetch("/api/v1/deliveries?per_page=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch Robots
  const { data: robots = [], isLoading: loadingRobots } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch robots");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
  });

  const activeDeliveries = deliveries.filter(
    (d: any) => d.status === "en_route" || d.status === "pending" || d.status === "arrived"
  );
  
  const availableRobots = robots.filter((r: any) => r.status === "idle");
  const lowBatteryRobots = robots.filter((r: any) => r.battery_level < 20);

  const metrics = [
    {
      title: "Active Deliveries",
      value: activeDeliveries.length,
      icon: Package,
      color: "text-brand-lime bg-brand-lime/10",
      description: "Missions currently processing",
    },
    {
      title: "Available Robots",
      value: `${availableRobots.length}/${robots.length}`,
      icon: Bot,
      color: "text-brand-yellow bg-brand-yellow/10",
      description: "Robots in IDLE state",
    },
    {
      title: "Completed Today",
      value: deliveries.filter((d: any) => d.status === "completed").length,
      icon: CheckCircle,
      color: "text-status-success bg-status-success/10",
      description: "Successful campus deliveries",
    },
    {
      title: "Low Battery Alerts",
      value: lowBatteryRobots.length,
      icon: AlertTriangle,
      color: lowBatteryRobots.length > 0 ? "text-status-error bg-status-error/10" : "text-brand-gray/30 bg-surface-2",
      description: "Battery below 20%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-display font-extrabold tracking-tight">Overview</h1>
          <p className="text-body text-brand-gray/50">
            Real-time operations dashboard for Silver Oak campus.
          </p>
        </div>
        <Link
          href="/dashboard/delivery/new"
          className="px-5 py-2.5 rounded-lg bg-brand-lime text-brand-black font-bold hover:shadow-glow-lime hover:scale-[1.02] transition-all text-body"
        >
          Request Robot Dispatch
        </Link>
      </div>

      {/* ── Metrics Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="glassmorphism rounded-2xl p-6 border border-surface-4 shadow-card hover:border-brand-lime/10 transition-colors">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-caption font-bold text-brand-gray/50">{m.title}</p>
                <p className="text-heading font-extrabold text-brand-white">{m.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${m.color}`}>
                <m.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-micro text-brand-gray/40 mt-4">{m.description}</p>
          </div>
        ))}
      </div>

      {/* ── Main Operations Split ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Deliveries List */}
        <div className="xl:col-span-2 glassmorphism rounded-2xl border border-surface-4 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-title font-bold">Active Deliveries</h3>
            <span className="text-caption font-bold text-brand-lime px-2 py-1 rounded bg-brand-lime/10">
              Live Updates
            </span>
          </div>

          {(loadingDeliveries || loadingRobots) ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
              <Package className="h-12 w-12 text-brand-gray/20" />
              <div>
                <p className="text-body font-bold text-brand-white">No Active Deliveries</p>
                <p className="text-caption text-brand-gray/40 max-w-xs">
                  There are no robots currently en route. Request a delivery to launch a mission.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {activeDeliveries.map((delivery: any) => (
                <div 
                  key={delivery.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-surface-1 border border-surface-3 hover:border-surface-4 transition-all"
                >
                  <div className="space-y-2 mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-body font-bold text-brand-white">{delivery.tracking_code}</span>
                      <span className={`text-micro font-semibold px-2 py-0.5 rounded capitalize ${
                        delivery.status === "en_route"
                          ? "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                          : delivery.status === "arrived"
                          ? "bg-status-success/10 text-status-success border border-status-success/20"
                          : "bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20"
                      }`}>
                        {delivery.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-brand-gray/50">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-brand-lime" />
                        <span>{delivery.origin_block} &rarr; {delivery.destination_block}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(delivery.created_at))} ago</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/delivery/${delivery.id}`}
                    className="flex items-center space-x-2 text-caption font-bold text-brand-lime hover:text-brand-yellow transition-colors self-end sm:self-auto"
                  >
                    <span>Track Robot</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Robot Status Sidebar */}
        <div className="glassmorphism rounded-2xl border border-surface-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-title font-bold">Fleet Status</h3>
            <Link 
              href="/dashboard/robots" 
              className="text-caption font-bold text-brand-lime hover:underline"
            >
              Manage
            </Link>
          </div>

          {loadingRobots ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
            </div>
          ) : robots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-brand-gray/30">
              <Bot className="h-10 w-10 mb-2" />
              <p className="text-caption">No robots configured in database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {robots.slice(0, 5).map((robot: any) => (
                <div key={robot.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-surface-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-surface-2 text-brand-gray">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-caption font-bold text-brand-white">{robot.name}</p>
                      <p className="text-micro text-brand-gray/40 capitalize">{robot.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-caption font-semibold ${
                      robot.battery_level < 20
                        ? "text-status-error"
                        : robot.battery_level < 50
                        ? "text-brand-yellow"
                        : "text-brand-lime"
                    }`}>
                      {robot.battery_level}%
                    </span>
                    <div className="w-16 bg-surface-3 h-1.5 rounded-full overflow-hidden mt-1">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
