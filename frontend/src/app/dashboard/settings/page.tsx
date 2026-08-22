"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  User as UserIcon,
  Shield,
  Bell,
  Code,
  Volume2,
  Phone,
  Mail,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Sparkles,
  ChevronRight,
  Zap,
  Globe,
  Sun,
  Moon,
  Palette,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { useThemeTransition } from "@/hooks/useThemeTransition";

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const { theme, toggleThemeWithTransition } = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminOrOperator = user?.role === "admin" || user?.role === "operator";
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "developer">("profile");

  // Local storage state keys for preferences
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [hidePwaPrompt, setHidePwaPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundAlerts(localStorage.getItem("pref_sound_alerts") !== "false");
      setAutoRefresh(localStorage.getItem("pref_auto_refresh") !== "false");
      setPriorityDelivery(localStorage.getItem("pref_priority_del") === "true");
      setEmailAlerts(localStorage.getItem("pref_email_alerts") !== "false");
      setHidePwaPrompt(localStorage.getItem("pref_hide_pwa_prompt") === "true");
    }
  }, []);

  const handleToggle = (key: string, currentValue: boolean, setter: (val: boolean) => void) => {
    const nextVal = !currentValue;
    setter(nextVal);
    localStorage.setItem(key, String(nextVal));
    toast.success("Preference saved successfully!");
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("API Bearer Token copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetAppCache = () => {
    localStorage.clear();
    toast.success("App cache cleared successfully! Reloading...");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile preferences saved locally!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header & Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="text-display font-extrabold tracking-tight text-brand-white">Account &amp; Settings</h1>
          <p className="text-body text-brand-gray/60 font-medium">
            Manage profile details, system notifications, security, and developer options.
          </p>
        </div>

        {/* Segmented Tab Pills */}
        <div className="flex bg-surface-2 p-1.5 rounded-2xl max-w-md border border-surface-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "profile"
                ? "bg-brand-lime text-black font-extrabold shadow-sm"
                : "text-brand-gray/80 hover:text-brand-white hover:bg-surface-3/40"
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "preferences"
                ? "bg-brand-lime text-black font-extrabold shadow-sm"
                : "text-brand-gray/80 hover:text-brand-white hover:bg-surface-3/40"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Preferences</span>
          </button>
          {isAdminOrOperator && (
            <button
              onClick={() => setActiveTab("developer")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "developer"
                  ? "bg-brand-lime text-black font-extrabold shadow-sm"
                  : "text-brand-gray/80 hover:text-brand-white hover:bg-surface-3/40"
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Developer</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Profile Details Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="glassmorphism rounded-2xl border border-surface-4 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-surface-3 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center text-brand-black font-extrabold text-lg">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-title font-bold text-brand-white">{user?.full_name || "Campus User"}</h3>
                  <p className="text-micro font-medium text-brand-gray/60 capitalize">{user?.role} Account</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-lime text-brand-black text-micro font-extrabold uppercase">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-caption">
              <div className="space-y-1.5">
                <label className="font-bold text-brand-white flex items-center space-x-1.5">
                  <UserIcon className="h-4 w-4 text-brand-lime" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  defaultValue={user?.full_name || ""}
                  className="w-full bg-surface-2 border border-surface-3 focus:border-brand-lime outline-none rounded-xl p-3 text-brand-white font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-brand-white flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-brand-lime" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full bg-surface-3/50 border border-surface-3 outline-none rounded-xl p-3 text-brand-gray/50 cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-brand-white flex items-center space-x-1.5">
                  <Phone className="h-4 w-4 text-brand-lime" />
                  <span>Phone Number (SMS OTP)</span>
                </label>
                <input
                  type="tel"
                  defaultValue={user?.phone || "+1234567890"}
                  className="w-full bg-surface-2 border border-surface-3 focus:border-brand-lime outline-none rounded-xl p-3 text-brand-white font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-brand-white flex items-center space-x-1.5">
                  <Shield className="h-4 w-4 text-brand-lime" />
                  <span>Account Role</span>
                </label>
                <input
                  type="text"
                  defaultValue={user?.role?.toUpperCase() || "USER"}
                  disabled
                  className="w-full bg-surface-3/50 border border-surface-3 outline-none rounded-xl p-3 text-brand-gray/50 font-bold uppercase cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-lime text-brand-black font-bold text-caption hover:shadow-glow-lime transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* System Info */}
          <div className="glassmorphism rounded-2xl border border-surface-4 p-6 space-y-4">
            <h3 className="text-title font-bold text-brand-white flex items-center space-x-2">
              <Zap className="h-5 w-5 text-brand-lime" />
              <span>Fleet OS Platform Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
              <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3 flex items-center justify-between">
                <div>
                  <p className="text-micro font-medium text-brand-white/60">Framework Version</p>
                  <p className="font-bold text-brand-white mt-0.5">Next.js 15.5 App Router</p>
                </div>
                <span className="text-micro font-bold text-brand-lime">v15.5</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3 flex items-center justify-between">
                <div>
                  <p className="text-micro font-medium text-brand-white/60">Backend Engine</p>
                  <p className="font-bold text-brand-white mt-0.5">FastAPI &amp; Uvicorn</p>
                </div>
                <span className="text-micro font-bold text-brand-lime">Python 3.11</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">

          {/* Theme Selector Section */}
          <div className="space-y-2">
            <h3 className="text-caption font-bold uppercase tracking-wider text-brand-gray/60 px-1">
              Interface Theme Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ather Dark Theme (Default) */}
              <div
                onClick={(e) => {
                  toggleThemeWithTransition("dark", e);
                  toast.success("Switched to Ather Dark Theme 🌙");
                }}
                className={`glassmorphism rounded-2xl p-4 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-3 ${
                  mounted && (theme === "dark" || theme === "system" || !theme)
                    ? "bg-surface-1 border-brand-lime text-brand-white shadow-[0_0_15px_rgba(57,181,74,0.25)]"
                    : "bg-surface-2 border-surface-3 text-brand-gray/60 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#0B0B0A] text-[#39B54A] border border-[#282A28]">
                    <Moon className="h-5 w-5" />
                  </div>
                  {mounted && (theme === "dark" || theme === "system" || !theme) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A] text-white text-[10px] font-extrabold">
                      Default
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-caption text-brand-white">Ather Dark (Default)</h4>
                  <p className="text-micro text-brand-white/60">Primary Black (#0B0B0A) · Green (#39B54A)</p>
                </div>
              </div>

              {/* Ather Light Clean Theme */}
              <div
                onClick={(e) => {
                  toggleThemeWithTransition("light", e);
                  toast.success("Switched to Ather Clean Light Theme ☀️");
                }}
                className={`glassmorphism rounded-2xl p-4 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-3 ${
                  mounted && (theme === "light" || theme === "ather")
                    ? "bg-surface-1 border-brand-lime text-brand-white shadow-[0_0_15px_rgba(57,181,74,0.25)]"
                    : "bg-surface-2 border-surface-3 text-brand-gray/60 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#E8F3EA] text-[#39B54A] border border-[#D9DAD8]">
                    <Sun className="h-5 w-5" />
                  </div>
                  {mounted && (theme === "light" || theme === "ather") && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A] text-white text-[10px] font-extrabold">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-caption text-brand-white">Ather Light</h4>
                  <p className="text-micro text-brand-white/60">App BG (#F3F4F2) · Highlight (#E8F3EA)</p>
                </div>
              </div>

              {/* Mixed Duo Two-Tone Theme */}
              <div
                onClick={(e) => {
                  toggleThemeWithTransition("mixed", e);
                  toast.success("Switched to Mixed Duo Two-Tone Theme 🌓");
                }}
                className={`glassmorphism rounded-2xl p-4 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-3 ${
                  mounted && theme === "mixed"
                    ? "bg-surface-1 border-brand-lime text-brand-white shadow-[0_0_15px_rgba(57,181,74,0.25)]"
                    : "bg-surface-2 border-surface-3 text-brand-gray/60 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-r from-[#0B0B0A] via-[#0B0B0A] to-[#E8F3EA] border border-[#282A28] flex items-center justify-center overflow-hidden">
                    <Sparkles className="h-5 w-5 text-[#39B54A]" />
                  </div>
                  {mounted && theme === "mixed" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A] text-white text-[10px] font-extrabold">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-caption text-brand-white">Mixed Duo (Two-Tone)</h4>
                  <p className="text-micro text-brand-white/60">Dark Frame (#0B0B0A) · Light Workspace</p>
                </div>
              </div>

              {/* Cyberpunk Neon Theme */}
              <div
                onClick={(e) => {
                  toggleThemeWithTransition("cyber", e);
                  toast.success("Switched to Cyberpunk Neon Theme ⚡");
                }}
                className={`glassmorphism rounded-2xl p-4 cursor-pointer border-2 transition-all flex flex-col justify-between space-y-3 ${
                  mounted && theme === "cyber"
                    ? "bg-surface-1 border-[#C6FF00] text-brand-white shadow-[0_0_15px_rgba(198,255,0,0.25)]"
                    : "bg-surface-2 border-surface-3 text-brand-gray/60 hover:border-surface-4"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#0A0A0A] text-[#C6FF00] border border-[#2B2B2B]">
                    <Zap className="h-5 w-5" />
                  </div>
                  {mounted && theme === "cyber" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C6FF00] text-black text-[10px] font-extrabold">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-caption text-brand-white">Cyberpunk Neon</h4>
                  <p className="text-micro text-brand-white/60">Dark (#0A0A0A) · Neon Lime (#C6FF00)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-caption font-bold uppercase tracking-wider text-brand-gray/60 px-1">
              Notification &amp; Dispatch Preferences
            </h3>

            <div className="glassmorphism rounded-2xl border border-surface-4 overflow-hidden divide-y divide-surface-3">
              <div 
                onClick={() => handleToggle("pref_sound_alerts", soundAlerts, setSoundAlerts)}
                className="p-4 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-brand-lime" />
                  <div>
                    <p className="font-bold text-brand-white text-caption">Sound Audio Alerts</p>
                    <p className="text-micro text-brand-gray/60">Chime when robot arrives or locker unlocks</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-micro font-extrabold ${soundAlerts ? "bg-brand-lime text-brand-black" : "bg-surface-3 text-brand-gray/50"}`}>
                  {soundAlerts ? "ENABLED" : "DISABLED"}
                </span>
              </div>

              <div 
                onClick={() => handleToggle("pref_email_alerts", emailAlerts, setEmailAlerts)}
                className="p-4 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-brand-lime" />
                  <div>
                    <p className="font-bold text-brand-white text-caption">Email Notifications</p>
                    <p className="text-micro text-brand-gray/60">Send dispatch receipts and SMS OTP backup to email</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-micro font-extrabold ${emailAlerts ? "bg-brand-lime text-brand-black" : "bg-surface-3 text-brand-gray/50"}`}>
                  {emailAlerts ? "ENABLED" : "DISABLED"}
                </span>
              </div>

              <div 
                onClick={() => {
                  const nextVal = !hidePwaPrompt;
                  setHidePwaPrompt(nextVal);
                  localStorage.setItem("pref_hide_pwa_prompt", String(nextVal));
                  window.dispatchEvent(new Event("dsr-settings-changed"));
                  toast.success(nextVal ? "Install PWA button hidden from screen" : "Install PWA button enabled");
                }}
                className="p-4 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-brand-lime" />
                  <div>
                    <p className="font-bold text-brand-white text-caption">Hide Install App PWA Button</p>
                    <p className="text-micro text-brand-gray/60">Remove the &apos;Install App&apos; prompt button from header navigation bar</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-micro font-extrabold ${hidePwaPrompt ? "bg-brand-lime text-[#0A0A0A]" : "bg-surface-3 text-brand-gray/50"}`}>
                  {hidePwaPrompt ? "HIDDEN" : "VISIBLE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Tab */}
      {activeTab === "developer" && (
        <div className="space-y-6">
          <div className="glassmorphism rounded-2xl border border-surface-4 p-6 space-y-4">
            <h3 className="text-title font-bold text-brand-white">API Auth Token</h3>
            <p className="text-caption text-brand-gray/60 font-medium">
              Your bearer token for authenticating FastAPI endpoints directly.
            </p>
            
            <div className="p-3 bg-surface-2 border border-surface-3 rounded-xl flex items-center justify-between font-mono text-micro text-brand-white">
              <span className="truncate max-w-lg">{token || "No token available"}</span>
              <button
                onClick={handleCopyToken}
                className="px-3 py-1.5 rounded-lg bg-surface-1 border border-surface-3 text-brand-white font-bold flex items-center space-x-1 shrink-0 ml-2 hover:bg-surface-3"
              >
                {copied ? <Check className="h-4 w-4 text-brand-lime" /> : <Copy className="h-4 w-4" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="glassmorphism rounded-2xl border border-surface-4 p-6 space-y-4">
            <h3 className="text-title font-bold text-brand-white">Cache Reset</h3>
            <p className="text-caption text-brand-gray/60 font-medium">Purge unread notifications and local app cache state.</p>
            <button
              onClick={handleResetAppCache}
              className="px-5 py-2.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error font-bold text-caption hover:bg-status-error/20 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Application Local Cache</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
