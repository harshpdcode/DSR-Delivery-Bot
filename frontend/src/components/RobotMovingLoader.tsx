"use client";

import React from "react";
import { Bot, Sparkles, Navigation } from "lucide-react";

interface RobotMovingLoaderProps {
  label?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export default function RobotMovingLoader({
  label = "DSR Autonomous Bot En Route",
  subtext = "Initializing telemetry and path finding...",
  fullScreen = false,
}: RobotMovingLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none ${
        fullScreen
          ? "fixed inset-0 z-50 bg-surface-0/95 backdrop-blur-md min-h-screen w-full"
          : "w-full py-12"
      }`}
    >
      {/* Container for Robot + Track */}
      <div className="relative w-full max-w-sm flex flex-col items-center justify-center overflow-hidden py-6">
        
        {/* Radar Signals Emitting from Top */}
        <div className="relative mb-2">
          <div className="absolute -inset-4 rounded-full bg-brand-lime/10 animate-ping" />
          <div className="relative p-3 rounded-full bg-surface-2 border border-brand-lime/30 text-brand-lime shadow-glow-lime">
            <Navigation className="h-6 w-6 animate-pulse text-brand-lime" />
          </div>
        </div>

        {/* Animated Robot Graphic */}
        <div className="relative my-4 flex items-center justify-center animate-drive-wobble">
          {/* Light Beam */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-24 h-12 bg-gradient-to-r from-brand-lime/30 to-transparent clip-polygon opacity-80 blur-sm pointer-events-none" />

          {/* Robot Body Box */}
          <div className="relative bg-surface-1 border-2 border-brand-lime rounded-2xl p-4 shadow-glow-lime flex items-center space-x-3">
            <div className="relative p-2 rounded-xl bg-brand-lime/20 text-brand-lime border border-brand-lime/30">
              <Bot className="h-8 w-8 text-brand-lime" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-lime animate-ping" />
            </div>

            <div className="text-left space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-lime animate-pulse" />
                <span className="text-micro font-extrabold text-brand-lime uppercase tracking-wider">
                  DSR-GO ACTIVE
                </span>
              </div>
              <p className="text-caption font-bold text-brand-white font-mono">AUTONOMOUS RUN</p>
            </div>
          </div>
        </div>

        {/* Moving Track / Road Line */}
        <div className="relative w-64 h-2 bg-surface-3 rounded-full overflow-hidden my-3 border border-surface-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-lime to-transparent w-full animate-pulse opacity-75" />
          <div className="w-full h-full flex space-x-2 animate-pulse">
            <div className="h-full w-12 bg-brand-lime/50 rounded-full" />
            <div className="h-full w-12 bg-brand-lime/30 rounded-full" />
            <div className="h-full w-12 bg-brand-lime/50 rounded-full" />
          </div>
        </div>

        {/* Label & Subtext */}
        <div className="mt-4 space-y-1">
          <h3 className="text-title font-extrabold tracking-tight text-brand-white flex items-center justify-center space-x-2">
            <span>{label}</span>
            <Sparkles className="h-4 w-4 text-brand-lime animate-spin-slow" />
          </h3>
          <p className="text-caption text-brand-gray/60 max-w-xs mx-auto">
            {subtext}
          </p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-48 h-1.5 bg-surface-3 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-brand-lime rounded-full animate-pulse w-3/4 shadow-glow-lime" />
        </div>
      </div>
    </div>
  );
}
