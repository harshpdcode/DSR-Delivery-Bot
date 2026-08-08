"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Package, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="relative flex flex-col items-center">
          <Bot className="h-12 w-12 text-brand-lime animate-bounce" />
          <p className="mt-4 text-brand-gray/60 font-medium">Initializing DSR Go...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 bg-grid-glow relative overflow-hidden flex flex-col justify-between">
      {/* ── Header ── */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-brand-lime animate-robot-move" />
          <span className="text-xl font-bold tracking-wider text-brand-white">
            DSR <span className="text-brand-lime">Go</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-brand-gray hover:text-brand-lime transition-colors text-body font-medium"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 rounded-lg bg-brand-lime text-brand-black font-semibold hover:shadow-glow-lime transition-all text-body"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 py-12">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-caption font-semibold">
            <Zap className="h-4.5 w-4.5" />
            <span>Autonomous Campus Deliveries</span>
          </div>
          
          <h1 className="text-display font-extrabold text-brand-white leading-tight tracking-tight lg:text-display-lg">
            Smart Robot Delivery for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-brand-yellow">Silver Oak Campus</span>
          </h1>

          <p className="text-body-lg text-brand-gray/70 max-w-xl">
            Request, track, and receive internal packages autonomously with the DSR Go delivery fleet. Fast, secure, and fully automated across all academic blocks.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/register" 
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-lime text-brand-black font-bold hover:shadow-glow-lime hover:scale-[1.02] transition-all"
            >
              <span>Register Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center px-6 py-3 rounded-xl border border-surface-4 text-brand-white font-semibold hover:bg-surface-2 transition-colors"
            >
              Track Existing Delivery
            </Link>
          </div>

          {/* Features highlight */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-surface-4/40">
            <div>
              <p className="text-title font-bold text-brand-lime">100%</p>
              <p className="text-caption text-brand-gray/50">Autonomous</p>
            </div>
            <div>
              <p className="text-title font-bold text-brand-yellow">6 Blocks</p>
              <p className="text-caption text-brand-gray/50">Campus Coverage</p>
            </div>
            <div>
              <p className="text-title font-bold text-brand-white">&lt; 8 Mins</p>
              <p className="text-caption text-brand-gray/50">Average Delivery</p>
            </div>
          </div>
        </div>

        {/* Visual Showcase */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 bg-radial-gradient from-brand-lime/10 to-transparent blur-3xl rounded-full" />
          
          <div className="relative glassmorphism-premium rounded-3xl p-8 max-w-md w-full border border-surface-4 hover:border-brand-lime/20 transition-all duration-500 shadow-card">
            {/* Fleet map placeholder representation */}
            <div className="h-48 rounded-xl bg-surface-0 border border-surface-3 relative overflow-hidden mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute top-1/2 left-1/3 h-4 w-4 rounded-full bg-brand-lime ring-indicator" />
              <div className="absolute top-1/3 left-2/3 h-3 w-3 rounded-full bg-brand-yellow" />
              <div className="absolute bottom-1/4 right-1/4 h-3.5 w-3.5 rounded-full bg-status-info" />
              <span className="text-micro text-brand-gray/30 absolute bottom-2 left-2 uppercase tracking-widest font-mono">
                CAMPUS LIVE RADAR
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-body font-bold">Package DSR-X80A</h4>
                    <p className="text-caption text-brand-gray/40">En Route to Block A</p>
                  </div>
                </div>
                <span className="text-caption font-semibold px-2 py-1 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                  85% Battery
                </span>
              </div>

              <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-lime h-full w-[70%] rounded-full animate-pulse-slow" />
              </div>

              <div className="flex items-center justify-between text-caption text-brand-gray/50 border-t border-surface-4/40 pt-4">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="h-4 w-4 text-status-success" />
                  <span>Secure OTP Lock</span>
                </div>
                <span>ETA: 3 Mins</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-surface-4/20 text-center text-caption text-brand-gray/40 z-10">
        &copy; {new Date().getFullYear()} DSR Go — Silver Oak University Autonomous Delivery System. All rights reserved.
      </footer>
    </div>
  );
}
