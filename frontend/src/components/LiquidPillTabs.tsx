"use client";

import { motion, LayoutGroup } from "framer-motion";
import { useId } from "react";

export interface LiquidPillOption {
  value: string;
  label: string;
}

interface LiquidPillTabsProps {
  options: LiquidPillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * LiquidPillTabs — Reel 1 inspired "liquid glass" segmented tab bar.
 *
 * The selected-tab background is an absolutely-positioned pill that physically
 * slides and (via framer-motion layoutId) auto-morphs between positions as the
 * selection changes. Uses a spring transition for the elasticity effect.
 *
 * Respects prefers-reduced-motion: if the user has requested reduced motion,
 * the pill jumps instantly instead of animating.
 */
export default function LiquidPillTabs({
  options,
  value,
  onChange,
  className = "",
}: LiquidPillTabsProps) {
  const layoutId = useId();

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <LayoutGroup id={layoutId}>
      <div
        className={`relative flex items-center p-1 rounded-2xl bg-surface-2 border border-surface-4 ${className}`}
        role="tablist"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(opt.value)}
              className={`relative flex-1 py-2 px-3.5 rounded-xl text-caption font-extrabold transition-colors duration-150 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                isSelected ? "text-brand-lime font-black" : "text-brand-white/60 hover:text-brand-white"
              }`}
            >
              {/* Animated pill background — sits behind the label */}
              {isSelected && (
                <motion.div
                  layoutId={`pill-${layoutId}`}
                  className="absolute inset-0 rounded-xl bg-brand-lime/25 border border-brand-lime/50 backdrop-blur-md"
                  style={{ zIndex: -1 }}
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }
                  }
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
