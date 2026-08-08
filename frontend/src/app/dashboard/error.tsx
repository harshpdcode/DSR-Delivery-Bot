"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-status-error/10 border border-status-error/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-9 w-9 text-status-error" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-status-error animate-ping opacity-60" />
          </div>
        </div>

        {/* Error Text */}
        <div className="space-y-2">
          <h2 className="text-heading font-extrabold text-brand-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-body text-brand-gray/50">
            An unexpected error occurred while loading this page. This may be
            due to a backend connection issue or a temporary fault.
          </p>
        </div>

        {/* Error Details (collapsible dev info) */}
        {error?.message && (
          <div className="glassmorphism rounded-xl border border-status-error/20 p-4 text-left">
            <p className="text-micro font-mono text-status-error/80 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-micro text-brand-gray/30 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-lime text-brand-black font-bold text-body hover:shadow-glow-lime hover:scale-[1.02] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-surface-4 text-brand-gray/70 font-bold text-body hover:text-brand-white hover:border-surface-4/80 transition-all"
          >
            <Home className="h-4 w-4" />
            Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
