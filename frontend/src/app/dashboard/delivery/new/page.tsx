"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, MapPin, Package, User, Phone, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const deliverySchema = z.object({
  receiver_name: z.string().min(2, "Receiver name is required"),
  receiver_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  origin_block: z.enum(["A Block", "B Block", "C Block", "D Block", "E Block"]),
  destination_block: z.enum(["A Block", "B Block", "C Block", "D Block", "E Block"]),
  robot_id: z.coerce.number().min(1, "Please select an available robot"),
  package_description: z.string().min(2, "Please describe the package"),
  package_weight_kg: z.coerce.number().min(0.1, "Weight must be at least 0.1 kg"),
  priority: z.enum(["low", "normal", "high"]),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

export default function NewDeliveryPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available robots
  const { data: robots = [], isLoading: loadingRobots } = useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const res = await fetch("/api/v1/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch robots");
      return res.json();
    },
    enabled: !!token,
  });

  const availableRobots = robots.filter(
    (r: any) => r.status === "idle" || r.status === "charging"
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      origin_block: "A Block",
      destination_block: "B Block",
      priority: "normal",
    },
  });

  const originBlock = watch("origin_block");
  const destinationBlock = watch("destination_block");

  const onSubmit = async (values: DeliveryFormValues) => {
    if (values.origin_block === values.destination_block) {
      toast.error("Origin and destination blocks cannot be the same!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create delivery");
      }

      const delivery = await res.json();
      toast.success("Delivery created successfully!");
      router.push(`/dashboard/delivery/${delivery.id}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-display font-extrabold tracking-tight">Request Delivery</h1>
        <p className="text-body text-brand-gray/50">
          Select origin, destination, and package details to dispatch a delivery robot.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Route Details */}
        <div className="glassmorphism rounded-2xl p-6 border border-surface-4 space-y-6">
          <h3 className="text-title font-bold flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-brand-lime" />
            <span>Campus Routing</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70">Origin Block</label>
              <select
                {...register("origin_block")}
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              >
                <option value="A Block">A Block (Main Administration)</option>
                <option value="B Block">B Block (Science & Tech)</option>
                <option value="C Block">C Block (Engineering & Lab)</option>
                <option value="D Block">D Block (Computer Applications)</option>
                <option value="E Block">E Block (Management & Humanities)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70">Destination Block</label>
              <select
                {...register("destination_block")}
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              >
                <option value="A Block">A Block (Main Administration)</option>
                <option value="B Block">B Block (Science & Tech)</option>
                <option value="C Block">C Block (Engineering & Lab)</option>
                <option value="D Block">D Block (Computer Applications)</option>
                <option value="E Block">E Block (Management & Humanities)</option>
              </select>
            </div>
          </div>
          
          {originBlock === destinationBlock && (
            <div className="flex items-center space-x-2 text-micro text-status-error bg-status-error/10 border border-status-error/20 p-3 rounded-lg">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>Origin and destination blocks must be different.</span>
            </div>
          )}
        </div>

        {/* Robot Select */}
        <div className="glassmorphism rounded-2xl p-6 border border-surface-4 space-y-6">
          <h3 className="text-title font-bold flex items-center space-x-2">
            <Bot className="h-5 w-5 text-brand-lime" />
            <span>Select Robot Vehicle</span>
          </h3>

          {loadingRobots ? (
            <div className="flex items-center space-x-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-brand-lime" />
              <span className="text-caption text-brand-gray/50">Querying live fleet status...</span>
            </div>
          ) : availableRobots.length === 0 ? (
            <div className="flex items-start space-x-2 text-caption text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-bold">No available robots.</span>
                <p className="text-micro mt-1 text-brand-gray/70">
                  All fleet units are currently deployed or charging with low battery (minimum 20% required for dispatch). Please wait for a robot to complete its run.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-caption font-semibold text-brand-gray/70">Available Units</label>
              <select
                {...register("robot_id")}
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              >
                <option value="">-- Choose a Robot --</option>
                {availableRobots.map((robot: any) => (
                  <option key={robot.id} value={robot.id}>
                    {robot.name} ({robot.status} - {robot.battery_level}% Battery)
                  </option>
                ))}
              </select>
              {errors.robot_id && (
                <p className="text-micro text-status-error">{errors.robot_id.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Package & Receiver details */}
        <div className="glassmorphism rounded-2xl p-6 border border-surface-4 space-y-6">
          <h3 className="text-title font-bold flex items-center space-x-2">
            <Package className="h-5 w-5 text-brand-lime" />
            <span>Package & Destination Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receiver Name */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70 flex items-center space-x-1.5">
                <User className="h-4 w-4 text-brand-gray/40" />
                <span>Receiver Name</span>
              </label>
              <input
                {...register("receiver_name")}
                type="text"
                placeholder="Dr. Amit Patel"
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              />
              {errors.receiver_name && (
                <p className="text-micro text-status-error">{errors.receiver_name.message}</p>
              )}
            </div>

            {/* Receiver Phone */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70 flex items-center space-x-1.5">
                <Phone className="h-4 w-4 text-brand-gray/40" />
                <span>Receiver Phone (SMS OTP)</span>
              </label>
              <input
                {...register("receiver_phone")}
                type="text"
                placeholder="9876543210"
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              />
              {errors.receiver_phone && (
                <p className="text-micro text-status-error">{errors.receiver_phone.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-caption font-semibold text-brand-gray/70">Package Description</label>
            <textarea
              {...register("package_description")}
              rows={3}
              placeholder="E.g., Lab supplies, project documents, academic records..."
              className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors resize-none"
            />
            {errors.package_description && (
              <p className="text-micro text-status-error">{errors.package_description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70">Estimated Weight (kg)</label>
              <input
                {...register("package_weight_kg")}
                type="number"
                step="0.1"
                placeholder="1.5"
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              />
              {errors.package_weight_kg && (
                <p className="text-micro text-status-error">{errors.package_weight_kg.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-brand-gray/70">Delivery Priority</label>
              <select
                {...register("priority")}
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 px-4 text-body text-brand-white transition-colors"
              >
                <option value="low">Low (Standard)</option>
                <option value="normal">Normal (Default)</option>
                <option value="high">High (Urgent Dispatch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dispatch Action */}
        <button
          type="submit"
          disabled={isSubmitting || loadingRobots || availableRobots.length === 0}
          className="w-full py-4 rounded-xl bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:shadow-none"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          <span>Dispatch Active Mission</span>
        </button>
      </form>
    </div>
  );
}
