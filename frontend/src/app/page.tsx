"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  ArrowRight, 
  Package, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Moon, 
  MapPin, 
  Activity, 
  Navigation,
  CheckCircle2,
  ChevronRight,
  Battery
} from "lucide-react";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import FleetSpotlightCard from "@/components/FleetSpotlightCard";
import LiquidPillTabs from "@/components/LiquidPillTabs";
import DispatchButton from "@/components/DispatchButton";
import OtpOrbitSpinner from "@/components/OtpOrbitSpinner";
import RobotDrivingLoader from "@/components/RobotDrivingLoader";
import RobotInteractiveShowcase from "@/components/RobotInteractiveShowcase";
import ScrollytellingCanvas from "@/components/ScrollytellingCanvas";

// Dynamic import for Leaflet map to prevent SSR window reference error
const DynamicCampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-2xl bg-surface-1 border border-surface-3 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <Bot className="h-8 w-8 text-brand-lime animate-spin" />
        <span className="text-caption font-extrabold text-brand-white/60">Loading Interactive Campus Map...</span>
      </div>
    </div>
  ),
});

export default function LandingPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const { theme, toggleThemeWithTransition } = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Interactive Demo States for concept sections
  const [tripMode, setTripMode] = useState("single");
  const [priority, setPriority] = useState("normal");
  const [selectedRobotIdx, setSelectedRobotIdx] = useState(0);
  const [otpPhase, setOtpPhase] = useState<"input" | "orbiting" | "success" | "error">("input");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Fallback fleet data for interactive landing showcase
  const showcaseRobots = [
    { id: 1, name: "DSR-Alpha 01", model_type: "Heavy Payload Bot · 15kg", status: "idle", battery_level: 95 },
    { id: 2, name: "DSR-Beta 02", model_type: "Express Runner · 10kg", status: "en_route", battery_level: 88 },
    { id: 3, name: "DSR-Gamma 03", model_type: "Express Runner · 10kg", status: "charging", battery_level: 42 },
  ];

  // Leaflet map track points for Section 03
  const mapRobots = [
    { id: 1, name: "DSR-Alpha 01", status: "delivering", battery_level: 91, speed: 1.2, heading: 45, lat: 23.0910, lng: 72.5346 },
  ];

  const handleDemoOtpVerify = () => {
    if (otpPhase !== "input") return;
    setOtpPhase("orbiting");
    setTimeout(() => {
      setOtpPhase("success");
      setTimeout(() => {
        setOtpPhase("input");
      }, 2600);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-x-clip select-none text-brand-white">
      {/* ── Ambient Hero Background Layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-fade" />
      </div>

      {/* ── TOP HEADER / NAV BAR ───────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-0/85 border-b border-surface-4/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Mark with Animated Robot Logo */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-lime/20 border border-brand-lime/40 p-1 flex items-center justify-center shadow-glow-lime group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0">
              <img src="/Robo.webp" alt="DSR Bot Logo" className="w-full h-full object-contain drop-shadow" />
            </div>
            <span className="text-title sm:text-heading font-black tracking-wider text-brand-white">
              DSR <span className="text-brand-lime">Go</span>
            </span>
          </Link>

          {/* Navigation Anchor Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-surface-1/60 p-1.5 rounded-2xl border border-surface-4/40">
            <a href="#dashboard" className="px-4 py-2 rounded-xl text-caption font-extrabold text-brand-white/70 hover:text-brand-white hover:bg-surface-2 transition-all">
              Dashboard
            </a>
            <a href="#request" className="px-4 py-2 rounded-xl text-caption font-extrabold text-brand-white/70 hover:text-brand-white hover:bg-surface-2 transition-all">
              Request
            </a>
            <a href="#tracking" className="px-4 py-2 rounded-xl text-caption font-extrabold text-brand-white/70 hover:text-brand-white hover:bg-surface-2 transition-all">
              Tracking
            </a>
            <a href="#fleet" className="px-4 py-2 rounded-xl text-caption font-extrabold text-brand-white/70 hover:text-brand-white hover:bg-surface-2 transition-all">
              Fleet
            </a>
            <a href="#settings" className="px-4 py-2 rounded-xl text-caption font-extrabold text-brand-white/70 hover:text-brand-white hover:bg-surface-2 transition-all">
              Settings
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <button
              onClick={(e) => {
                const nextTheme = theme === "light" ? "dark" : "light";
                toggleThemeWithTransition(nextTheme, e);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-white transition-all shrink-0 flex items-center justify-center shadow-sm"
              aria-label="Toggle Theme"
              title="Toggle Light/Dark Theme"
            >
              {mounted && theme === "light" ? (
                <Sun className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-amber-600 fill-amber-500/20" />
              ) : (
                <Moon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-brand-lime" />
              )}
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border border-surface-4 text-brand-white font-extrabold hover:bg-surface-2 hover:border-brand-lime/40 transition-all text-xs sm:text-caption whitespace-nowrap shrink-0"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-brand-lime text-[#0A0A0A] font-black hover:shadow-glow-lime hover:scale-[1.02] active:scale-95 transition-all text-xs sm:text-caption whitespace-nowrap shrink-0"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── APPLE-GRADE SCROLLYTELLING 3D DISASSEMBLY HERO CANVAS ── */}
      <ScrollytellingCanvas />

      {/* ── GLOWING LASER DIVIDER & TRANSITION BRIDGE ── */}
      <section className="relative z-20 pt-10 pb-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        
        {/* Futuristic Glowing Divider Line */}
        <div className="relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-lime/60 to-transparent" />
          <div className="absolute px-3.5 py-1 rounded-full bg-surface-1/90 backdrop-blur-xl border border-brand-lime/40 text-[10px] font-mono font-extrabold text-brand-lime flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-lime animate-ping" />
            <span>01 // FLEET ECOSYSTEM</span>
          </div>
        </div>

        {/* Transition Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-micro font-extrabold shadow-sm">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Silver Oak University · Campus Logistics Core</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-white tracking-tight leading-tight">
            Meet the Fleet in Action.
          </h2>
          <p className="text-caption sm:text-body text-brand-white/70 max-w-xl mx-auto font-medium leading-relaxed">
            Select an autonomous unit below to simulate live parcel dispatch, test the electronic payload chamber, or inspect real-time fleet telemetry.
          </p>

          {/* 3 Interactive Capability Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-surface-1/80 border border-surface-4/60 backdrop-blur-md text-left flex items-start gap-3 hover:border-brand-lime/40 transition-colors">
              <div className="p-2 rounded-xl bg-brand-lime/15 text-brand-lime border border-brand-lime/30 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="text-micro font-black text-brand-white block">100% Zero-Emission</span>
                <span className="text-[11px] text-brand-white/60 font-medium block mt-0.5">48V LiFePO4 battery pack with 18-hour continuous runtime.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-1/80 border border-surface-4/60 backdrop-blur-md text-left flex items-start gap-3 hover:border-[#F59E0B]/40 transition-colors">
              <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-micro font-black text-brand-white block">Dynamic OTP Vault</span>
                <span className="text-[11px] text-brand-white/60 font-medium block mt-0.5">Electromagnetic deadbolts unlocked only by recipient passcode.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-1/80 border border-surface-4/60 backdrop-blur-md text-left flex items-start gap-3 hover:border-[#3B82F6]/40 transition-colors">
              <div className="p-2 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 shrink-0">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <span className="text-micro font-black text-brand-white block">Neural SLAM Spatial AI</span>
                <span className="text-[11px] text-brand-white/60 font-medium block mt-0.5">Centimeter-precise real-time path planning across campus.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROBOT REEL SHOWCASE DRAWER ── */}
        <RobotInteractiveShowcase mode="landing" />
      </section>

      {/* ── SECTION 01 · DASHBOARD (SCROLL & HOVER ANIMATED) ────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="dashboard"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 01 · Dashboard
            </span>
            <h2 className="text-display font-black text-brand-white">Everything, one glance.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              Live fleet status, active deliveries, and a spotlight on whichever robot needs your attention — auto-rotating so nothing gets buried.
            </p>
          </div>

          {/* Browser Frame Showcase */}
          <motion.div 
            whileHover={{ borderColor: "rgba(198,255,0,0.3)" }}
            className="rounded-3xl bg-surface-1 border border-surface-4 shadow-card overflow-hidden transition-colors"
          >
            {/* Mac Browser Bar */}
            <div className="h-11 bg-surface-2 border-b border-surface-4 px-4 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-4 text-micro font-mono text-brand-white/40">dsrgo.silveroak.edu/dashboard</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Fleet Spotlight Carousel */}
              <FleetSpotlightCard robots={showcaseRobots} />

              {/* 2-Column Metrics with Hover Animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 rounded-2xl bg-surface-2 border border-surface-4 flex items-center justify-between transition-shadow hover:shadow-glow-lime/20 cursor-default"
                >
                  <div>
                    <span className="text-micro font-bold text-brand-white/60 uppercase">Active Deliveries</span>
                    <p className="text-heading font-black text-brand-white mt-1">3 Active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
                    <Package className="h-6 w-6" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 rounded-2xl bg-surface-2 border border-surface-4 flex items-center justify-between transition-shadow hover:shadow-glow-yellow/20 cursor-default"
                >
                  <div>
                    <span className="text-micro font-bold text-brand-white/60 uppercase">Available Fleet Units</span>
                    <p className="text-heading font-black text-brand-white mt-1">4 / 6 Ready</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow">
                    <Bot className="h-6 w-6" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── SECTION 02 · REQUEST WIZARD ────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="request"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 02 · Request Delivery
            </span>
            <h2 className="text-display font-black text-brand-white">A four-step wizard, not a form.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              Pick a trip mode, set the route, choose a robot by looking at it, then confirm the package — each step animated, nothing buried in one long scroll.
            </p>
          </div>

          <div className="rounded-3xl bg-surface-1 border border-surface-4 shadow-card overflow-hidden">
            <div className="h-11 bg-surface-2 border-b border-surface-4 px-4 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-4 text-micro font-mono text-brand-white/40">dsrgo.silveroak.edu/delivery/new</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Wizard Step Bar */}
              <div className="flex gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-brand-lime animate-pulse" />
                <div className="h-1.5 flex-1 rounded-full bg-brand-lime animate-pulse" />
                <div className="h-1.5 flex-1 rounded-full bg-surface-3" />
                <div className="h-1.5 flex-1 rounded-full bg-surface-3" />
              </div>

              {/* Trip Mode Liquid Pill Selector */}
              <div className="space-y-2">
                <span className="text-micro font-bold uppercase tracking-wider text-brand-white/60">Step 1 — Trip Mode</span>
                <LiquidPillTabs
                  options={[
                    { value: "single", label: "Single Trip (Direct Point-to-Point)" },
                    { value: "multi", label: "Multi-Trip (Campus Waypoint Chain)" },
                  ]}
                  value={tripMode}
                  onChange={setTripMode}
                  className="max-w-md"
                />
              </div>

              {/* Campus Route Chain */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-surface-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-micro font-bold uppercase tracking-wider text-brand-white/50">Origin</span>
                  <p className="text-title font-black text-brand-white">A Block</p>
                </div>
                <ArrowRight className="h-6 w-6 text-brand-lime shrink-0 animate-bounce" />
                <div className="space-y-1 text-right">
                  <span className="text-micro font-bold uppercase tracking-wider text-brand-white/50">Destination</span>
                  <p className="text-title font-black text-brand-white">C Block</p>
                </div>
              </div>

              {/* Robot Selection Cards */}
              <div className="space-y-2">
                <span className="text-micro font-bold uppercase tracking-wider text-brand-white/60">Step 2 — Select Robot Unit</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: "DSR-Alpha 01", type: "Heavy Payload", batt: 95, available: true },
                    { name: "DSR-Beta 02", type: "Express Runner", batt: 88, available: true },
                    { name: "DSR-Gamma 03", type: "Charging", batt: 42, available: false },
                  ].map((r, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={r.available ? { y: -4, scale: 1.02 } : {}}
                      onClick={() => r.available && setSelectedRobotIdx(idx)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        !r.available 
                          ? "opacity-40 cursor-not-allowed border-surface-3 bg-surface-2" 
                          : selectedRobotIdx === idx 
                          ? "bg-brand-lime/10 border-brand-lime shadow-glow-lime cursor-pointer" 
                          : "bg-surface-2 border-surface-4 hover:border-brand-lime/40 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-brand-lime/20 flex items-center justify-center text-brand-lime">
                          <Bot className="h-5 w-5" />
                        </div>
                        <span className={`text-micro font-extrabold px-2 py-0.5 rounded-full ${r.available ? "bg-brand-lime text-brand-black" : "bg-surface-3 text-brand-white/60"}`}>
                          {r.available ? "Ready" : "Charging"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-brand-white text-caption mt-3">{r.name}</h4>
                      <p className="text-micro text-brand-white/60">{r.type}</p>
                      <p className="text-micro font-extrabold text-brand-lime mt-2">{r.batt}% Battery</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Priority Selector */}
              <div className="space-y-2">
                <span className="text-micro font-bold uppercase tracking-wider text-brand-white/60">Delivery Priority</span>
                <LiquidPillTabs
                  options={[
                    { value: "normal", label: "Normal Dispatch" },
                    { value: "high", label: "High Priority (Express)" },
                  ]}
                  value={priority}
                  onChange={setPriority}
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 03 · LIVE TRACKING (REAL LEAFLET MAP) ──────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="tracking"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 03 · Live Tracking
            </span>
            <h2 className="text-display font-black text-brand-white">Watch it move, for real.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              A live map, plain-language status, and one clear action — dispatch, confirmed with a real moving indicator instead of a spinner.
            </p>
          </div>

          <div className="rounded-3xl bg-surface-1 border border-surface-4 shadow-card overflow-hidden">
            <div className="h-11 bg-surface-2 border-b border-surface-4 px-4 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-4 text-micro font-mono text-brand-white/40">dsrgo.silveroak.edu/tracking</span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Real Leaflet Map Container */}
              <div className="lg:col-span-7 h-80 rounded-2xl overflow-hidden border border-surface-4 relative">
                <DynamicCampusMap
                  robotsList={mapRobots}
                  height="100%"
                />
              </div>

              {/* Mission Intel Panel with Dispatch Button */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-2 border border-surface-4 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-4/40 pb-3">
                  <h4 className="text-caption font-extrabold text-brand-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-lime animate-pulse" />
                    <span>Mission Intel</span>
                  </h4>
                  <span className="text-micro font-extrabold px-2.5 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                    Arriving ~2 min
                  </span>
                </div>

                <div className="space-y-2.5 text-caption font-semibold">
                  <div className="flex justify-between py-1 border-b border-surface-4/20">
                    <span className="text-brand-white/50">Route Chain:</span>
                    <span className="text-brand-white font-bold">A Block &rarr; C Block</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-4/20">
                    <span className="text-brand-white/50">Package Content:</span>
                    <span className="text-brand-white font-bold">Lab Hardware (2.4kg)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-4/20">
                    <span className="text-brand-white/50">Battery Remaining:</span>
                    <span className="text-brand-lime font-bold">91%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-brand-white/50">Speed:</span>
                    <span className="text-brand-white font-bold">1.2 m/s</span>
                  </div>
                </div>

                {/* Dispatch Button Demo */}
                <DispatchButton
                  onConfirm={async () => {
                    await new Promise((res) => setTimeout(res, 1200));
                  }}
                  label="Start Mission"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 04 · UNLOCK (OTP ORBIT DEMO) ─────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="otp"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 04 · Unlock
            </span>
            <h2 className="text-display font-black text-brand-white">Verify, then it opens. Never before.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              The compartment only ever opens after a real OTP confirmation at the destination — click below to see the verification moment.
            </p>
          </div>

          <div className="rounded-3xl bg-surface-1 border border-surface-4 shadow-card overflow-hidden max-w-2xl mx-auto">
            <div className="h-11 bg-surface-2 border-b border-surface-4 px-4 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-4 text-micro font-mono text-brand-white/40">dsrgo.silveroak.edu/otp</span>
            </div>

            <div className="p-8 text-center space-y-6">
              <span className="text-micro font-bold uppercase tracking-wider text-brand-white/60">
                Interactive OTP Verification Demo
              </span>

              {/* OTP Orbit Spinner Demo */}
              <OtpOrbitSpinner
                digits={["7", "4", "1", "9"]}
                phase={otpPhase === "input" ? "orbiting" : otpPhase}
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleDemoOtpVerify}
                disabled={otpPhase !== "input"}
                className="px-8 py-3 rounded-full bg-brand-lime text-brand-black font-extrabold hover:shadow-glow-lime transition-all disabled:opacity-50"
              >
                {otpPhase === "input" ? "Verify Code" : otpPhase === "orbiting" ? "Verifying..." : "Verified ✓"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 05 · FLEET & ROBOT TRUCK LOADER ──────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="fleet"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 05 · Fleet
            </span>
            <h2 className="text-display font-black text-brand-white">The whole fleet, at a glance.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              Every unit, its battery, and what it&apos;s doing right now — no controls that don&apos;t map to something real.
            </p>
          </div>

          {/* Fleet Cards Grid with Hover Scale Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-3xl bg-surface-1 border border-surface-4 space-y-4 hover:border-brand-lime/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="text-micro font-extrabold px-3 py-1 rounded-full bg-brand-lime/15 text-brand-lime">
                  Idle
                </span>
              </div>
              <div>
                <h4 className="text-title font-black text-brand-white">DSR-Alpha 01</h4>
                <p className="text-micro text-brand-white/60">Heavy Payload Bot · 15kg</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-micro font-bold text-brand-white">
                  <span>Battery</span>
                  <span className="text-brand-lime">95%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full bg-brand-lime rounded-full w-[95%]" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-3xl bg-surface-1 border border-surface-4 space-y-4 hover:border-brand-yellow/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="text-micro font-extrabold px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-yellow">
                  En Route
                </span>
              </div>
              <div>
                <h4 className="text-title font-black text-brand-white">DSR-Beta 02</h4>
                <p className="text-micro text-brand-white/60">Express Runner · 10kg</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-micro font-bold text-brand-white">
                  <span>Battery</span>
                  <span className="text-brand-yellow">88%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full bg-brand-yellow rounded-full w-[88%]" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-3xl bg-surface-1 border border-surface-4 space-y-4 hover:border-blue-500/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="text-micro font-extrabold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400">
                  Charging
                </span>
              </div>
              <div>
                <h4 className="text-title font-black text-brand-white">DSR-Gamma 03</h4>
                <p className="text-micro text-brand-white/60">Express Runner · 10kg</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-micro font-bold text-brand-white">
                  <span>Battery</span>
                  <span className="text-blue-400">42%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full w-[42%]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Robot Driving Loader Showcase */}
          <div className="pt-4">
            <RobotDrivingLoader
              label="Fleet Telemetry Synchronizing"
              subtext="Silver Oak Autonomous Robot Network Active"
            />
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 06 · SETTINGS & THEME TOGGLE ─────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 px-6 border-t border-surface-4/30" 
        id="settings"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-micro font-extrabold text-brand-lime uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-4 bg-brand-lime rounded-full" /> 06 · Settings & Themes
            </span>
            <h2 className="text-display font-black text-brand-white">Clean minimal themes. Tailored for Delivery.</h2>
            <p className="text-body text-brand-white/60 font-medium">
              Ather delivery robot design system with a minimal foundation and purposeful green accents for robot status, navigation, and security.
            </p>
          </div>

          {/* Theme Swatches with Circle Wipe & Hover Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={(e) => toggleThemeWithTransition("dark", e)}
              className={`p-5 rounded-3xl cursor-pointer border-2 transition-all ${
                mounted && (theme === "dark" || theme === "system" || !theme)
                  ? "bg-surface-1 border-brand-lime shadow-glow-lime"
                  : "bg-surface-2 border-surface-4 hover:border-brand-lime/40"
              }`}
            >
              <div className="h-16 rounded-2xl bg-[#0B0B0A] p-3.5 flex items-center space-x-3 mb-3.5 border border-[#282A28]">
                <div className="w-7 h-7 rounded-lg bg-[#39B54A] flex items-center justify-center text-white text-xs font-bold">✓</div>
                <span className="text-caption font-bold text-white">Ather Dark (Default)</span>
              </div>
              <h4 className="text-title font-extrabold text-brand-white">Ather Dark</h4>
              <p className="text-micro text-brand-white/60">Primary Black (#0B0B0A) · Green (#39B54A)</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={(e) => toggleThemeWithTransition("light", e)}
              className={`p-5 rounded-3xl cursor-pointer border-2 transition-all ${
                mounted && (theme === "light" || theme === "ather")
                  ? "bg-surface-1 border-brand-lime shadow-glow-lime"
                  : "bg-surface-2 border-surface-4 hover:border-brand-lime/40"
              }`}
            >
              <div className="h-16 rounded-2xl bg-[#F3F4F2] p-3.5 flex items-center space-x-3 mb-3.5 border border-[#D9DAD8]">
                <div className="w-7 h-7 rounded-lg bg-[#39B54A]" />
                <span className="text-caption font-bold text-[#0B0B0A]">Ather Light</span>
              </div>
              <h4 className="text-title font-extrabold text-brand-white">Ather Light</h4>
              <p className="text-micro text-brand-white/60">App BG (#F3F4F2) · Highlight (#E8F3EA)</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={(e) => toggleThemeWithTransition("mixed", e)}
              className={`p-5 rounded-3xl cursor-pointer border-2 transition-all ${
                mounted && theme === "mixed"
                  ? "bg-surface-1 border-brand-lime shadow-glow-lime"
                  : "bg-surface-2 border-surface-4 hover:border-brand-lime/40"
              }`}
            >
              <div className="h-16 rounded-2xl bg-gradient-to-r from-[#0B0B0A] via-[#0B0B0A] to-[#E8F3EA] p-3.5 flex items-center space-x-3 mb-3.5 border border-[#282A28]">
                <div className="w-7 h-7 rounded-lg bg-[#39B54A]" />
                <span className="text-caption font-bold text-white">Mixed Duo</span>
              </div>
              <h4 className="text-title font-extrabold text-brand-white">Mixed Duo</h4>
              <p className="text-micro text-brand-white/60">Dark Frame (#0B0B0A) · Light Workspace</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={(e) => toggleThemeWithTransition("cyber", e)}
              className={`p-5 rounded-3xl cursor-pointer border-2 transition-all ${
                mounted && theme === "cyber"
                  ? "bg-surface-1 border-[#C6FF00] shadow-[0_0_20px_rgba(198,255,0,0.3)]"
                  : "bg-surface-2 border-surface-4 hover:border-[#C6FF00]/40"
              }`}
            >
              <div className="h-16 rounded-2xl bg-[#0A0A0A] p-3.5 flex items-center space-x-3 mb-3.5 border border-[#2B2B2B]">
                <div className="w-7 h-7 rounded-lg bg-[#C6FF00]" />
                <span className="text-caption font-bold text-[#F5F5F3]">Cyberpunk</span>
              </div>
              <h4 className="text-title font-extrabold text-brand-white">Cyber Neon</h4>
              <p className="text-micro text-brand-white/60">Deep Black (#0A0A0A) · Lime (#C6FF00)</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-surface-4/40 text-center text-caption font-medium text-brand-white/50">
        <div className="max-w-6xl mx-auto space-y-2">
          <p>DSR Go — Silver Oak University Autonomous Campus Delivery System.</p>
          <p className="text-micro text-brand-white/40">Built with Next.js 15, React 19, Leaflet &amp; Framer Motion.</p>
        </div>
      </footer>
    </div>
  );
}
