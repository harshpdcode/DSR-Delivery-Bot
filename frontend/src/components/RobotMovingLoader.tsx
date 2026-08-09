"use client";

import React from "react";
import { Sparkles, Navigation } from "lucide-react";

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
          ? "fixed inset-0 z-50 bg-[#EFEFED]/95 backdrop-blur-md min-h-screen w-full"
          : "w-full py-12"
      }`}
    >
      {/* Container for Robot + Track */}
      <div className="relative w-full max-w-sm flex flex-col items-center justify-center overflow-hidden py-6">
        
        {/* Radar Signals Emitting from Top */}
        <div className="relative mb-2">
          <div className="absolute -inset-4 rounded-full bg-[#84E000]/20 animate-ping" />
          <div className="relative p-3 rounded-full bg-[#FFE234] text-[#0F172A] shadow-md">
            <Navigation className="h-6 w-6 animate-pulse text-[#0F172A]" />
          </div>
        </div>

        {/* Animated Robo.webp Graphic */}
        <div className="relative my-4 flex items-center justify-center animate-drive-wobble">
          {/* Light Beam */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-24 h-12 bg-gradient-to-r from-[#84E000]/30 to-transparent opacity-80 blur-sm pointer-events-none" />

          {/* Robot Body Box */}
          <div className="relative bg-white border border-[#E4E4E0] rounded-3xl p-4 shadow-md flex items-center space-x-3">
            <div className="relative p-1.5 rounded-2xl bg-[#FFE234] text-[#0F172A] w-12 h-12 flex items-center justify-center shrink-0">
              <img src="/Robo.webp" alt="DSR Bot" className="w-10 h-10 object-contain" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#84E000] animate-ping" />
            </div>

            <div className="text-left space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-[#84E000] animate-pulse" />
                <span className="text-micro font-black text-[#0F172A] uppercase tracking-wider">
                  DSR-GO ACTIVE
                </span>
              </div>
              <p className="text-caption font-extrabold text-[#0F172A]">AUTONOMOUS RUN</p>
            </div>
          </div>
        </div>

        {/* Moving Track / Road Line */}
        <div className="relative w-64 h-2 bg-[#E4E4E0] rounded-full overflow-hidden my-3">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#84E000] to-transparent w-full animate-pulse opacity-75" />
          <div className="w-full h-full flex space-x-2 animate-pulse">
            <div className="h-full w-12 bg-[#84E000] rounded-full" />
            <div className="h-full w-12 bg-[#84E000]/50 rounded-full" />
            <div className="h-full w-12 bg-[#84E000] rounded-full" />
          </div>
        </div>

        {/* Label & Subtext */}
        <div className="mt-4 space-y-1">
          <h3 className="text-title font-black tracking-tight text-[#0F172A] flex items-center justify-center space-x-2">
            <span>{label}</span>
            <Sparkles className="h-4 w-4 text-[#84E000] animate-spin-slow" />
          </h3>
          <p className="text-caption text-[#64748B] max-w-xs mx-auto font-bold">
            {subtext}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-[#E4E4E0] rounded-full overflow-hidden mt-4">
          <div className="h-full bg-[#84E000] rounded-full animate-pulse w-3/4 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
