"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * ConfirmDialog — A rounded modal confirmation dialog (Item 4).
 *
 * Inspired by Sanjay's note: "ek popup ana chahiye jo confirm kare —
 * popup ka window curve-shape (rounded) ho."
 *
 * Uses framer-motion for fade + scale entrance/exit.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        /* Backdrop */
        <motion.div
          key="confirm-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
        >
          {/* Card — stopPropagation prevents backdrop click from closing when clicking inside */}
          <motion.div
            className="w-full max-w-sm glassmorphism rounded-3xl border border-surface-4 p-7 space-y-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-brand-lime/15 border border-brand-lime/30 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6 text-brand-lime"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3l14 9-14 9V3z"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="text-center space-y-1.5">
              <h3 className="text-title font-extrabold text-brand-white">{title}</h3>
              <p className="text-caption text-brand-gray/60 leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-surface-4 text-brand-gray/70 hover:text-brand-white hover:border-surface-3 transition-all text-caption font-bold"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all text-caption"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
