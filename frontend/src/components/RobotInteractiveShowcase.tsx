"use client";

import { useState } from "react";
import { Bot, Battery, Gauge, Package, X, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface RobotUnit {
  id: string;
  name: string;
  code: string;
  tagline: string;
  payloadKg: number;
  batteryPercent: number;
  speedMps: number;
  blockLocation: string;
  status: "idle" | "delivering" | "charging";
  themeHex: string;
  glowClass: string;
  bgCircleClass: string;
  accentBadgeClass: string;
  imageSrc: string;
}

const ROBOT_UNITS: RobotUnit[] = [
  {
    id: "dsr-alpha-01",
    name: "DSR-Alpha 01",
    code: "UNIT-A1",
    tagline: "Heavy Duty Academic Courier",
    payloadKg: 15,
    batteryPercent: 96,
    speedMps: 1.8,
    blockLocation: "Block A Dock",
    status: "idle",
    themeHex: "#84E000",
    glowClass: "shadow-[0_0_50px_rgba(132,224,0,0.35)] border-[#84E000]/40",
    bgCircleClass: "bg-[#84E000]/15",
    accentBadgeClass: "bg-[#84E000] text-[#0A0A0A]",
    imageSrc: "/Robo.webp",
  },
  {
    id: "dsr-beta-02",
    name: "DSR-Beta 02",
    code: "UNIT-B2",
    tagline: "Express Runner Speedster",
    payloadKg: 10,
    batteryPercent: 88,
    speedMps: 2.4,
    blockLocation: "Block C Dock",
    status: "idle",
    themeHex: "#FFE234",
    glowClass: "shadow-[0_0_50px_rgba(255,226,52,0.35)] border-[#FFE234]/40",
    bgCircleClass: "bg-[#FFE234]/15",
    accentBadgeClass: "bg-[#FFE234] text-[#0A0A0A]",
    imageSrc: "/Robo.webp",
  },
  {
    id: "dsr-gamma-03",
    name: "DSR-Gamma 03",
    code: "UNIT-G3",
    tagline: "Stealth Night Patrol Bot",
    payloadKg: 12,
    batteryPercent: 92,
    speedMps: 1.6,
    blockLocation: "Library Dock",
    status: "idle",
    themeHex: "#38BDF8",
    glowClass: "shadow-[0_0_50px_rgba(56,189,248,0.35)] border-[#38BDF8]/40",
    bgCircleClass: "bg-[#38BDF8]/15",
    accentBadgeClass: "bg-[#38BDF8] text-[#0A0A0A]",
    imageSrc: "/Robo.webp",
  },
  {
    id: "dsr-delta-04",
    name: "DSR-Delta 04",
    code: "UNIT-D4",
    tagline: "Ultra Cargo Max Hauler",
    payloadKg: 25,
    batteryPercent: 98,
    speedMps: 1.5,
    blockLocation: "Engineering Dock",
    status: "idle",
    themeHex: "#C084FC",
    glowClass: "shadow-[0_0_50px_rgba(192,132,252,0.35)] border-[#C084FC]/40",
    bgCircleClass: "bg-[#C084FC]/15",
    accentBadgeClass: "bg-[#C084FC] text-[#0A0A0A]",
    imageSrc: "/Robo.webp",
  },
];

interface RobotInteractiveShowcaseProps {
  mode?: "landing" | "dashboard";
  className?: string;
}

export default function RobotInteractiveShowcase({
  mode = "landing",
  className = "",
}: RobotInteractiveShowcaseProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPacking, setIsPacking] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const activeRobot = ROBOT_UNITS[selectedIndex];

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    setIsConfirmed(false);
    setIsPacking(false);
    setIsDriving(false);
  };

  const handleSelectRobot = (index: number) => {
    setSelectedIndex(index);
    setIsConfirmed(false);
    setIsPacking(false);
    setIsDriving(false);
  };

  const handleDispatchAction = async () => {
    if (isPacking || isDriving || isConfirmed) return;

    setIsPacking(true);
    // Phase 1: Packing & preparing dispatch
    await new Promise((r) => setTimeout(r, 600));
    setIsPacking(false);
    setIsDriving(true);

    // Phase 2: Driving across animation
    await new Promise((r) => setTimeout(r, 1200));
    setIsDriving(false);
    setIsConfirmed(true);

    toast.success(`Mission Dispatched with ${activeRobot.name}! 🚀`);

    if (mode === "landing") {
      setTimeout(() => {
        router.push("/register");
      }, 1000);
    } else {
      setTimeout(() => {
        router.push("/dashboard/delivery/new");
      }, 1000);
    }
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto select-none ${className}`}>
      {/* ── CARD CONTAINER ── */}
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-700 ease-out bg-[#0D0F17] ${
          isOpen ? activeRobot.glowClass : "border-surface-4 hover:border-brand-lime/50 shadow-2xl"
        }`}
        style={{ minHeight: isOpen ? "420px" : "320px" }}
      >
        {/* ── CIRCLE FLOOD BACKGROUND ANIMATION (clip-path circle fill) ── */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
          style={{
            backgroundColor: activeRobot.themeHex,
            opacity: isOpen ? 0.08 : 0.02,
            clipPath: isOpen ? "circle(150% at 50% 50%)" : "circle(0% at 50% 50%)",
          }}
        />

        {/* Ambient radial glow backdrop */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl transition-colors duration-700 pointer-events-none z-0"
          style={{
            backgroundColor: activeRobot.themeHex,
            opacity: isOpen ? 0.25 : 0.12,
          }}
        />

        {/* Top Bar Header inside card */}
        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: activeRobot.themeHex }} />
            <span className="text-micro font-extrabold tracking-widest uppercase text-brand-white/80">
              {isOpen ? `DSR FLEET · ${activeRobot.code}` : "DSR GO · INTERACTIVE ROBOT SHOWCASE"}
            </span>
          </div>

          {isOpen && (
            <button
              onClick={handleToggleOpen}
              className="p-1.5 rounded-full bg-surface-2/80 hover:bg-surface-3 text-brand-white/80 hover:text-brand-white transition-all cursor-pointer"
              title="Close Showcase"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── COLLAPSED INITIAL VIEW ── */}
        {!isOpen && (
          <div
            onClick={handleToggleOpen}
            className="relative z-10 px-6 pb-8 pt-2 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            {/* Robot Center Display */}
            <div className="relative my-4 group-hover:scale-105 transition-transform duration-500">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity"
                style={{ backgroundColor: activeRobot.themeHex }}
              />
              <img
                src={activeRobot.imageSrc}
                alt={activeRobot.name}
                className="w-36 h-36 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] relative z-10 animate-float"
              />
            </div>

            <h3 className="text-title font-extrabold text-brand-white group-hover:text-brand-lime transition-colors">
              {activeRobot.name}
            </h3>
            <p className="text-caption text-brand-white/60 max-w-sm mt-1">
              Autonomous delivery bot tailored for campus logistics.
            </p>

            <div className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-2/80 border border-surface-4 text-caption font-bold text-brand-white group-hover:border-brand-lime transition-all">
              <span className="h-2 w-2 rounded-full bg-brand-lime animate-ping" />
              <span>TAP TO INSPECT &amp; SWITCH ROBOT</span>
            </div>
          </div>
        )}

        {/* ── EXPANDED INTERACTIVE VIEW (REEL ANIMATION MODE) ── */}
        {isOpen && (
          <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* LEFT DETAILS PANEL (Cols 7 on Desktop) */}
            <div className="md:col-span-7 space-y-5 animate-fade-in">
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-md text-micro font-black uppercase tracking-wider mb-2"
                  style={{ backgroundColor: `${activeRobot.themeHex}25`, color: activeRobot.themeHex }}
                >
                  {activeRobot.tagline}
                </span>
                <h2 className="text-heading md:text-display font-black text-brand-white tracking-tight">
                  {activeRobot.name}
                </h2>
                <p className="text-caption text-brand-white/70 font-medium">
                  Stationed at <strong className="text-brand-white">{activeRobot.blockLocation}</strong> · Ready for dispatch.
                </p>
              </div>

              {/* Specs Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-surface-2/60 border border-surface-4/60 flex flex-col items-center text-center">
                  <Package className="h-4 w-4 mb-1 text-brand-lime" />
                  <span className="text-micro text-brand-white/50">Payload</span>
                  <span className="text-caption font-black text-brand-white">{activeRobot.payloadKg} kg</span>
                </div>
                <div className="p-3 rounded-2xl bg-surface-2/60 border border-surface-4/60 flex flex-col items-center text-center">
                  <Battery className="h-4 w-4 mb-1 text-brand-yellow" />
                  <span className="text-micro text-brand-white/50">Battery</span>
                  <span className="text-caption font-black text-brand-white">{activeRobot.batteryPercent}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-surface-2/60 border border-surface-4/60 flex flex-col items-center text-center">
                  <Gauge className="h-4 w-4 mb-1 text-status-info" />
                  <span className="text-micro text-brand-white/50">Speed</span>
                  <span className="text-caption font-black text-brand-white">{activeRobot.speedMps} m/s</span>
                </div>
              </div>

              {/* ROBOT COLOR/UNIT SELECTOR DOTS */}
              <div className="space-y-2">
                <span className="text-micro font-extrabold uppercase tracking-widest text-brand-white/50 block">
                  Select Robot Unit
                </span>
                <div className="flex items-center space-x-3">
                  {ROBOT_UNITS.map((unit, idx) => (
                    <button
                      key={unit.id}
                      onClick={() => handleSelectRobot(idx)}
                      className={`relative w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        selectedIndex === idx
                          ? "ring-2 ring-offset-2 ring-offset-[#0D0F17] scale-110"
                          : "hover:scale-105 opacity-70 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: unit.themeHex,
                        boxShadow: selectedIndex === idx ? `0 0 15px ${unit.themeHex}` : "none",
                      }}
                      title={unit.name}
                    >
                      {selectedIndex === idx && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0D0F17]" />
                      )}
                    </button>
                  ))}
                  <span className="text-caption font-bold text-brand-white ml-2">
                    {activeRobot.code}
                  </span>
                </div>
              </div>

              {/* DISPATCH ACTION BUTTON (WITH TRUCK/ROBOT DRIVE ANIMATION) */}
              <div className="pt-2">
                <button
                  onClick={handleDispatchAction}
                  disabled={isPacking || isDriving || isConfirmed}
                  className="relative w-full overflow-hidden rounded-2xl py-3.5 px-6 font-black text-caption transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: isConfirmed ? "#10B981" : activeRobot.themeHex,
                    color: "#0A0A0A",
                  }}
                >
                  {/* Driving animation overlay */}
                  {isDriving && (
                    <div className="absolute inset-0 flex items-center justify-start px-4 pointer-events-none">
                      <div className="animate-drive-across flex items-center space-x-2">
                        <Bot className="h-6 w-6 text-[#0A0A0A]" />
                        <span className="text-micro font-black uppercase">Driving...</span>
                      </div>
                    </div>
                  )}

                  {!isDriving && !isConfirmed && (
                    <>
                      <span>{isPacking ? "Preparing Dispatch..." : `Dispatch ${activeRobot.name}`}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}

                  {isConfirmed && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-[#0A0A0A]" />
                      <span>{`Mission Dispatched with ${activeRobot.name}!`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT ROBOT ART & 3D POSE (Cols 5 on Desktop) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center group">
                {/* Glow Halo */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse"
                  style={{ backgroundColor: activeRobot.themeHex }}
                />

                {/* Robot image with angled spring transformation (translate, scale, rotate) */}
                <img
                  src={activeRobot.imageSrc}
                  alt={activeRobot.name}
                  className="w-44 h-44 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out transform hover:scale-110 hover:-rotate-3"
                  style={{
                    transform: "translate(0px, -10px) scale(1.06) rotate(6deg)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
