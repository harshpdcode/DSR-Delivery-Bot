"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bot,
  MapPin,
  Package,
  User,
  Phone,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Navigation,
  Battery,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const BLOCKS = ["A Block", "B Block", "C Block", "D Block", "E Block"];

const deliverySchema = z.object({
  receiver_name: z.string().min(2, "Receiver name is required"),
  receiver_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  origin_block: z.enum(["A Block", "B Block", "C Block", "D Block", "E Block"]),
  destination_block: z.enum(["A Block", "B Block", "C Block", "D Block", "E Block"]),
  robot_id: z.coerce.number().min(1, "Please select an available robot"),
  package_description: z.string().min(2, "Please describe the package"),
  package_weight_kg: z.coerce.number().min(0.1, "Weight must be at least 0.1 kg"),
  priority: z.enum(["normal", "high"]),
  is_preloaded: z.boolean().default(false),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

export default function NewDeliveryPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripMode, setTripMode] = useState<"single" | "multi">("single");
  const [multiStops, setMultiStops] = useState<string[]>(["B Block", "C Block"]);
  const [bookingFor, setBookingFor] = useState<"myself" | "someone_else">("myself");

  // Fetch all fleet robots
  const {
    data: robots = [],
    isLoading: loadingRobots,
  } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch robots");
      return res.json();
    },
    enabled: !!token,
    retry: 1,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      origin_block: "A Block",
      destination_block: "B Block",
      priority: "normal",
      is_preloaded: false,
      receiver_name: user?.full_name || "",
      receiver_phone: user?.phone || "",
    },
  });

  const selectedRobotId = watch("robot_id");
  const originBlock = watch("origin_block");
  const singleDestBlock = watch("destination_block");

  // Auto-fill receiver fields if booking for myself
  useEffect(() => {
    if (bookingFor === "myself" && user) {
      setValue("receiver_name", user.full_name || "Campus User");
      if (user.phone) {
        setValue("receiver_phone", user.phone);
      }
    }
  }, [bookingFor, user, setValue]);

  // Multi-stop handlers
  const handleAddStop = () => {
    const lastStop = multiStops[multiStops.length - 1] || originBlock;
    const availableNext = BLOCKS.find((b) => b !== lastStop) || "B Block";
    setMultiStops([...multiStops, availableNext]);
  };

  const handleUpdateStop = (index: number, val: string) => {
    const updated = [...multiStops];
    updated[index] = val;
    setMultiStops(updated);
  };

  const handleRemoveStop = (index: number) => {
    if (multiStops.length <= 1) return;
    setMultiStops(multiStops.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: DeliveryFormValues) => {
    if (tripMode === "single") {
      if (values.origin_block === values.destination_block) {
        toast.error("Origin and destination blocks cannot be the same!");
        return;
      }
    } else {
      const allChain = [values.origin_block, ...multiStops];
      for (let i = 0; i < allChain.length - 1; i++) {
        if (allChain[i] === allChain[i + 1]) {
          toast.error(`Stop ${i + 1} and Stop ${i + 2} cannot be identical (${allChain[i]})!`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const finalDest = tripMode === "single" ? values.destination_block : multiStops[0];
      const extraStops = tripMode === "multi" && multiStops.length > 1 ? multiStops.slice(1) : undefined;

      const payload = {
        ...values,
        destination_block: finalDest,
        extra_stops: extraStops,
      };

      const res = await fetch("/api/v1/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create delivery");
      }

      const delivery = await res.json();
      toast.success("Delivery mission created successfully!");
      router.push(`/dashboard/delivery/${delivery.id}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-display font-extrabold tracking-tight">Request Delivery</h1>
        <p className="text-body text-brand-gray/50">
          Choose trip mode, vehicle, routing stops, and package info to dispatch an autonomous unit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form (2 cols on desktop) */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-8">
          
          {/* B1: Trip Mode Selector (Single Trip / Multi-Trip) */}
          <div className="glassmorphism rounded-3xl p-6 border border-surface-4 space-y-4">
            <label className="text-caption font-extrabold text-brand-white uppercase tracking-wider block">
              Trip Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Single Trip */}
              <div
                onClick={() => setTripMode("single")}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  tripMode === "single"
                    ? "bg-brand-lime/10 border-brand-lime shadow-glow-lime/20"
                    : "bg-surface-1 border-surface-3 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-brand-lime/20 text-brand-lime">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-white text-body">Single Trip</h4>
                    <span className="text-micro text-brand-gray/60">One Origin ➔ One Destination</span>
                  </div>
                </div>
                <p className="text-caption text-brand-gray/70 mt-2">
                  Robot travels directly from the pickup block to a single recipient building.
                </p>
              </div>

              {/* Multi-Trip */}
              <div
                onClick={() => setTripMode("multi")}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  tripMode === "multi"
                    ? "bg-brand-lime/10 border-brand-lime shadow-glow-lime/20"
                    : "bg-surface-1 border-surface-3 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-brand-cyan/20 text-brand-cyan">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-white text-body">Multi-Trip</h4>
                    <span className="text-micro text-brand-cyan font-semibold">Multi-Stop Route Chain</span>
                  </div>
                </div>
                <p className="text-caption text-brand-gray/70 mt-2">
                  Robot visits a chain of 2+ campus stops sequentially in a single automated run.
                </p>
              </div>
            </div>
          </div>

          {/* B2: Routing Details */}
          <div className="glassmorphism rounded-3xl p-6 border border-surface-4 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-brand-lime" />
              <span>Campus Routing</span>
            </h3>

            {tripMode === "single" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-caption font-semibold text-brand-gray/70">Origin Block</label>
                  <select
                    {...register("origin_block")}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                  >
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-semibold text-brand-gray/70">Destination Block</label>
                  <select
                    {...register("destination_block")}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                  >
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-caption font-semibold text-brand-gray/70">Origin Block</label>
                  <select
                    {...register("origin_block")}
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                  >
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-caption font-semibold text-brand-gray/70 block">
                    Stop Sequence Chain
                  </label>
                  {multiStops.map((stop, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <span className="h-8 w-8 rounded-full bg-surface-2 border border-surface-4 text-brand-lime text-caption font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <select
                        value={stop}
                        onChange={(e) => handleUpdateStop(idx, e.target.value)}
                        className="flex-1 bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-2.5 px-4 text-body text-brand-white transition-colors"
                      >
                        {BLOCKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {multiStops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-2 rounded-xl bg-surface-2 hover:bg-status-error/10 text-brand-gray hover:text-status-error border border-surface-4 transition-colors"
                          aria-label="Remove stop"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="mt-3 flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-lime text-caption font-bold transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another Stop</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B5: Redesigned Robot Selection Cards */}
          <div className="glassmorphism rounded-3xl p-6 border border-surface-4 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Bot className="h-5 w-5 text-brand-lime" />
              <span>Select Robot Vehicle</span>
            </h3>

            {loadingRobots ? (
              <div className="flex items-center space-x-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-lime" />
                <span className="text-caption text-brand-gray/50">Querying live fleet status...</span>
              </div>
            ) : robots.length === 0 ? (
              <div className="p-4 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-caption font-semibold">
                No fleet units currently registered. Please refresh or seed fleet units.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((robot: any) => {
                  const isIdle = robot.status === "idle";
                  const isSelected = selectedRobotId === robot.id;
                  const bat = robot.battery_level ?? 100;
                  const batColor = bat < 20 ? "bg-status-error" : bat < 50 ? "bg-brand-yellow" : "bg-brand-lime";

                  return (
                    <div
                      key={robot.id}
                      onClick={() => {
                        if (isIdle) {
                          setValue("robot_id", robot.id, { shouldValidate: true });
                        } else {
                          toast.info(`${robot.name} is currently ${robot.status.replace("_", " ")} and unavailable for new dispatch.`);
                        }
                      }}
                      className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between space-y-3 ${
                        isIdle ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                      } ${
                        isSelected
                          ? "bg-brand-lime/10 border-brand-lime shadow-glow-lime/20 ring-1 ring-brand-lime/40"
                          : "bg-surface-1 border-surface-3 hover:border-surface-4"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-full border ${isSelected ? "bg-brand-lime/20 border-brand-lime text-brand-lime" : "bg-surface-2 border-surface-4 text-brand-gray"}`}>
                          <Bot className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-brand-white text-caption truncate">{robot.name}</h4>
                          <p className="text-micro text-brand-gray/50 truncate">{robot.model_type || "Standard Runner"}</p>
                        </div>
                      </div>

                      {/* Battery Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-micro">
                          <span className="text-brand-gray/50 flex items-center gap-1">
                            <Battery className="h-3.5 w-3.5" /> Battery
                          </span>
                          <span className="font-mono font-bold text-brand-white">{bat}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
                          <div className={`h-full ${batColor} rounded-full transition-all`} style={{ width: `${bat}%` }} />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className={`text-micro font-bold px-2 py-0.5 rounded capitalize ${
                          isIdle
                            ? "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                            : "bg-surface-2 text-brand-gray/60 border border-surface-4"
                        }`}>
                          {isIdle ? "Available" : robot.status.replace("_", " ")}
                        </span>
                        {isSelected && (
                          <span className="text-micro font-extrabold text-brand-lime">Selected ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.robot_id && (
              <p className="text-micro text-status-error font-semibold">{errors.robot_id.message}</p>
            )}
          </div>

          {/* B3: Booking for Myself / Someone Else */}
          <div className="glassmorphism rounded-3xl p-6 border border-surface-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-4/40 pb-4">
              <h3 className="text-title font-bold flex items-center space-x-2">
                <Package className="h-5 w-5 text-brand-lime" />
                <span>Package & Recipient Details</span>
              </h3>

              {/* Segmented Control */}
              <div className="inline-flex p-1 rounded-xl bg-surface-1 border border-surface-3">
                <button
                  type="button"
                  onClick={() => setBookingFor("myself")}
                  className={`px-3 py-1.5 rounded-lg text-micro font-bold transition-all ${
                    bookingFor === "myself"
                      ? "bg-brand-lime text-brand-black shadow-sm"
                      : "text-brand-gray/60 hover:text-brand-white"
                  }`}
                >
                  Booking For: Myself
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFor("someone_else")}
                  className={`px-3 py-1.5 rounded-lg text-micro font-bold transition-all ${
                    bookingFor === "someone_else"
                      ? "bg-brand-lime text-brand-black shadow-sm"
                      : "text-brand-gray/60 hover:text-brand-white"
                  }`}
                >
                  Someone Else
                </button>
              </div>
            </div>

            {bookingFor === "someone_else" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-caption font-semibold text-brand-gray/70 flex items-center space-x-1.5">
                    <User className="h-4 w-4 text-brand-gray/40" />
                    <span>Receiver Name</span>
                  </label>
                  <input
                    {...register("receiver_name")}
                    type="text"
                    placeholder="Dr. Amit Patel"
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                  />
                  {errors.receiver_name && (
                    <p className="text-micro text-status-error">{errors.receiver_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-semibold text-brand-gray/70 flex items-center space-x-1.5">
                    <Phone className="h-4 w-4 text-brand-gray/40" />
                    <span>Receiver Phone (SMS OTP)</span>
                  </label>
                  <input
                    {...register("receiver_phone")}
                    type="text"
                    placeholder="9876543210"
                    className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                  />
                  {errors.receiver_phone && (
                    <p className="text-micro text-status-error">{errors.receiver_phone.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-1 border border-surface-3 flex items-center justify-between text-caption">
                <div>
                  <p className="font-bold text-brand-white">{user?.full_name || "Campus User"}</p>
                  <p className="text-micro text-brand-gray/50">{user?.phone || "No phone number saved"}</p>
                </div>
                {!user?.phone && (
                  <span className="text-micro text-brand-yellow font-semibold">
                    Add a phone number in Settings to use this
                  </span>
                )}
              </div>
            )}

            {/* Package Description */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70">Package Description</label>
              <textarea
                {...register("package_description")}
                rows={3}
                placeholder="E.g., Lab supplies, project documents, academic records..."
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors resize-none"
              />
              {errors.package_description && (
                <p className="text-micro text-status-error">{errors.package_description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Weight */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-brand-gray/70">Estimated Weight (kg)</label>
                <input
                  {...register("package_weight_kg")}
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                />
                {errors.package_weight_kg && (
                  <p className="text-micro text-status-error">{errors.package_weight_kg.message}</p>
                )}
              </div>

              {/* B4: Priority (Only Normal / High) */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-brand-gray/70">Delivery Priority</label>
                <select
                  {...register("priority")}
                  className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-xl py-3 px-4 text-body text-brand-white transition-colors"
                >
                  <option value="normal">Normal (Default)</option>
                  <option value="high">High (Urgent Dispatch)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loadingRobots || !selectedRobotId}
            className="w-full py-4 rounded-2xl bg-brand-lime text-brand-black font-extrabold text-body hover:shadow-glow-lime hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            <span>Dispatch Active Mission</span>
          </button>
        </form>

        {/* B10: Fleet Status Sidebar */}
        <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-caption font-extrabold uppercase tracking-wider text-brand-white flex items-center space-x-2">
              <Bot className="h-4 w-4 text-brand-lime" />
              <span>Fleet Status</span>
            </h3>
            <Link
              href="/dashboard/robots"
              className="text-micro font-bold text-brand-lime hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-4">
            {robots.map((r: any) => {
              const isIdle = r.status === "idle";
              const bat = r.battery_level ?? 100;
              const batColor = bat < 20 ? "bg-status-error" : bat < 50 ? "bg-brand-yellow" : "bg-brand-lime";

              return (
                <div key={r.id} className="p-3.5 rounded-2xl bg-surface-1 border border-surface-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-white text-caption">{r.name}</span>
                    <span className={`text-micro font-bold px-2 py-0.5 rounded capitalize ${
                      isIdle
                        ? "bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                        : "bg-surface-2 text-brand-gray/60 border border-surface-4"
                    }`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-micro text-brand-gray/50">
                      <span>Battery</span>
                      <span className="font-mono font-bold text-brand-white">{bat}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div className={`h-full ${batColor} rounded-full`} style={{ width: `${bat}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
