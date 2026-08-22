"use client";

import { useState } from "react";
import { Bot, Battery, Gauge, Package, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  imageSrc: string;
}

const ROBOT_UNITS: RobotUnit[] = [
  {
    id: "dsr-alpha-01",
    name: "DSR-Alpha 01",
    code: "DSR-01",
    tagline: "Heavy Duty Academic Courier",
    payloadKg: 15,
    batteryPercent: 100,
    speedMps: 1.8,
    blockLocation: "Block A Dock",
    status: "idle",
    imageSrc: "/Robo.webp",
  },
  {
    id: "dsr-beta-02",
    name: "DSR-Beta 02",
    code: "DSR-02",
    tagline: "Express Runner Speedster",
    payloadKg: 10,
    batteryPercent: 100,
    speedMps: 2.4,
    blockLocation: "Block C Dock",
    status: "idle",
    imageSrc: "/Robo.webp",
  },
  {
    id: "dsr-gamma-03",
    name: "DSR-Gamma 03",
    code: "DSR-03",
    tagline: "Stealth Night Patrol Bot",
    payloadKg: 12,
    batteryPercent: 95,
    speedMps: 1.6,
    blockLocation: "Library Dock",
    status: "idle",
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

  const handleOpenShowcase = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsConfirmed(false);
      setIsPacking(false);
      setIsDriving(false);
    }
  };

  const handleCloseShowcase = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsConfirmed(false);
    setIsPacking(false);
    setIsDriving(false);
  };

  const handleSelectRobot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setIsConfirmed(false);
    setIsPacking(false);
    setIsDriving(false);
  };

  const handleDispatchAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPacking || isDriving || isConfirmed) return;

    setIsPacking(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsPacking(false);
    setIsDriving(true);

    await new Promise((r) => setTimeout(r, 1100));
    setIsDriving(false);
    setIsConfirmed(true);

    toast.success(`Mission Dispatched with ${activeRobot.name}! 🚀`);

    if (mode === "landing") {
      setTimeout(() => {
        router.push("/register");
      }, 900);
    } else {
      setTimeout(() => {
        router.push("/dashboard/delivery/new");
      }, 900);
    }
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto select-none ${className}`}>
      {/* ── CARD CONTAINER (SHARED LAYOUT SPRINGS) ── */}
      <motion.div
        data-theme-card="dark"
        layout
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        onClick={handleOpenShowcase}
        className={`relative overflow-hidden rounded-3xl border transition-colors duration-500 glassmorphism shadow-card ${
          isOpen
            ? "border-brand-lime/50 shadow-glow-lime/20"
            : "border-surface-3 hover:border-brand-lime/40 cursor-pointer"
        }`}
      >
        {/* Ambient radial green glow backdrop */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0 bg-brand-lime/15"
          animate={{
            opacity: isOpen ? 0.25 : 0.1,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Top Header Bar */}
        <div className="relative z-20 p-5 flex items-center justify-between border-b border-surface-3/50">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-micro font-extrabold tracking-widest uppercase text-brand-white/80">
              {isOpen ? `DSR FLEET · ${activeRobot.code}` : "DSR GO · INTERACTIVE ROBOT SHOWCASE"}
            </span>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseShowcase}
                className="p-1.5 rounded-full bg-surface-2 text-brand-white hover:text-brand-lime hover:bg-surface-3 transition-colors cursor-pointer z-30 border border-surface-4"
                title="Close Showcase"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="relative z-10 p-6 md:p-8">
          {!isOpen ? (
            /* ── COLLAPSED STATE: Centered Robot Image + Hint ── */
            <div className="flex flex-col items-center justify-center text-center py-2">
              {/* Centered Robot Hero Image with ambient glow */}
              <div className="relative my-3 flex items-center justify-center w-40 h-40">
                <div className="absolute inset-0 rounded-full blur-2xl bg-brand-lime/25 opacity-60 pointer-events-none" />
                <img
                  src={activeRobot.imageSrc}
                  alt={activeRobot.name}
                  className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
                />
              </div>

              <h3 className="text-title font-extrabold text-brand-white">
                {activeRobot.name}
              </h3>
              <p className="text-caption text-brand-gray max-w-sm mt-1 font-medium">
                Autonomous delivery bot tailored for campus logistics.
              </p>

              <div className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-2 border border-surface-3 text-caption font-bold text-brand-white shadow-sm hover:bg-brand-lime/10 hover:border-brand-lime transition-all cursor-pointer">
                <span className="h-2 w-2 rounded-full bg-brand-lime animate-ping" />
                <span>TAP TO INSPECT &amp; SWITCH ROBOT</span>
              </div>
            </div>
          ) : (
            /* ── EXPANDED STATE: Robot Glides to Right, Details Slide into Left ── */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[340px]">
              {/* LEFT DETAILS PANEL (Cols 7) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="md:col-span-7 space-y-5"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRobot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-micro font-black uppercase tracking-wider mb-2 bg-brand-lime/15 text-brand-lime border border-brand-lime/20">
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
                      <div className="p-3 rounded-2xl bg-surface-2 border border-surface-4 flex flex-col items-center text-center">
                        <Package className="h-4 w-4 mb-1 text-brand-lime" />
                        <span className="text-micro text-brand-white/50">Payload</span>
                        <span className="text-caption font-black text-brand-white">{activeRobot.payloadKg} kg</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-surface-2 border border-surface-4 flex flex-col items-center text-center">
                        <Battery className="h-4 w-4 mb-1 text-brand-yellow" />
                        <span className="text-micro text-brand-white/50">Battery</span>
                        <span className="text-caption font-black text-brand-white">{activeRobot.batteryPercent}%</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-surface-2 border border-surface-4 flex flex-col items-center text-center">
                        <Gauge className="h-4 w-4 mb-1 text-status-info" />
                        <span className="text-micro text-brand-white/50">Speed</span>
                        <span className="text-caption font-black text-brand-white">{activeRobot.speedMps} m/s</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* ROBOT UNIT SELECTOR (3 UNITS) */}
                <div className="space-y-2">
                  <span className="text-micro font-extrabold uppercase tracking-widest text-brand-white/50 block">
                    Select Robot Unit (3 Active Fleet)
                  </span>
                  <div className="flex items-center space-x-3">
                    {ROBOT_UNITS.map((unit, idx) => (
                      <motion.button
                        key={unit.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleSelectRobot(idx, e)}
                        className={`relative px-3.5 py-1.5 rounded-xl font-bold text-caption transition-all flex items-center space-x-1.5 cursor-pointer ${
                          selectedIndex === idx
                            ? "bg-brand-lime text-[#0A0A0A] shadow-glow-lime/30"
                            : "bg-surface-2 text-brand-white/70 hover:text-brand-white hover:bg-surface-3 border border-surface-4"
                        }`}
                      >
                        {selectedIndex === idx && (
                          <motion.span
                            layoutId="activeUnitPill"
                            className="absolute inset-0 rounded-xl bg-brand-lime -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                        <Bot className="h-3.5 w-3.5" />
                        <span>{unit.code}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* DISPATCH ACTION BUTTON */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDispatchAction}
                    disabled={isPacking || isDriving || isConfirmed}
                    className="relative w-full overflow-hidden rounded-2xl py-3.5 px-6 font-black text-caption transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg cursor-pointer bg-brand-lime text-[#0A0A0A]"
                  >
                    {/* Driving Animation Overlay */}
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
                  </motion.button>
                </div>
              </motion.div>

              {/* RIGHT SIDE: ROBOT PICTURE GLIDES SMOOTHLY FROM CENTER TO RIGHT */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full blur-3xl bg-brand-lime/25 opacity-60 animate-pulse" />

                  {/* Same layoutId so robot image glides seamlessly to the right side */}
                  <motion.img
                    layoutId="robot-showcase-hero-image"
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    src={activeRobot.imageSrc}
                    alt={activeRobot.name}
                    className="w-44 h-44 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
                    style={{
                      transform: "translate(0px, -6px) scale(1.06) rotate(4deg)",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
