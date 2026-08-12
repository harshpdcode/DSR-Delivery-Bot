"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Battery, Zap, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Robot {
  id: number;
  name: string;
  model_type: string;
  status: string;
  battery_level: number;
  payload_capacity_kg?: number;
}

interface FleetSpotlightCardProps {
  robots: Robot[];
  isLoading?: boolean;
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    idle: "Idle — Ready",
    en_route: "En Route",
    delivering: "Delivering",
    returning: "Returning",
    charging: "Charging",
    maintenance: "Maintenance",
    offline: "Offline",
  };
  return map[status] || status.replace(/_/g, " ");
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "idle":
      return "bg-brand-lime text-brand-black";
    case "en_route":
    case "delivering":
    case "returning":
      return "bg-brand-yellow text-brand-black";
    case "charging":
      return "bg-blue-500 text-white";
    case "maintenance":
      return "bg-orange-500 text-white";
    case "offline":
      return "bg-surface-3 text-brand-white/60";
    default:
      return "bg-surface-3 text-brand-white/60";
  }
}

function getBatteryColor(pct: number): string {
  if (pct >= 60) return "bg-brand-lime";
  if (pct >= 25) return "bg-brand-yellow";
  return "bg-status-error";
}

function BatteryBar({ pct }: { pct: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-micro font-bold text-brand-white/60 flex items-center gap-1">
          <Battery className="h-3.5 w-3.5" /> Battery
        </span>
        <span
          className={`text-caption font-extrabold ${
            pct >= 60 ? "text-brand-lime" : pct >= 25 ? "text-brand-yellow" : "text-status-error"
          }`}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBatteryColor(pct)}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function FleetSpotlightCard({ robots, isLoading }: FleetSpotlightCardProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const prefersReduced = useReducedMotion();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStart = useRef<number>(0);

  const count = robots.length;
  const isSingle = count <= 1;

  // Auto-advance timer
  const startTimer = useCallback(() => {
    if (isSingle) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % count);
    }, 4500);
  }, [count, isSingle]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  useEffect(() => {
    stopTimer();
    if (!isPaused) startTimer();
  }, [isPaused, startTimer, stopTimer]);

  const goTo = (idx: number) => {
    setActiveIdx((idx + count) % count);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 4000);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="glassmorphism rounded-3xl border border-surface-4 p-6 flex items-center justify-center h-56">
        <Loader2 className="h-6 w-6 text-brand-lime animate-spin" />
      </div>
    );
  }

  if (count === 0) return null;

  const robot = robots[activeIdx] ?? robots[0];

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReduced ? 0 : dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: prefersReduced ? 0 : dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  const navigate = (newDir: number) => {
    setDir(newDir);
    goTo(activeIdx + newDir);
  };


  return (
    <div
      className="glassmorphism rounded-3xl border border-surface-4 overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            robot.status === "idle"
              ? "radial-gradient(ellipse at 80% 50%, rgba(198,255,0,0.06) 0%, transparent 60%)"
              : robot.status === "en_route" || robot.status === "delivering"
              ? "radial-gradient(ellipse at 80% 50%, rgba(255,226,52,0.07) 0%, transparent 60%)"
              : "none",
        }}
      />

      <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0">
        {/* Robot Image Panel */}
        <div className="relative w-full md:w-64 md:shrink-0 bg-gradient-to-br from-surface-1 to-surface-2 flex items-center justify-center p-8 md:p-10 border-b md:border-b-0 md:border-r border-surface-4">
          {/* Orbiting ring decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-36 h-36 rounded-full border border-brand-lime/15"
              style={prefersReduced ? {} : { animation: "spin 12s linear infinite" }}
            />
            <div
              className="absolute w-24 h-24 rounded-full border border-brand-lime/10"
              style={prefersReduced ? {} : { animation: "spin 8s linear infinite reverse" }}
            />
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={robot.id}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 28 }
              }
              drag={isSingle ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={(_e, info) => {
                setIsPaused(true);
                dragStart.current = info.point.x;
              }}
              onDragEnd={(_e, info) => {
                const vx = info.velocity.x;
                const offset = info.offset.x;
                if (vx < -300 || offset < -60) navigate(1);
                else if (vx > 300 || offset > 60) navigate(-1);
                setTimeout(() => setIsPaused(false), 4000);
              }}
              className="relative z-10 cursor-grab active:cursor-grabbing"
            >
              <img
                src="/Robo.webp"
                alt={robot.name}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Status dot on image */}
          <div
            className={`absolute top-4 right-4 h-3 w-3 rounded-full border-2 border-surface-1 ${
              robot.status === "idle"
                ? "bg-brand-lime"
                : robot.status === "offline"
                ? "bg-surface-3"
                : "bg-brand-yellow"
            }`}
            style={
              robot.status === "idle" && !prefersReduced
                ? { animation: "pulse 2s ease-in-out infinite" }
                : {}
            }
          />
        </div>

        {/* Info Panel */}
        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`info-${robot.id}`}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 28, delay: 0.04 }
              }
              className="space-y-4"
            >
              {/* Name + status */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-heading font-extrabold text-brand-white tracking-tight leading-tight">
                    {robot.name}
                  </h3>
                  <p className="text-caption text-brand-white/60 mt-0.5">{robot.model_type}</p>
                </div>
                <span
                  className={`text-micro font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 ${getStatusClasses(
                    robot.status
                  )}`}
                >
                  {getStatusLabel(robot.status)}
                </span>
              </div>

              {/* Battery */}
              <BatteryBar pct={robot.battery_level} />

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-surface-4/50">
                <div>
                  <span className="text-micro text-brand-white/40 block">Unit ID</span>
                  <span className="text-caption font-mono font-bold text-brand-white">
                    DSR-0{robot.id}
                  </span>
                </div>
                <div>
                  <span className="text-micro text-brand-white/40 block">Payload</span>
                  <span className="text-caption font-bold text-brand-white">
                    {robot.payload_capacity_kg ?? 15} kg
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation controls */}
          {!isSingle && (
            <div className="flex items-center justify-between pt-2">
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {robots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDir(i > activeIdx ? 1 : -1);
                      goTo(i);
                    }}
                    aria-label={`View robot ${i + 1}`}
                    className={`rounded-full transition-all ${
                      i === activeIdx
                        ? "w-6 h-2.5 bg-brand-lime"
                        : "w-2.5 h-2.5 bg-surface-3 hover:bg-brand-lime/40"
                    }`}
                  />
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl bg-surface-2 border border-surface-3 hover:border-brand-lime/40 hover:text-brand-lime text-brand-white/60 transition-all"
                  aria-label="Previous robot"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="p-2 rounded-xl bg-surface-2 border border-surface-3 hover:border-brand-lime/40 hover:text-brand-lime text-brand-white/60 transition-all"
                  aria-label="Next robot"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fleet summary strip */}
      {!isSingle && (
        <div className="border-t border-surface-4 px-6 py-3 flex items-center justify-between bg-surface-1/50">
          <span className="text-micro text-brand-white/50 font-medium">
            {count} units in fleet ·{" "}
            <span className="text-brand-lime font-bold">
              {robots.filter((r) => r.status === "idle").length} ready
            </span>
          </span>
          <span className="text-micro text-brand-white/40">
            {activeIdx + 1} / {count}
          </span>
        </div>
      )}
    </div>
  );
}
