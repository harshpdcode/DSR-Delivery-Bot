"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { 
  Package, 
  Bot, 
  ArrowRight,
  MapPin,
  Clock,
  WifiOff,
  RefreshCw,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";

const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="glassmorphism rounded-2xl border border-surface-4 p-4 h-[340px] flex items-center justify-center">
      <span className="text-micro text-brand-gray/40">Loading campus interactive map…</span>
    </div>
  ),
});

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
      if (!res.ok) throw new Error(`Backend returned ${res.status} — server offline?`);
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    retry: 1,
  });

  // Fetch Fleet Robots
  const { data: robots = [], isLoading: loadingRobots, isError: robotsError, refetch: refetchRobots } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status} — server offline?`);
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    retry: 1,
  });

  const activeDeliveries = deliveries.filter(
    (d: any) => !["completed", "cancelled", "failed"].includes(d.status)
  );
  const recentDeliveries = deliveries.slice(0, 10);
  const availableRobots = robots.filter((r: any) => r.status === "idle");

  const metrics = [
    {
      title: "Active Deliveries",
      value: activeDeliveries.length,
      icon: Package,
      color: "text-brand-lime bg-brand-lime/10 border border-brand-lime/20",
      description: "Missions currently processing",
    },
    {
      title: "Available Robots",
      value: `${availableRobots.length}/${robots.length}`,
      icon: Bot,
      color: "text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20",
      description: "Robots in IDLE state",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* ── Welcome Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-display font-extrabold tracking-tight text-brand-white">Dashboard</h1>
          <p className="text-body text-brand-gray/50">
            Real-time operations dashboard for Silver Oak campus.
          </p>
        </div>
        <Link
          href="/dashboard/delivery/new"
          className="px-5 py-2.5 rounded-xl bg-brand-lime text-brand-black font-bold hover:shadow-glow-lime hover:scale-[1.02] transition-all text-body cursor-pointer"
        >
          Request Robot Dispatch
        </Link>
      </div>

      {/* ── 2-Column Metrics Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="glassmorphism rounded-2xl p-6 border border-surface-4 shadow-card hover:border-brand-lime/20 transition-all">
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

      {/* ── Full-Width My Deliveries Section ─────────────────────────── */}
      <div className="glassmorphism rounded-2xl border border-surface-4 p-6 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-title font-bold text-brand-white">My Deliveries</h3>
            <p className="text-micro text-brand-gray/40 mt-0.5">Track &amp; manage your delivery requests</p>
          </div>
          <Link
            href="/dashboard/delivery/new"
            className="shrink-0 whitespace-nowrap text-caption font-bold text-brand-lime px-3 py-1.5 rounded-lg bg-brand-lime/10 hover:bg-brand-lime hover:text-brand-black transition-all inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New</span>
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
            <div className="p-4 rounded-2xl bg-surface-2 border border-surface-4 text-brand-gray/40">
              <Package className="h-12 w-12" />
            </div>
            <div>
              <p className="text-body font-bold text-brand-white">No Deliveries Yet</p>
              <p className="text-caption text-brand-gray/40 max-w-xs mt-1">
                You haven&apos;t made any deliveries yet. Tap &quot;+ New&quot; to request your first dispatch.
              </p>
            </div>
            <Link
              href="/dashboard/delivery/new"
              className="px-5 py-2.5 rounded-xl bg-brand-lime text-brand-black font-bold text-caption hover:shadow-glow-lime transition-all"
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
                      ? "bg-surface-1 border-surface-3 hover:border-brand-lime/30"
                      : "bg-surface-0 border-surface-3/50 opacity-60"
                  }`}
                >
                  <div className="space-y-1.5 mb-3 sm:mb-0 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-body font-bold text-brand-white font-mono">{delivery.tracking_code}</span>
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
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-brand-gray/50">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-brand-lime" />
                        <span>
                          {delivery.extra_stops && Array.isArray(delivery.extra_stops) && delivery.extra_stops.length > 0
                            ? [delivery.origin_block, delivery.destination_block, ...delivery.extra_stops].join(" ➔ ")
                            : `${delivery.origin_block} ➔ ${delivery.destination_block}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(delivery.created_at))} ago</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/delivery/${delivery.id}`}
                    className="flex items-center space-x-2 text-caption font-bold text-brand-lime hover:text-brand-yellow transition-colors shrink-0"
                  >
                    <span>{isActive ? "Track" : "View Details"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Silver Oak Campus Map (Blocks A to E) ────────────────────── */}
      <div className="glassmorphism rounded-2xl border border-surface-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-title font-bold text-brand-white flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-brand-lime" />
              <span>Silver Oak Campus Map</span>
            </h3>
            <p className="text-micro text-brand-gray/40 mt-0.5">Real-time autonomous vehicle positioning &amp; building waypoints (A Block to E Block)</p>
          </div>
          <span className="text-micro font-bold text-brand-lime px-2.5 py-1 rounded bg-brand-lime/10 border border-brand-lime/20">
            Live Telemetry
          </span>
        </div>

        <div className="h-[360px] rounded-xl overflow-hidden border border-surface-3 relative">
          <CampusMap
            followRobot={true}
            robot={{ lat: 23.0906, lng: 72.5344, heading: 45 }}
            waypoints={[
              { lat: 23.0906, lng: 72.5344, label: "A Block" },
              { lat: 23.0912, lng: 72.5351, label: "B Block" },
              { lat: 23.0918, lng: 72.5346, label: "C Block" },
              { lat: 23.0915, lng: 72.5335, label: "D Block" },
              { lat: 23.0901, lng: 72.5338, label: "E Block" },
              { lat: 23.0898, lng: 72.5348, label: "Canteen" },
            ]}
          />
        </div>
      </div>

    </div>
  );
}
