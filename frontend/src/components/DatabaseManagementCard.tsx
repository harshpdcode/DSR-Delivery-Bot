"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  X,
  Layers,
  Users,
  Bot,
} from "lucide-react";
import { toast } from "sonner";

interface DbStatus {
  connected: boolean;
  dialect?: string;
  tables_count?: number;
  tables?: string[];
  environment?: string;
  error?: string;
}

interface InitDetails {
  tables?: string[];
  details?: {
    users_created: number;
    users_verified: number;
    robots_created: number;
    robots_verified: number;
  };
}

export default function DatabaseManagementCard() {
  const { token, user } = useAuthStore();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<InitDetails | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/v1/admin/database/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatus({
          connected: false,
          error: err.detail || `Server error (${res.status})`,
        });
      }
    } catch (e: any) {
      setStatus({
        connected: false,
        error: e.message || "Failed to reach backend",
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStatus();
    }
  }, [user?.role, fetchStatus]);

  // Only admins can see this card
  if (user?.role !== "admin") {
    return null;
  }

  const handleInitialize = async () => {
    if (isInitializing || !token) return;
    setIsInitializing(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const res = await fetch("/api/v1/admin/database/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.detail || `Initialization failed with status ${res.status}`;
        setErrorMsg(message);
        toast.error(`Database initialization failed: ${message}`);
        return;
      }

      toast.success("Database initialized successfully.");
      setSuccessInfo(data);
      setIsModalOpen(false);
      await fetchStatus();
    } catch (e: any) {
      const message = e.message || "Network error occurred while initializing database";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div
      data-theme-card="light"
      className="glassmorphism rounded-2xl border border-surface-4 p-6 shadow-card space-y-5"
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-title font-bold text-brand-white">Database Management</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                Admin Only
              </span>
            </div>
            <p className="text-caption text-brand-white/60">
              Manage database schema, table state, and idempotent seed records
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loadingStatus}
          title="Refresh database status"
          className="p-2 rounded-lg bg-surface-2 border border-surface-3 hover:border-brand-lime/30 text-brand-white/70 hover:text-brand-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loadingStatus ? "animate-spin text-brand-lime" : ""}`} />
        </button>
      </div>

      {/* Status Bar */}
      <div className="p-4 rounded-xl bg-surface-1 border border-surface-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`h-3 w-3 rounded-full ${
              status?.connected
                ? "bg-status-success shadow-[0_0_8px_rgba(57,181,74,0.6)] animate-pulse"
                : "bg-status-error shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            }`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-caption font-bold text-brand-white">
                Status: {status?.connected ? "Connected" : "Disconnected"}
              </span>
              {status?.dialect && (
                <span className="text-micro font-mono px-2 py-0.5 rounded bg-surface-2 border border-surface-3 text-brand-white/70 uppercase">
                  {status.dialect}
                </span>
              )}
            </div>
            <p className="text-micro text-brand-white/50 mt-0.5 font-medium">
              {status?.connected
                ? `Tables: ${status.tables_count ?? 0} (${status.environment ?? "production"})`
                : status?.error || "Unable to reach database"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          disabled={isInitializing}
          className="px-5 py-2.5 rounded-xl bg-brand-lime text-brand-black font-bold text-caption hover:shadow-glow-lime hover:scale-[1.01] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
        >
          Initialize Database
        </button>
      </div>

      {/* Error Message Display if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-status-error/10 border border-status-error/20 flex items-start space-x-3 text-status-error">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-caption space-y-1">
            <p className="font-bold">Initialization Error</p>
            <p className="text-micro opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Success Info Display */}
      {successInfo && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 space-y-3">
          <div className="flex items-center space-x-2 text-status-success">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-caption font-bold">Database initialized successfully.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-surface-2 border border-surface-3 flex items-center space-x-3">
              <Layers className="h-5 w-5 text-brand-lime" />
              <div>
                <p className="text-micro text-brand-white/50">Verified Tables</p>
                <p className="font-bold text-brand-white text-caption">
                  {successInfo.tables?.length ?? 0} Tables
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-2 border border-surface-3 flex items-center space-x-3">
              <Users className="h-5 w-5 text-brand-lime" />
              <div>
                <p className="text-micro text-brand-white/50">Initial Users</p>
                <p className="font-bold text-brand-white text-caption">
                  {successInfo.details?.users_created ?? 0} created,{" "}
                  {successInfo.details?.users_verified ?? 0} verified
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-2 border border-surface-3 flex items-center space-x-3">
              <Bot className="h-5 w-5 text-brand-lime" />
              <div>
                <p className="text-micro text-brand-white/50">Fleet Robots</p>
                <p className="font-bold text-brand-white text-caption">
                  {successInfo.details?.robots_created ?? 0} created,{" "}
                  {successInfo.details?.robots_verified ?? 0} verified
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 glassmorphism rounded-2xl border border-surface-4 shadow-2xl bg-surface-1 space-y-5">
            <button
              onClick={() => !isInitializing && setIsModalOpen(false)}
              disabled={isInitializing}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-brand-white/50 hover:text-brand-white hover:bg-surface-2 transition-all disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-title font-bold text-brand-white">Initialize Database?</h3>
            </div>

            <p className="text-caption text-brand-white/70 leading-relaxed">
              This will create any missing database tables and add missing initial seed data. Existing data will not be deleted.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-micro">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isInitializing}
                className="px-4 py-2.5 rounded-xl bg-surface-2 border border-surface-3 text-brand-white/80 font-bold text-caption hover:bg-surface-3 transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInitialize}
                disabled={isInitializing}
                className="px-5 py-2.5 rounded-xl bg-brand-lime text-brand-black font-bold text-caption hover:shadow-glow-lime transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <span>Initialize Database</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
