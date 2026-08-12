"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface OtpOrbitSpinnerProps {
  /** The 4 filled digit characters to orbit (use first 4 of the 6-digit PIN). */
  digits: string[];
  /** Current animation phase. */
  phase: "orbiting" | "success" | "error";
}

/**
 * OtpOrbitSpinner — Reel 2 (OTP Verification V3) inspired orbit animation.
 *
 * Phases:
 *  orbiting — 4 digit boxes detach from their grid positions and orbit a
 *             center hub in a circle, spinning continuously.
 *  success  — boxes collapse to center, flash green, small particle burst,
 *             then "Verified successfully" fades in.
 *  error    — boxes shake horizontally.
 *
 * Every phase is driven by the caller's real fetch state — no internal timers.
 * Respects prefers-reduced-motion.
 */
export default function OtpOrbitSpinner({ digits, phase }: OtpOrbitSpinnerProps) {
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Orbit radius and per-box angular positions (4 boxes, 90° apart)
  const RADIUS = 56;
  const angles = [0, 90, 180, 270]; // degrees

  const toXY = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.cos(rad) * RADIUS,
      y: Math.sin(rad) * RADIUS,
    };
  };

  // Particle positions for burst effect
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: i * 45,
    id: i,
  }));

  if (prefersReduced) {
    // Reduced-motion: just show a simple spinner
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="h-10 w-10 rounded-full border-2 border-surface-3 border-t-brand-lime animate-spin" />
        <span className="text-caption text-brand-gray/60">
          {phase === "orbiting" ? "Verifying…" : phase === "success" ? "Verified ✓" : "Failed"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Orbit arena */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: RADIUS * 2 + 64, height: RADIUS * 2 + 64 }}
      >
        {/* Center hub */}
        <motion.div
          className="absolute w-8 h-8 rounded-full border-2 border-brand-lime/40"
          animate={
            phase === "orbiting"
              ? { scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }
              : phase === "success"
              ? { scale: [1, 1.6, 1], opacity: [1, 0, 0] }
              : { scale: 1, opacity: 0 }
          }
          transition={{
            duration: phase === "orbiting" ? 1.2 : 0.5,
            repeat: phase === "orbiting" ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Success particle burst */}
        <AnimatePresence>
          {phase === "success" &&
            particles.map((p) => {
              const { x, y } = toXY(p.angle);
              return (
                <motion.span
                  key={p.id}
                  className="absolute w-2 h-2 rounded-full bg-status-success"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: x * 1.4, y: y * 1.4, opacity: 0, scale: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              );
            })}
        </AnimatePresence>

        {/* Orbiting / collapsing digit boxes */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={
            phase === "orbiting"
              ? { rotate: 360 }
              : {}
          }
          transition={
            phase === "orbiting"
              ? { repeat: Infinity, duration: 1.2, ease: "linear" }
              : { duration: 0 }
          }
        >
          {digits.slice(0, 4).map((digit, i) => {
            const { x, y } = toXY(angles[i]);
            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{ x, y }}
                animate={
                  phase === "orbiting"
                    ? { x, y }
                    : phase === "success"
                    ? {
                        x: 0,
                        y: 0,
                        scale: [1, 0.6, 0],
                        backgroundColor: ["#C6FF00", "#10B981", "#10B981"],
                      }
                    : { x: [x, x - 6, x + 6, x - 6, x], y }
                }
                transition={
                  phase === "success"
                    ? { duration: 0.5, ease: "easeInOut" }
                    : phase === "error"
                    ? { duration: 0.4, ease: "easeInOut" }
                    : { duration: 0 }
                }
              >
                <div
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-title font-mono font-black transition-colors ${
                    phase === "success"
                      ? "bg-status-success border-status-success text-white"
                      : phase === "error"
                      ? "bg-status-error/20 border-status-error text-status-error"
                      : "bg-brand-lime border-brand-lime text-brand-black"
                  }`}
                  style={{ minWidth: 44 }}
                >
                  {digit || "•"}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {phase === "orbiting" && (
          <motion.p
            key="orbiting-text"
            className="text-caption text-brand-gray/60 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Verifying security code…
          </motion.p>
        )}
        {phase === "success" && (
          <motion.p
            key="success-text"
            className="text-caption text-status-success font-bold mt-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.35 }}
          >
            ✓ Verified successfully
          </motion.p>
        )}
        {phase === "error" && (
          <motion.p
            key="error-text"
            className="text-caption text-status-error font-bold mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Invalid code — please try again
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
