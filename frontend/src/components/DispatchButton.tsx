"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, AlertCircle, Bot } from "lucide-react";
import { toast } from "sonner";

type Phase = "idle" | "dispatching" | "success" | "error";

interface DispatchButtonProps {
  /** Async action — animation drives off this promise's lifecycle. */
  onConfirm: () => Promise<void>;
  /** Button label shown in idle state. */
  label: string;
  /** Optional extra className on the wrapper. */
  className?: string;
  /** Optional: whether to show preloaded dispatch variant label. */
  isPreloaded?: boolean;
}

/**
 * DispatchButton — Reel 3 (Axis Cola / van-drives-off) inspired dispatch CTA.
 *
 * Phases:
 *  1. idle       — label + Play icon
 *  2. dispatching — label fades out, Bot icon drives left → right across button,
 *                   loops if promise is still pending when animation finishes
 *  3. success    — collapses to "✓ Mission Started" green pill for 1.5s
 *  4. error      — shake briefly, revert to idle
 *
 * Every phase is driven by the real promise state — no setTimeout stand-ins.
 * Respects prefers-reduced-motion.
 */
export default function DispatchButton({
  onConfirm,
  label,
  className = "",
  isPreloaded = false,
}: DispatchButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingRef = useRef(false);

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const handleClick = useCallback(async () => {
    if (phase !== "idle") return;
    pendingRef.current = true;
    setPhase("dispatching");

    try {
      await onConfirm();
      pendingRef.current = false;
      setPhase("success");
      // Auto-revert to idle after 1.5s (success confirmation window)
      setTimeout(() => setPhase("idle"), 1500);
    } catch (err: any) {
      pendingRef.current = false;
      // "CANCELLED" means the user dismissed a confirm dialog — silent revert
      if (err?.message === "CANCELLED") {
        setPhase("idle");
        return;
      }
      setPhase("error");
      toast.error(err?.message || "Mission start failed. Please try again.");
      // Revert to idle after shake
      setTimeout(() => setPhase("idle"), 700);
    }
  }, [phase, onConfirm]);

  // ── Shared button appearance ────────────────────────────────
  const baseRing =
    "relative overflow-hidden rounded-xl font-extrabold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime flex items-center justify-center gap-2";

  // ── Phase: idle ─────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${baseRing} bg-brand-lime text-brand-black px-6 py-2.5 text-caption hover:shadow-glow-lime ${className}`}
      >
        <Play className="h-4 w-4 fill-current shrink-0" />
        <span>{label}</span>
      </button>
    );
  }

  // ── Phase: success ──────────────────────────────────────────
  if (phase === "success") {
    return (
      <motion.div
        initial={prefersReduced ? false : { scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${baseRing} bg-status-success/20 border border-status-success/40 text-status-success px-5 py-2 text-caption ${className}`}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>✓ Mission Started</span>
      </motion.div>
    );
  }

  // ── Phase: error ────────────────────────────────────────────
  if (phase === "error") {
    return (
      <motion.div
        className={`${baseRing} bg-status-error/20 border border-status-error/40 text-status-error px-6 py-2.5 text-caption ${className}`}
        animate={
          prefersReduced
            ? {}
            : { x: [0, -6, 6, -6, 6, -3, 3, 0] }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed — Tap to retry</span>
      </motion.div>
    );
  }

  // ── Phase: dispatching ──────────────────────────────────────
  // The Bot icon drives left → right, loops while promise is pending.
  return (
    <div
      className={`${baseRing} bg-brand-lime/20 border border-brand-lime/40 text-brand-lime px-6 py-2.5 text-caption ${className}`}
      aria-label="Dispatching…"
      aria-busy="true"
    >
      {/* Faded label beneath */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center gap-2 text-brand-lime/30 text-caption font-extrabold"
        initial={prefersReduced ? false : { opacity: 1 }}
        animate={prefersReduced ? {} : { opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Play className="h-4 w-4 fill-current shrink-0" />
        {label}
      </motion.span>

      {/* Driving bot icon — loops indefinitely while pending */}
      {!prefersReduced ? (
        <motion.div
          className="absolute flex items-center"
          initial={{ x: "-60%" }}
          animate={{ x: "160%" }}
          transition={{
            duration: 0.9,
            ease: "easeIn",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0.25,
          }}
        >
          <Bot className="h-5 w-5 text-brand-lime" />
        </motion.div>
      ) : (
        <span className="text-brand-lime text-caption">Dispatching…</span>
      )}
    </div>
  );
}
