"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, loading, error, clearError } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    const success = await login(values.email, values.password);
    setIsSubmitting(false);

    if (success) {
      toast.success("Successfully logged in!");
      router.push("/dashboard");
    } else {
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 bg-grid p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-lime/5 to-transparent blur-3xl rounded-full" />

      <div className="w-full max-w-md glassmorphism rounded-2xl p-8 border border-surface-4 shadow-card z-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <div className="p-3 rounded-2xl bg-brand-lime/10 text-brand-lime">
            <Bot className="h-10 w-10 animate-robot-move" />
          </div>
          <h2 className="text-heading font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-caption text-brand-gray/50">
            Log in to manage robot deliveries
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 flex items-start space-x-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-caption">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-caption font-semibold text-brand-gray/70 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray/30" />
              <input
                {...register("email")}
                type="email"
                placeholder="you@silveroak.edu.in"
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-body text-brand-white transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-micro text-status-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-caption font-semibold text-brand-gray/70 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray/30" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface-1 border border-surface-4 focus:border-brand-lime focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-body text-brand-white transition-colors"
              />
            </div>
            {errors.password && (
              <p className="text-micro text-status-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3 rounded-lg bg-brand-lime text-brand-black font-bold hover:shadow-glow-lime hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {(isSubmitting || loading) && <Loader2 className="h-5 w-5 animate-spin" />}
            <span>Log In</span>
          </button>
        </form>

        <p className="text-caption text-center text-brand-gray/40 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-lime font-semibold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
