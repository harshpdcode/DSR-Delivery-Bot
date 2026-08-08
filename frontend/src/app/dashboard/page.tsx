"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { 
  Package, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  MapPin,
  Clock,
  WifiOff,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 glassmorphism rounded-2xl border border-status-error/20 bg-status-error/5">
      <div className="p-3 rounded-full bg-status-error/10 border border-status-error/20">
        <WifiOff className="h-7 w-7 text-status-error" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-body font-bold text-brand-white">Connection Error</p>
        <p className="text-caption text-brand-gray/50 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error font-bold text-caption hover:bg-status-error/20 transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

export default function DashboardOverview() {
  const { token } = useAuthStore();

  // Fetch Deliveries
  const { data: deliveries = [], isLoading: loadingDeliveries, isError: deliveriesError, refetch: refetchDeliveries } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const res = await fetch("/api/v1/deliveries?per_page=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status} — is the server running?`);
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    retry: 1,
  });

  // Fetch Robots
  const { data: robots = [], isLoading: loadingRobots, isError: robotsError, refetch: refetchRobots } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status} — is the server running?`);
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    retry: 1,
  });

  const activeDeliveries = deliveries.filter(
    (d: any) => ![
      "completed", "cancelled", "failed"
    ].includes(d.status)
  );
  // All recent deliveries for the list (includes completed)
  const recentDeliveries = deliveries.slice(0, 8);
  
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Deliveries List */}
        <div className="lg:col-span-7 xl:col-span-8 glassmorphism rounded-2xl border border-surface-4 p-6 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-title font-bold">My Deliveries</h3>
              <p className="text-micro text-brand-gray/40 mt-0.5">Track & manage your delivery requests</p>
            </div>
            <Link
              href="/dashboard/delivery/new"
              className="text-caption font-bold text-brand-lime px-3 py-1.5 rounded-lg bg-brand-lime/10 hover:bg-brand-lime hover:text-brand-black transition-all"
            >
              + New
            </Link>
          </div>

          {(loadingDeliveries || loadingRobots) ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
            </div>
          ) : deliveriesError ? (
            <ErrorPanel
              message="Could not reach the backend API. Check that the server is running."
              onRetry={() => { refetchDeliveries(); refetchRobots(); }}
            />
          ) : recentDeliveries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
              <Package className="h-12 w-12 text-brand-gray/20" />
              <div>
                <p className="text-body font-bold text-brand-white">No Deliveries Yet</p>
                <p className="text-caption text-brand-gray/40 max-w-xs">
                  You haven&apos;t made any deliveries yet. Tap &quot;+ New&quot; to request your first dispatch.
                </p>
              </div>
              <Link
                href="/dashboard/delivery/new"
                className="px-4 py-2 rounded-lg bg-brand-lime text-brand-black font-bold text-caption hover:shadow-glow-lime transition-all"
              >
                Request Delivery
              </Link>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentDeliveries.map((delivery: any) => {
                const isActive = !["completed", "cancelled", "failed"].includes(delivery.status);
                const isPickup = delivery.status === "pickup_in_progress";
                return (
                  <div
                    key={delivery.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                      isPickup
                        ? "bg-brand-yellow/5 border-brand-yellow/30"
                        : isActive
                        ? "bg-surface-1 border-surface-3 hover:border-brand-lime/20"
                        : "bg-surface-0 border-surface-3/50 opacity-60"
                    }`}
                  >
                    <div className="space-y-1.5 mb-3 sm:mb-0 flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-body font-bold text-brand-white">{delivery.tracking_code}</span>
                        <span className={`text-micro font-semibold px-2 py-0.5 rounded capitalize ${
                          delivery.status === "completed"
                            ? "bg-status-success/10 text-status-success border border-status-success/20"
                            : delivery.status === "pickup_in_progress"
                            ? "bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20"
                            : delivery.status === "en_route"
                            ? "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                            : delivery.status === "arrived"
                            ? "bg-status-info/10 text-status-info border border-status-info/20"
                            : delivery.status === "cancelled" || delivery.status === "failed"
                            ? "bg-status-error/10 text-status-error border border-status-error/20"
                            : "bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20"
                        }`}>
                          {delivery.status.replace(/_/g, " ")}
                        </span>
                        {!delivery.is_preloaded && (
                          <span className="text-micro text-brand-lime/70 border border-brand-lime/20 bg-brand-lime/5 px-1.5 py-0.5 rounded">
                            Fetch &amp; Deliver
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-brand-gray/50">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-brand-lime" />
                          <span>{delivery.origin_block} → {delivery.destination_block}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(delivery.created_at))} ago</span>
                        </div>
                      </div>
                      {isPickup && (
                        <p className="text-micro text-brand-yellow font-semibold">⚡ Robot is waiting — place parcel &amp; confirm pickup!</p>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/delivery/${delivery.id}`}
                      className={`flex items-center space-x-2 text-caption font-bold transition-colors shrink-0 ${
                        isPickup
                          ? "text-brand-yellow hover:text-brand-white"
                          : "text-brand-lime hover:text-brand-yellow"
                      }`}
                    >
                      <span>{isPickup ? "Load Parcel" : isActive ? "Track" : "View"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Robot Status Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 glassmorphism rounded-2xl border border-surface-4 p-6 min-w-0">
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
          ) : robotsError ? (
            <ErrorPanel
              message="Failed to load fleet data from the API."
              onRetry={refetchRobots}
            />
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
