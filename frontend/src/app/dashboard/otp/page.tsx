"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  KeyRound, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Delete, 
  PackageCheck,
  Bot,
  MapPin,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function OtpUnlockPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const { token } = useAuthStore();
  const router = useRouter();

  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [unlockedData, setUnlockedData] = useState<any>(null);

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
            if (found) setSelectedDelivery(found);
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
      toast.error("Please enter a valid tracking code or select an active delivery");
      return;
    }

    if (pin.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/v1/otp/verify", {
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

      const data = await res.json();

      if (res.ok && data.success) {
        setUnlockedData(targetDelivery);
        setUnlockedSuccess(true);
        toast.success(`OTP Verified! Compartment Unlocked for ${targetDelivery.receiver_name || "Receiver"} 🔓`);

        fetch(`/api/v1/deliveries/${targetDelivery.id}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        toast.error(data.detail || data.message || "Invalid OTP code. Please check and try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please check network connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-lime text-brand-black text-caption font-extrabold shadow-xs">
          <KeyRound className="h-4 w-4" />
          <span>Receiver OTP Parcel Station</span>
        </div>
        <h1 className="text-display font-extrabold tracking-tight text-brand-white">Unlock Robot Compartment</h1>
        <p className="text-body text-brand-gray/60 max-w-xl mx-auto font-medium">
          Enter your delivery tracking code and the 6-digit OTP received via SMS to open the robot cargo compartment.
        </p>
      </div>

      {/* Main Unlock Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Delivery Selection */}
        <div className="lg:col-span-5 glassmorphism rounded-2xl border border-surface-4 p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-surface-3 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow flex items-center justify-center p-1">
              <img src="/Robo.webp" alt="Robo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h3 className="text-title font-bold text-brand-white">Select Active Parcel</h3>
              <p className="text-micro font-medium text-brand-gray/60">Pending Retrieval</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-caption font-bold text-brand-white">Tracking Code / Mission</label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value.toUpperCase());
                const match = activeDeliveries.find((d) => d.tracking_code === e.target.value.toUpperCase());
                if (match) setSelectedDelivery(match);
              }}
              placeholder="E.g., DSR-8X92K1"
              className="w-full bg-surface-2 border border-surface-3 focus:border-brand-lime outline-none rounded-xl py-3 px-4 text-body font-mono font-bold text-brand-white placeholder:text-brand-gray/40 uppercase"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-micro font-bold uppercase tracking-wider text-brand-gray/60">
              Choose From Active Deliveries
            </span>

            {loadingDeliveries ? (
              <div className="flex items-center space-x-2 py-4 text-brand-gray/60">
                <Loader2 className="h-4 w-4 animate-spin text-brand-lime" />
                <span className="text-caption font-bold">Loading active missions...</span>
              </div>
            ) : activeDeliveries.length === 0 ? (
              <p className="text-caption text-brand-gray/50 italic py-2">No active arrivals pending unlock.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeDeliveries.map((del) => {
                  const isSelected = selectedDelivery?.id === del.id;
                  return (
                    <div
                      key={del.id}
                      onClick={() => {
                        setSelectedDelivery(del);
                        setTrackingCode(del.tracking_code);
                      }}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-lime/10 border-2 border-brand-lime"
                          : "bg-surface-2 border border-surface-3 hover:border-brand-lime/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-caption text-brand-white">{del.tracking_code}</span>
                          <span className="text-micro px-2 py-0.5 rounded bg-brand-yellow text-brand-black font-bold capitalize">
                            {del.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-micro font-medium text-brand-gray/60 mt-1">
                          {del.origin_block} &rarr; {del.destination_block} ({del.receiver_name})
                        </p>
                      </div>
                      <span className="text-micro font-bold text-brand-lime">Select</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive 6-Digit Keypad */}
        <div className="lg:col-span-7 glassmorphism rounded-2xl border border-surface-4 p-8 space-y-8 text-center shadow-lg">
          <div>
            <h3 className="text-title font-bold text-brand-white">Interactive Keypad PIN Entry</h3>
            <p className="text-caption text-brand-gray/60 mt-1 font-medium">Enter the 6-digit OTP code to disengage hatch lock.</p>
          </div>

          {/* PIN Display */}
          <div className="flex justify-center items-center space-x-3">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const char = pin[index] || "";
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-title font-mono font-black transition-all ${
                    char
                      ? "bg-brand-lime border-brand-lime text-brand-black scale-105 shadow-glow-lime"
                      : "bg-surface-2 border-surface-3 text-brand-gray/40"
                  }`}
                >
                  {char ? "•" : ""}
                </div>
              );
            })}
          </div>

          {/* Keypad Buttons */}
          <div className="max-w-xs mx-auto grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-14 rounded-xl bg-surface-2 border border-surface-3 hover:bg-brand-lime hover:text-brand-black active:scale-95 text-title font-black text-brand-white transition-all shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-14 rounded-xl bg-surface-2 border border-surface-3 hover:bg-status-error hover:text-white active:scale-95 text-caption font-bold text-brand-gray/60 transition-all"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-14 rounded-xl bg-surface-2 border border-surface-3 hover:bg-brand-lime hover:text-brand-black active:scale-95 text-title font-black text-brand-white transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDeletePin}
              className="h-14 rounded-xl bg-surface-2 border border-surface-3 hover:bg-surface-3 active:scale-95 flex items-center justify-center text-brand-white transition-all"
              aria-label="Delete digit"
            >
              <Delete className="h-6 w-6" />
            </button>
          </div>

          {/* Unlock Submit Button */}
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying || pin.length !== 6}
            className={`w-full py-4 rounded-xl font-bold text-body-lg transition-all flex items-center justify-center space-x-2 ${
              pin.length === 6 && !isVerifying
                ? "bg-brand-lime text-brand-black hover:shadow-glow-lime hover:scale-[1.01] cursor-pointer"
                : "bg-surface-3 text-brand-gray/40 cursor-not-allowed"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5" />
                <span>Verify &amp; Open Compartment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {unlockedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glassmorphism max-w-md w-full p-8 rounded-3xl border border-brand-lime/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-lime/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto border border-brand-lime/30 text-brand-lime">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-heading font-extrabold text-brand-white">Hatch Unlocked!</h2>
              <p className="text-body text-brand-gray/60">
                Locker door opened for parcel <span className="font-mono font-bold text-brand-lime">{unlockedData?.tracking_code}</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-surface-3 text-left space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-brand-gray/50">Recipient:</span>
                <span className="font-bold text-brand-white">{unlockedData?.receiver_name || "Campus User"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray/50">Destination:</span>
                <span className="font-bold text-brand-white">{unlockedData?.destination_block}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray/50">Status:</span>
                <span className="font-bold text-brand-lime uppercase">Completed</span>
              </div>
            </div>

            <button
              onClick={() => {
                setUnlockedSuccess(false);
                setPin("");
                router.push("/dashboard");
              }}
              className="w-full py-3.5 rounded-xl bg-brand-lime text-brand-black font-bold text-body hover:shadow-glow-lime transition-all"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
