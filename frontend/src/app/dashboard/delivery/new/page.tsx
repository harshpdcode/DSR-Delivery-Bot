"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiquidPillTabs from "@/components/LiquidPillTabs";
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
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Weight,
  Clock
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
  const searchParams = useSearchParams();
  const preselectedDest = searchParams.get("dest") || "B Block";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripMode, setTripMode] = useState<"single" | "multi">("single");
  const [multiStops, setMultiStops] = useState<string[]>(["B Block", "C Block"]);
  const [bookingFor, setBookingFor] = useState<"myself" | "someone_else">("myself");
  const [deliveryPriority, setDeliveryPriority] = useState<"normal" | "high">("normal");

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

  // Fallback demo robots if database fetch is loading or empty
  const defaultFallbackRobots = [
    { id: 1, name: "DSR-Alpha 01", serial_number: "DSR-SN-001", status: "idle", battery_level: 95, payload_capacity_kg: 15, model_type: "Heavy Payload Bot" },
    { id: 2, name: "DSR-Beta 02", serial_number: "DSR-SN-002", status: "idle", battery_level: 88, payload_capacity_kg: 10, model_type: "Express Runner" },
    { id: 3, name: "DSR-Gamma 03", serial_number: "DSR-SN-003", status: "idle", battery_level: 75, payload_capacity_kg: 12, model_type: "Standard Bot" },
  ];

  const fetchedAvailable = robots.filter((r: any) => r.status === "idle" || r.status === "charging" || r.status === "standby");
  const availableRobots = fetchedAvailable.length > 0 
    ? fetchedAvailable 
    : (robots.length > 0 ? robots : defaultFallbackRobots);

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
      destination_block: (BLOCKS.includes(preselectedDest) ? preselectedDest : "B Block") as any,
      priority: "normal",
      is_preloaded: false,
      receiver_name: user?.full_name || "",
      receiver_phone: user?.phone || "",
    },
  });

  const selectedRobotId = watch("robot_id");
  const originBlock = watch("origin_block");
  const destinationBlock = watch("destination_block");
  const selectedRobot = robots.find((r: any) => r.id === selectedRobotId);

  // Auto-fill selected robot if none selected
  useEffect(() => {
    if (!selectedRobotId && availableRobots.length > 0) {
      setValue("robot_id", availableRobots[0].id, { shouldValidate: true });
    }
  }, [availableRobots, selectedRobotId, setValue]);

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

  const nextStep = () => {
    if (step === 2) {
      if (tripMode === "single" && originBlock === destinationBlock) {
        toast.error("Origin and Destination blocks cannot be identical!");
        return;
      }
    }
    if (step === 3 && !selectedRobotId) {
      toast.error("Please select an available robot to proceed.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4) as any);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as any);
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
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* ── Wizard Progress Bar Header ───────────────────────────────── */}
      <div className="ather-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="p-2 rounded-2xl bg-[#F6F6F4] text-[#0F172A] hover:bg-[#FFE234] transition-colors flex items-center space-x-1 text-caption font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="p-2 rounded-2xl bg-[#FFE234] text-[#0F172A]">
                <Navigation className="h-5 w-5" />
              </div>
            )}

            <div>
              <span className="text-micro font-bold uppercase tracking-wider text-[#64748B]">
                Step {step} of 4
              </span>
              <h2 className="text-title font-black text-[#0F172A]">
                {step === 1 && "Select Trip Mode"}
                {step === 2 && "Configure Campus Routing"}
                {step === 3 && "Select Robot Unit"}
                {step === 4 && "Package & Recipient Details"}
              </h2>
            </div>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-[#F6F6F4] text-[#0F172A] text-caption font-extrabold">
            {step === 1 && "Mode"}
            {step === 2 && "Routing"}
            {step === 3 && "Fleet"}
            {step === 4 && "Review & Dispatch"}
          </span>
        </div>

        {/* Step Progress Dots/Line */}
        <div className="flex items-center space-x-2 pt-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-[#84E000]" : "bg-[#E4E4E0]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Form Container ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: TRIP MODE SELECTION ────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="ather-card p-6 space-y-6"
            >
              <div>
                <h3 className="text-title font-extrabold text-[#0F172A]">Choose Delivery Trip Mode</h3>
                <p className="text-caption text-[#64748B]">
                  Select whether the robot delivers directly to one destination or executes a multi-stop campus chain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Single Trip Card */}
                <div
                  onClick={() => {
                    setTripMode("single");
                    setStep(2);
                  }}
                  className={`ather-card ather-card-hover p-6 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-4 ${
                    tripMode === "single"
                      ? "bg-[#F6F6F4] border-[#84E000]"
                      : "bg-white border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-[#FFE234] text-[#0F172A]">
                      <Navigation className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0F172A] text-body">Single Trip</h4>
                      <span className="text-micro font-bold text-[#64748B]">Direct Point-to-Point</span>
                    </div>
                  </div>
                  <p className="text-caption text-[#64748B]">
                    Robot travels directly from origin block to one target building for immediate retrieval.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <span className="px-3 py-1 rounded-xl bg-[#0F172A] text-white text-micro font-bold flex items-center space-x-1">
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#84E000]" />
                    </span>
                  </div>
                </div>

                {/* Multi-Trip Card */}
                <div
                  onClick={() => {
                    setTripMode("multi");
                    setStep(2);
                  }}
                  className={`ather-card ather-card-hover p-6 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-4 ${
                    tripMode === "multi"
                      ? "bg-[#F6F6F4] border-[#84E000]"
                      : "bg-white border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-[#9CFF7A] text-[#0F172A]">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0F172A] text-body">Multi-Trip Chain</h4>
                      <span className="text-micro font-bold text-[#64748B]">Sequential Multi-Stop</span>
                    </div>
                  </div>
                  <p className="text-caption text-[#64748B]">
                    Robot visits a sequence of 2+ campus blocks sequentially in a single automated dispatch run.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <span className="px-3 py-1 rounded-xl bg-[#0F172A] text-white text-micro font-bold flex items-center space-x-1">
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#84E000]" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: CAMPUS ROUTING ─────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="ather-card p-6 space-y-6"
            >
              <div>
                <h3 className="text-title font-extrabold text-[#0F172A] flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-[#84E000]" />
                  <span>Campus Block Routing</span>
                </h3>
                <p className="text-caption text-[#64748B]">
                  Select origin pickup location and destination building(s) on Silver Oak campus.
                </p>
              </div>

              {tripMode === "single" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Origin Pickup Block</label>
                    <select
                      {...register("origin_block")}
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3.5 px-4 text-body font-bold text-[#0F172A] transition-colors"
                    >
                      {BLOCKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Destination Arrival Block</label>
                    <select
                      {...register("destination_block")}
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3.5 px-4 text-body font-bold text-[#0F172A] transition-colors"
                    >
                      {BLOCKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Block Pills */}
                  <div className="pt-2 space-y-2">
                    <span className="text-micro font-bold text-[#64748B] uppercase tracking-wider">Quick Select Destination</span>
                    <div className="flex flex-wrap gap-2">
                      {BLOCKS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setValue("destination_block", b as any)}
                          className={`px-3 py-1.5 rounded-xl text-micro font-bold transition-all ${
                            destinationBlock === b
                              ? "bg-[#FFE234] text-[#0F172A]"
                              : "bg-[#F6F6F4] text-[#64748B] hover:text-[#0F172A]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Origin Pickup Block</label>
                    <select
                      {...register("origin_block")}
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3.5 px-4 text-body font-bold text-[#0F172A] transition-colors"
                    >
                      {BLOCKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-caption font-bold text-[#0F172A] block">
                      Multi-Stop Sequence Chain
                    </label>
                    {multiStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="h-9 w-9 rounded-full bg-[#0F172A] text-white text-caption font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <select
                          value={stop}
                          onChange={(e) => handleUpdateStop(idx, e.target.value)}
                          className="flex-1 bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3 px-4 text-body font-bold text-[#0F172A]"
                        >
                          {BLOCKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        {multiStops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(idx)}
                            className="p-3 rounded-2xl bg-[#F6F6F4] text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="mt-3 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#F6F6F4] hover:bg-[#FFE234] text-[#0F172A] text-caption font-extrabold transition-all"
                    >
                      <Plus className="h-4 w-4 text-[#84E000]" />
                      <span>Add Next Stop</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-4 rounded-2xl bg-[#0F172A] text-white font-extrabold text-body hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Continue to Select Robot</span>
                <ArrowRight className="h-5 w-5 text-[#84E000]" />
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: SELECT ROBOT VEHICLE ────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="ather-card p-6 space-y-6"
            >
              <div>
                <h3 className="text-title font-extrabold text-[#0F172A] flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-[#84E000]" />
                  <span>Select Autonomous Unit</span>
                </h3>
                <p className="text-caption text-[#64748B]">
                  Select from active fleet units featuring high battery levels and live telemetry status.
                </p>
              </div>

              {loadingRobots ? (
                <div className="flex items-center space-x-2 py-8 text-[#64748B]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#84E000]" />
                  <span className="text-caption font-bold">Querying live fleet status...</span>
                </div>
              ) : robots.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FFE234]/20 text-[#0F172A] text-caption font-bold">
                  No fleet units registered. Please seed units in fleet management.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {robots.map((robot: any) => {
                    const isIdle = robot.status === "idle";
                    const isSelected = selectedRobotId === robot.id;
                    const bat = robot.battery_level ?? 100;

                    return (
                      <div
                        key={robot.id}
                        onClick={() => {
                          if (isIdle) {
                            setValue("robot_id", robot.id, { shouldValidate: true });
                          } else {
                            toast.info(`${robot.name} is currently ${robot.status.replace(/_/g, " ")}.`);
                          }
                        }}
                        className={`ather-card ather-card-hover p-5 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-4 ${
                          isIdle ? "" : "opacity-50 cursor-not-allowed"
                        } ${
                          isSelected
                            ? "bg-[#F6F6F4] border-[#84E000]"
                            : "bg-white border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Robo.webp Avatar */}
                            <div className="w-12 h-12 rounded-2xl bg-[#FFE234] flex items-center justify-center p-1 shadow-xs shrink-0">
                              <img src="/Robo.webp" alt="Robo" className="w-10 h-10 object-contain" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-[#0F172A] text-body">{robot.name}</h4>
                              <p className="text-micro font-bold text-[#64748B]">{robot.model_type || "Standard Runner"}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#84E000] text-[#0F172A] text-micro font-black">
                              Selected ✓
                            </span>
                          )}
                        </div>

                        {/* Battery Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-micro font-bold text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Battery className="h-3.5 w-3.5 text-[#84E000]" /> Battery
                            </span>
                            <span className="text-[#0F172A]">{bat}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#E4E4E0] overflow-hidden">
                            <div className="h-full bg-[#84E000] rounded-full" style={{ width: `${bat}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={!selectedRobotId}
                className="w-full py-4 rounded-2xl bg-[#0F172A] text-white font-extrabold text-body hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <span>Continue to Package Details</span>
                <ArrowRight className="h-5 w-5 text-[#84E000]" />
              </button>
            </motion.div>
          )}

          {/* ── STEP 4: PACKAGE & RECIPIENT DETAILS + SUMMARY ──────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="ather-card p-6 space-y-6"
            >
              <div>
                <h3 className="text-title font-extrabold text-[#0F172A] flex items-center space-x-2">
                  <Package className="h-5 w-5 text-[#84E000]" />
                  <span>Package &amp; Recipient Details</span>
                </h3>
                <p className="text-caption text-[#64748B]">
                  Provide parcel info and review mission summary before dispatching.
                </p>
              </div>

              {/* Booking For Toggle — LiquidPillTabs */}
              <div className="space-y-1.5">
                <label className="text-micro font-bold uppercase tracking-wider text-[#64748B]">Booking For</label>
                <LiquidPillTabs
                  options={[
                    { value: "myself", label: "Myself" },
                    { value: "someone_else", label: "Someone Else" },
                  ]}
                  value={bookingFor}
                  onChange={(v) => setBookingFor(v as "myself" | "someone_else")}
                />
              </div>

              {bookingFor === "someone_else" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Receiver Name</label>
                    <input
                      {...register("receiver_name")}
                      type="text"
                      placeholder="Dr. Amit Patel"
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3 px-4 text-body font-bold text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Receiver Phone (SMS OTP)</label>
                    <input
                      {...register("receiver_phone")}
                      type="text"
                      placeholder="9876543210"
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3 px-4 text-body font-bold text-[#0F172A]"
                    />
                  </div>
                </div>
              )}

              {/* Package Details Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-caption font-bold text-[#0F172A]">Package Description</label>
                  <textarea
                    {...register("package_description")}
                    rows={2}
                    placeholder="E.g., Lab supplies, academic records, hardware tools..."
                    className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3 px-4 text-body font-bold text-[#0F172A] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Estimated Weight (kg)</label>
                    <input
                      {...register("package_weight_kg")}
                      type="number"
                      step="0.1"
                      placeholder="1.5"
                      className="w-full bg-[#F6F6F4] border border-[#E4E4E0] focus:border-[#84E000] outline-none rounded-2xl py-3 px-4 text-body font-bold text-[#0F172A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-bold text-[#0F172A]">Delivery Priority</label>
                    <LiquidPillTabs
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "high", label: "High Priority" },
                      ]}
                      value={deliveryPriority}
                      onChange={(v) => {
                        setDeliveryPriority(v as "normal" | "high");
                        setValue("priority", v as "normal" | "high");
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mission Summary Review Box */}
              <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-[#E4E4E0] space-y-3">
                <h4 className="text-caption font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#84E000]" />
                  <span>Mission Summary Review</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-caption">
                  <div>
                    <span className="text-[#64748B] block text-micro">Routing</span>
                    <span className="font-bold text-[#0F172A]">{originBlock} ➔ {destinationBlock}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-micro">Selected Unit</span>
                    <span className="font-bold text-[#0F172A]">{selectedRobot?.name || "Auto Unit"}</span>
                  </div>
                </div>
              </div>

              {/* Submit Dispatch Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#84E000] text-[#0F172A] font-black text-body hover:bg-[#9CFF7A] transition-all flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                <span>Dispatch Active Mission</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </form>

    </div>
  );
}
