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
          // Filter for active deliveries
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
      // Try to fetch delivery by code
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

        // Complete delivery automatically
        fetch(`/api/v1/deliveries/${targetDelivery.id}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        toast.error(data.message || "Invalid OTP code. Please check and try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please check network connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-caption font-bold">
          <KeyRound className="h-4 w-4" />
          <span>{"Receiver OTP Parcel Station"}</span>
        </div>
        <h1 className="text-display font-extrabold tracking-tight">{"Unlock Robot Compartment"}</h1>
        <p className="text-body text-brand-gray/60 max-w-xl mx-auto">
          {"Enter your delivery tracking code and the 6-digit OTP received via SMS to open the robot cargo compartment."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Delivery Selection */}
        <div className="lg:col-span-5 glassmorphism rounded-3xl p-6 border border-surface-4 space-y-6">
          <h3 className="text-title font-bold flex items-center space-x-2">
            <PackageCheck className="h-5 w-5 text-brand-lime" />
            <span>{"Select Active Parcel"}</span>
          </h3>

          <div className="space-y-4">
            <label className="text-caption font-semibold text-brand-gray/70">{"Tracking Code / Mission"}</label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value.toUpperCase());
                const match = activeDeliveries.find((d) => d.tracking_code === e.target.value.toUpperCase());
                if (match) setSelectedDelivery(match);
              }}
              placeholder="E.g., DSR-8X92K1"
              className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body font-mono font-bold text-brand-white uppercase"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-micro font-bold uppercase tracking-wider text-brand-gray/40">
              {"Or Choose From Active Deliveries"}
            </span>

            {loadingDeliveries ? (
              <div className="flex items-center space-x-2 py-4 text-brand-gray/50">
                <Loader2 className="h-4 w-4 animate-spin text-brand-lime" />
                <span className="text-caption">{"Loading active missions..."}</span>
              </div>
            ) : activeDeliveries.length === 0 ? (
              <p className="text-caption text-brand-gray/40 italic py-2">{"No active arrivals pending unlock."}</p>
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
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-lime/10 border-brand-lime text-brand-white"
                          : "bg-surface-1 border-surface-3 hover:border-surface-4 text-brand-gray/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-caption text-brand-white">{del.tracking_code}</span>
                          <span className="text-micro px-2 py-0.5 rounded bg-surface-2 text-brand-lime font-semibold capitalize">
                            {del.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-micro text-brand-gray/50 mt-1">
                          {del.origin_block} &rarr; {del.destination_block} ({del.receiver_name})
                        </p>
                      </div>
                      <Bot className={`h-5 w-5 ${isSelected ? "text-brand-lime" : "text-brand-gray/30"}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive 6-Digit Keypad */}
        <div className="lg:col-span-7 glassmorphism rounded-3xl p-8 border border-surface-4 space-y-8 text-center">
          <div>
            <h3 className="text-title font-bold text-brand-white">{"Interactive Keypad PIN Entry"}</h3>
            <p className="text-caption text-brand-gray/50 mt-1">{"Enter the 6-digit OTP code to disengage hatch lock."}</p>
          </div>

          {/* PIN Display */}
          <div className="flex justify-center items-center space-x-3">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const char = pin[index] || "";
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-title font-mono font-extrabold transition-all shadow-inner ${
                    char
                      ? "bg-brand-lime/10 border-brand-lime text-brand-lime scale-105"
                      : "bg-surface-1 border-surface-4 text-brand-gray/30"
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
                className="h-14 rounded-2xl bg-surface-1 border border-surface-3 hover:border-brand-lime/50 hover:bg-surface-2 hover:text-brand-lime active:scale-95 text-title font-bold text-brand-white transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-14 rounded-2xl bg-surface-1 border border-surface-3 hover:bg-status-error/10 hover:text-status-error active:scale-95 text-caption font-bold text-brand-gray/60 transition-all"
            >
              {"CLEAR"}
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-14 rounded-2xl bg-surface-1 border border-surface-3 hover:border-brand-lime/50 hover:bg-surface-2 hover:text-brand-lime active:scale-95 text-title font-bold text-brand-white transition-all"
            >
              {"0"}
            </button>
            <button
              type="button"
              onClick={handleDeletePin}
              className="h-14 rounded-2xl bg-surface-1 border border-surface-3 hover:bg-surface-2 active:scale-95 flex items-center justify-center text-brand-gray hover:text-brand-white transition-all"
              aria-label="Delete digit"
            >
              <Delete className="h-6 w-6" />
            </button>
          </div>

          {/* Unlock Submit Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isVerifying || pin.length < 6}
            className="w-full max-w-xs mx-auto py-4 rounded-2xl bg-gradient-to-r from-brand-lime to-emerald-400 text-brand-black font-extrabold text-body hover:shadow-glow-lime hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isVerifying ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Unlock className="h-6 w-6" />
            )}
            <span>{"Verify & Open Compartment"}</span>
          </button>
        </div>
      </div>

      {/* ── Unlocked Success Modal ────────────────────── */}
      {unlockedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 backdrop-blur-md p-6 animate-fade-in">
          <div className="w-full max-w-md glassmorphism rounded-3xl p-8 border-2 border-brand-lime/50 shadow-glow-lime/20 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-brand-lime/20 border-2 border-brand-lime flex items-center justify-center mx-auto text-brand-lime animate-bounce">
              <Unlock className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-display font-extrabold text-brand-white">{"Compartment Unlocked! 🔓"}</h2>
              <p className="text-caption text-brand-gray/70">
                {"The robot cargo door is disengaged. Please collect your parcel from the hatch."}
              </p>
            </div>

            {unlockedData && (
              <div className="p-4 rounded-2xl bg-surface-1 border border-surface-3 text-left space-y-2 text-caption">
                <div className="flex justify-between border-b border-surface-3/50 pb-2">
                  <span className="text-brand-gray/50">{"Tracking Code"}</span>
                  <span className="font-mono font-bold text-brand-white">{unlockedData.tracking_code}</span>
                </div>
                <div className="flex justify-between border-b border-surface-3/50 pb-2">
                  <span className="text-brand-gray/50">{"Sender"}</span>
                  <span className="font-semibold text-brand-white">{unlockedData.sender_name || "Sender"}</span>
                </div>
                <div className="flex justify-between border-b border-surface-3/50 pb-2">
                  <span className="text-brand-gray/50">{"Receiver"}</span>
                  <span className="font-semibold text-brand-lime">{unlockedData.receiver_name || "You (Verified)"}</span>
                </div>
                <div className="flex justify-between border-b border-surface-3/50 pb-2">
                  <span className="text-brand-gray/50">{"Destination"}</span>
                  <span className="font-semibold text-brand-white">{unlockedData.destination_block || "Arrival Point"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray/50">{"Hatch Status"}</span>
                  <span className="font-bold text-status-success">{"OPEN — Ready for Retrieval"}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setUnlockedSuccess(false);
                router.push("/dashboard");
              }}
              className="w-full py-4 rounded-2xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{"Done & Close Station"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
