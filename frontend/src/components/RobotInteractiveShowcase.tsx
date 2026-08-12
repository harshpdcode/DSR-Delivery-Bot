"use client";

import { useState } from "react";
import { Bot, Battery, Gauge, Package, X, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
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
  themeHex: string;
  glowShadow: string;
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
    glowShadow: "0 0 50px rgba(132, 224, 0, 0.35)",
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
    glowShadow: "0 0 50px rgba(255, 226, 52, 0.35)",
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
    glowShadow: "0 0 50px rgba(56, 189, 248, 0.35)",
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
    glowShadow: "0 0 50px rgba(192, 132, 252, 0.35)",
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
      {/* ── CARD CONTAINER (LAYOUT SPRINGS) ── */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 240, damping: 25 }}
        className="relative overflow-hidden rounded-3xl border border-surface-4 bg-[#0D0F17] shadow-2xl transition-colors duration-500"
        style={{
          boxShadow: isOpen ? activeRobot.glowShadow : "0 20px 40px rgba(0,0,0,0.6)",
          borderColor: isOpen ? `${activeRobot.themeHex}60` : "rgba(255,255,255,0.08)",
        }}
      >
        {/* ── CIRCLE FLOOD BACKGROUND ANIMATION (clip-path circle fill) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={false}
          animate={{
            backgroundColor: activeRobot.themeHex,
            opacity: isOpen ? 0.09 : 0.02,
            clipPath: isOpen ? "circle(150% at 50% 50%)" : "circle(0% at 50% 50%)",
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Ambient radial glow backdrop */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0"
          animate={{
            backgroundColor: activeRobot.themeHex,
            opacity: isOpen ? 0.22 : 0.1,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Top Header Bar */}
        <div className="relative z-20 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.span
              animate={{ backgroundColor: activeRobot.themeHex }}
              className="h-2 w-2 rounded-full animate-pulse"
            />
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
                onClick={handleToggleOpen}
                className="p-1.5 rounded-full bg-surface-2/80 text-brand-white/80 hover:text-brand-white cursor-pointer z-30"
                title="Close Showcase"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── CONTENT SWITCHER (ANAMATE PRESENCE) ── */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* ── COLLAPSED VIEW ── */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={handleToggleOpen}
                className="px-6 pb-8 pt-2 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                {/* Floating Robot Avatar */}
                <motion.div
                  className="relative my-4"
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-75"
                    animate={{ backgroundColor: activeRobot.themeHex }}
                    transition={{ duration: 0.5 }}
                  />
                  <img
                    src={activeRobot.imageSrc}
                    alt={activeRobot.name}
                    className="w-36 h-36 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] relative z-10 animate-float"
                  />
                </motion.div>

                <h3 className="text-title font-extrabold text-brand-white group-hover:text-brand-lime transition-colors">
                  {activeRobot.name}
                </h3>
                <p className="text-caption text-brand-white/60 max-w-sm mt-1">
                  Autonomous delivery bot tailored for campus logistics.
                </p>

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-2/80 border border-surface-4 text-caption font-bold text-brand-white group-hover:border-brand-lime transition-all"
                >
                  <span className="h-2 w-2 rounded-full bg-brand-lime animate-ping" />
                  <span>TAP TO INSPECT &amp; SWITCH ROBOT</span>
                </motion.div>
              </motion.div>
            ) : (
              /* ── EXPANDED REEL SHOWCASE VIEW ── */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[380px]"
              >
                {/* LEFT DETAILS PANEL (Cols 7) */}
                <div className="md:col-span-7 space-y-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRobot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div>
                        <motion.span
                          className="inline-block px-2.5 py-0.5 rounded-md text-micro font-black uppercase tracking-wider mb-2"
                          style={{
                            backgroundColor: `${activeRobot.themeHex}25`,
                            color: activeRobot.themeHex,
                          }}
                        >
                          {activeRobot.tagline}
                        </motion.span>
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
                    </motion.div>
                  </AnimatePresence>

                  {/* ROBOT COLOR/UNIT SELECTOR DOTS */}
                  <div className="space-y-2">
                    <span className="text-micro font-extrabold uppercase tracking-widest text-brand-white/50 block">
                      Select Robot Unit
                    </span>
                    <div className="flex items-center space-x-3">
                      {ROBOT_UNITS.map((unit, idx) => (
                        <motion.button
                          key={unit.id}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelectRobot(idx)}
                          className="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
                          style={{
                            backgroundColor: unit.themeHex,
                            boxShadow: selectedIndex === idx ? `0 0 16px ${unit.themeHex}` : "none",
                            opacity: selectedIndex === idx ? 1 : 0.65,
                          }}
                          title={unit.name}
                        >
                          {selectedIndex === idx && (
                            <motion.span
                              layoutId="activeDot"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              className="w-2.5 h-2.5 rounded-full bg-[#0D0F17]"
                            />
                          )}
                        </motion.button>
                      ))}
                      <span className="text-caption font-bold text-brand-white ml-2">
                        {activeRobot.code}
                      </span>
                    </div>
                  </div>

                  {/* DISPATCH ACTION BUTTON */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDispatchAction}
                      disabled={isPacking || isDriving || isConfirmed}
                      className="relative w-full overflow-hidden rounded-2xl py-3.5 px-6 font-black text-caption transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                      style={{
                        backgroundColor: isConfirmed ? "#10B981" : activeRobot.themeHex,
                        color: "#0A0A0A",
                      }}
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
                </div>

                {/* RIGHT ROBOT ART (SPRING MOTION POSING) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRobot.id}
                      initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                      animate={{ scale: 1.08, rotate: 6, opacity: 1, y: -10 }}
                      exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center group"
                    >
                      {/* Glow Halo */}
                      <motion.div
                        className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse"
                        animate={{ backgroundColor: activeRobot.themeHex }}
                        transition={{ duration: 0.5 }}
                      />

                      <img
                        src={activeRobot.imageSrc}
                        alt={activeRobot.name}
                        className="w-44 h-44 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
