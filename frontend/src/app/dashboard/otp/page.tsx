"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  KeyRound, 
  Unlock, 
  CheckCircle2, 
  Loader2, 
  Delete, 
  Bot, 
  MapPin, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Search,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import OtpOrbitSpinner from "@/components/OtpOrbitSpinner";

type VerifyPhase = "input" | "orbiting" | "success" | "error";

export default function OtpUnlockPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const { token } = useAuthStore();
  const router = useRouter();

  // 2-Phase UX step state
  const [uiPhase, setUiPhase] = useState<1 | 2>(1);

  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [unlockedData, setUnlockedData] = useState<any>(null);

  // Animation phase state (Reel 2 — OTP orbit-verify-collapse)
  const [verifyPhase, setVerifyPhase] = useState<VerifyPhase>("input");

  // Fetch active deliveries for quick selection
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch("/api/v1/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const active = data.filter((d: any) => 
            ["pending", "pickup_in_progress", "en_route", "arrived", "waiting_otp"].includes(d.status)
          );
          setActiveDeliveries(active);

          if (initialCode) {
            const found = data.find((d: any) => d.tracking_code === initialCode);
            if (found) {
              setSelectedDelivery(found);
              setUiPhase(2);
            }
          } else if (active.length > 0) {
            setSelectedDelivery(active[0]);
            setTrackingCode(active[0].tracking_code);
          }
        }
      } catch (err) {
        console.error("Failed to load active deliveries", err);
      } finally {
        setLoadingDeliveries(false);
      }
    };

    if (token) fetchActive();
  }, [token, initialCode]);

  const handleSelectDelivery = (del: any) => {
    setSelectedDelivery(del);
    setTrackingCode(del.tracking_code);
    setUiPhase(2);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleDeletePin = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    setPin("");
  };

  const handleVerifyOtp = async () => {
    let targetDelivery = selectedDelivery;
    if (!targetDelivery && trackingCode) {
      targetDelivery = activeDeliveries.find((d) => d.tracking_code === trackingCode.toUpperCase());
    }

    if (!targetDelivery && trackingCode) {
      try {
        const fetchRes = await fetch("/api/v1/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (fetchRes.ok) {
          const allDel = await fetchRes.json();
          targetDelivery = allDel.find((d: any) => d.tracking_code === trackingCode.toUpperCase());
        }
      } catch (e) {
        console.error("Lookup error", e);
      }
    }

    if (!targetDelivery) {
      toast.error("Please select a robot or enter a valid tracking code");
      setUiPhase(1);
      return;
    }

    if (pin.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    // Start orbit animation — driven by real fetch state with guaranteed minimum spin duration
    setVerifyPhase("orbiting");
    setIsVerifying(true);
    const minOrbitDelay = new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const fetchPromise = fetch("/api/v1/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: targetDelivery.id,
          otp: pin,
        }),
      });

      const [res] = await Promise.all([fetchPromise, minOrbitDelay]);
      const data = await res.json();

      if (res.ok && data.success) {
        // Transition to success phase — collapses boxes to center, particle burst
        setVerifyPhase("success");
        setUnlockedData(targetDelivery);
        toast.success(`OTP Verified! Compartment Unlocked 🔓`);

        fetch(`/api/v1/deliveries/${targetDelivery.id}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        // Allow 1.8s for user to view the success particle collapse animation before popping up modal
        setTimeout(() => {
          setUnlockedSuccess(true);
          setVerifyPhase("input");
        }, 1800);
      } else {
        // Transition to error phase — shake boxes
        setVerifyPhase("error");
        toast.error(data.detail || data.message || "Invalid OTP code. Please check and try again.");
        setTimeout(() => {
          setVerifyPhase("input");
        }, 1200);
      }
    } catch (err: any) {

      setVerifyPhase("error");
      toast.error(err.message || "Verification failed. Please check network connection.");
      setTimeout(() => {
        setVerifyPhase("input");
      }, 1200);
    } finally {
      setIsVerifying(false);
    }
  };

  const isInAnimation = verifyPhase === "orbiting" || verifyPhase === "success" || verifyPhase === "error";

  return (
    <div className="max-w-xl mx-auto flex flex-col justify-between min-h-[calc(100vh-6rem)] max-h-[calc(100vh-5rem)] overflow-hidden select-none px-2 sm:px-4 py-2">
      
      {/* ── Compact Header Bar ───────────────────────────────── */}
      <div className="text-center space-y-1 shrink-0">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-lime text-brand-black text-micro font-extrabold shadow-xs">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Phase {uiPhase} of 2: {uiPhase === 1 ? "Select Robot Unit" : "Enter Parcel OTP"}</span>
        </div>
        <h1 className="text-body sm:text-heading font-extrabold tracking-tight text-brand-white">
          {uiPhase === 1 ? "Select Arrived Fleet Robot" : "Unlock Robot Compartment"}
        </h1>
      </div>

      {/* ── 2-PHASE INTERACTION CONTAINER ────────────────────── */}
      <div className="flex-1 flex flex-col justify-center min-h-0 my-2">
        <AnimatePresence mode="wait">

          {/* ── PHASE 1: SELECT ROBOT / ACTIVE PARCEL ──────────────── */}
          {uiPhase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="glassmorphism rounded-2xl border border-surface-4 p-4 sm:p-5 flex flex-col justify-between h-full max-h-[520px] overflow-hidden space-y-3"
            >
              <div className="space-y-2 shrink-0">
                <div className="flex items-center space-x-2 border-b border-surface-3 pb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-yellow flex items-center justify-center p-0.5 shrink-0">
                    <img src="/Robo.webp" alt="Robo" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-caption font-bold text-brand-white">Select Delivery Unit</h3>
                    <p className="text-micro text-brand-white/60">Choose arrived robot to unlock</p>
                  </div>
                </div>

                {/* Tracking Code Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-white/40" />
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value.toUpperCase());
                      const match = activeDeliveries.find((d) => d.tracking_code === e.target.value.toUpperCase());
                      if (match) setSelectedDelivery(match);
                    }}
                    placeholder="Search Tracking Code (e.g. DSR-8X92)"
                    className="w-full bg-surface-2 border border-surface-3 focus:border-brand-lime outline-none rounded-xl py-2 pl-9 pr-3 text-caption font-mono font-bold text-brand-white uppercase"
                  />
                </div>
              </div>

              {/* Active Deliveries List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {loadingDeliveries ? (
                  <div className="flex items-center justify-center py-8 space-x-2 text-brand-white/60">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-lime" />
                    <span className="text-caption font-bold">Scanning active fleet...</span>
                  </div>
                ) : activeDeliveries.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Bot className="h-10 w-10 text-brand-white/40 mx-auto" />
                    <p className="text-caption font-bold text-brand-white">No Arrivals Pending Unlock</p>
                    <p className="text-micro text-brand-white/50">Enter tracking code manually above if expected.</p>
                  </div>
                ) : (
                  activeDeliveries.map((del) => {
                    const isSelected = selectedDelivery?.id === del.id;
                    return (
                      <div
                        key={del.id}
                        onClick={() => handleSelectDelivery(del)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-brand-lime/10 border-2 border-brand-lime"
                            : "bg-surface-2 border border-surface-3 hover:border-brand-lime/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-caption text-brand-white">{del.tracking_code}</span>
                            <span className="text-micro px-2 py-0.2 rounded bg-brand-yellow text-brand-black font-extrabold capitalize truncate">
                              {del.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-micro text-brand-white/60 truncate font-medium">
                            {del.origin_block} &rarr; <span className="text-brand-lime font-bold">{del.destination_block}</span> ({del.receiver_name || "Receiver"})
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-lime text-brand-black text-micro font-extrabold flex items-center gap-1 hover:shadow-glow-lime"
                        >
                          <span>Select</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Continue Button */}
              {selectedDelivery && (
                <button
                  type="button"
                  onClick={() => setUiPhase(2)}
                  className="w-full py-2.5 rounded-xl bg-brand-lime text-brand-black font-extrabold text-caption hover:shadow-glow-lime transition-all shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <span>Continue to OTP Keypad</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* ── PHASE 2: INTERACTIVE OTP KEYPAD ────────────────────── */}
          {uiPhase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="glassmorphism rounded-2xl border border-surface-4 p-3.5 sm:p-5 flex flex-col justify-between space-y-3 text-center shadow-lg"
            >
              {/* Selected Robot Summary Banner */}
              <div className="flex items-center justify-between bg-surface-2 p-2.5 rounded-xl border border-surface-3 text-micro shrink-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-brand-yellow flex items-center justify-center p-0.5 shrink-0">
                    <img src="/Robo.webp" alt="Robo" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-mono font-bold text-brand-white truncate">
                    {selectedDelivery?.tracking_code || "Parcel"} ({selectedDelivery?.destination_block || "Station"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUiPhase(1)}
                  className="shrink-0 text-brand-lime hover:underline font-bold text-micro flex items-center space-x-0.5 ml-2"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* PIN Display / Orbit Animation Area */}
              <div className="shrink-0 flex justify-center py-1">
                <AnimatePresence mode="wait">
                  {isInAnimation ? (
                    <motion.div
                      key="orbit"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <OtpOrbitSpinner
                        digits={pin.split("").slice(0, 4)}
                        phase={verifyPhase as "orbiting" | "success" | "error"}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pin-display"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-center items-center gap-1.5 sm:gap-2.5"
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const char = pin[index] || "";
                        return (
                          <motion.div
                            key={index}
                            animate={char ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center text-body sm:text-title font-mono font-black transition-all ${
                              char
                                ? "bg-brand-lime border-brand-lime text-brand-black scale-105 shadow-glow-lime"
                                : "bg-surface-2 border-surface-3 text-brand-white/40"
                            }`}
                          >
                            {char ? "•" : ""}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Keypad Buttons */}
              <AnimatePresence>
                {!isInAnimation && (
                  <motion.div
                    key="keypad"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2 shrink-0"
                  >
                    <div className="max-w-xs mx-auto grid grid-cols-3 gap-1.5 sm:gap-2.5">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeyPress(num)}
                          className="h-10 sm:h-12 rounded-xl bg-surface-2 border border-surface-3 hover:bg-brand-lime hover:text-brand-black active:scale-95 text-body sm:text-title font-black text-brand-white transition-all shadow-xs"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleClearPin}
                        className="h-10 sm:h-12 rounded-xl bg-surface-2 border border-surface-3 hover:bg-status-error hover:text-white active:scale-95 text-micro font-bold text-brand-white/60 transition-all"
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeyPress("0")}
                        className="h-10 sm:h-12 rounded-xl bg-surface-2 border border-surface-3 hover:bg-brand-lime hover:text-brand-black active:scale-95 text-body sm:text-title font-black text-brand-white transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleDeletePin}
                        className="h-10 sm:h-12 rounded-xl bg-surface-2 border border-surface-3 hover:bg-surface-3 active:scale-95 flex items-center justify-center text-brand-white transition-all"
                        aria-label="Delete digit"
                      >
                        <Delete className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Unlock Submit Button */}
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || pin.length !== 6}
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-extrabold text-caption sm:text-body transition-all flex items-center justify-center space-x-2 ${
                        pin.length === 6 && !isVerifying
                          ? "bg-brand-lime text-brand-black hover:shadow-glow-lime hover:scale-[1.01] cursor-pointer"
                          : "bg-surface-3 text-brand-white/40 cursor-not-allowed"
                      }`}
                    >
                      <Unlock className="h-4 w-4" />
                      <span>Verify &amp; Open Cargo Hatch</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal Overlay */}
      {unlockedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glassmorphism max-w-md w-full p-6 sm:p-8 rounded-3xl border border-brand-lime/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto border border-brand-lime/30 text-brand-lime">
              <CheckCircle2 className="h-9 w-9 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-title sm:text-heading font-extrabold text-brand-white">Hatch Unlocked!</h2>
              <p className="text-caption text-brand-white/60">
                Locker door opened for parcel <span className="font-mono font-bold text-brand-lime">{unlockedData?.tracking_code}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3 text-left space-y-1.5 text-caption">
              <div className="flex justify-between">
                <span className="text-brand-white/50">Recipient:</span>
                <span className="font-bold text-brand-white">{unlockedData?.receiver_name || "Campus User"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-white/50">Destination:</span>
                <span className="font-bold text-brand-white">{unlockedData?.destination_block}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-white/50">Status:</span>
                <span className="font-bold text-brand-lime uppercase">Completed</span>
              </div>
            </div>

            <button
              onClick={() => {
                setUnlockedSuccess(false);
                setPin("");
                router.push("/dashboard");
              }}
              className="w-full py-3 rounded-xl bg-brand-lime text-brand-black font-extrabold text-caption sm:text-body hover:shadow-glow-lime transition-all"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
