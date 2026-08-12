"use client";

import React from "react";

interface RobotDrivingLoaderProps {
  label?: string;
  subtext?: string;
  className?: string;
}

/**
 * RobotDrivingLoader — Reskinned CSS-only driving robot loader from the concept UI file.
 * Features a bobbing robot body, spinning wheels, scrolling road dash line, and pulse antenna.
 */
export default function RobotDrivingLoader({
  label = "Robot En Route...",
  subtext = "Silver Oak Autonomous Telemetry Active",
  className = "",
}: RobotDrivingLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
      {/* Driving Stage */}
      <div className="relative w-48 h-24 overflow-hidden flex flex-col items-center justify-center">
        {/* Robot Vehicle Graphic */}
        <div className="relative z-10 flex flex-col items-center animate-bounce-gentle">
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Antenna & Pulsing Light */}
            <line x1="32" y1="12" x2="32" y2="4" stroke="#84E000" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="3" r="3" fill="#84E000" className="animate-pulse" />
            
            {/* Main Chassis Body */}
            <rect x="8" y="12" width="48" height="26" rx="6" fill="#1E293B" stroke="#84E000" strokeWidth="2" />
            
            {/* Front Screen / Eye Visor */}
            <rect x="14" y="17" width="36" height="14" rx="4" fill="#0F172A" />
            <circle cx="24" cy="24" r="3" fill="#84E000" className="animate-ping" />
            <circle cx="24" cy="24" r="3" fill="#84E000" />
            <circle cx="40" cy="24" r="3" fill="#84E000" />

            {/* Wheels */}
            <circle cx="18" cy="40" r="5" fill="#0F172A" stroke="#84E000" strokeWidth="2" className="animate-spin-fast" />
            <circle cx="46" cy="40" r="5" fill="#0F172A" stroke="#84E000" strokeWidth="2" className="animate-spin-fast" />
          </svg>
        </div>

        {/* Scrolling Road Line */}
        <div className="w-full h-1 bg-surface-3 relative overflow-hidden rounded-full mt-1">
          <div className="absolute inset-0 w-[200%] h-full bg-dash-scroll" />
        </div>
      </div>

      {/* Text Labels */}
      {(label || subtext) && (
        <div className="text-center space-y-1">
          {label && <p className="text-caption font-extrabold text-brand-white tracking-wide">{label}</p>}
          {subtext && <p className="text-micro font-bold text-brand-white/60">{subtext}</p>}
        </div>
      )}

      {/* Inline styles for road animation */}
      <style jsx>{`
        @keyframes dashScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes bounceGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .bg-dash-scroll {
          background-image: repeating-linear-gradient(
            90deg,
            var(--brand-lime) 0,
            var(--brand-lime) 12px,
            transparent 12px,
            transparent 24px
          );
          animation: dashScroll 0.6s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounceGentle 0.8s ease-in-out infinite;
        }
        .animate-spin-fast {
          animation: spin 0.4s linear infinite;
        }
      `}</style>
    </div>
  );
}
