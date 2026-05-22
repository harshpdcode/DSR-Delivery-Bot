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
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "developer">("profile");

  // Local storage state keys for preferences
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Load preferences from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundAlerts(localStorage.getItem("pref_sound_alerts") !== "false");
      setAutoRefresh(localStorage.getItem("pref_auto_refresh") !== "false");
      setPriorityDelivery(localStorage.getItem("pref_priority_delivery") === "true");
      setEmailAlerts(localStorage.getItem("pref_email_alerts") !== "false");
    }
  }, []);

  const handleToggle = (key: string, currentValue: boolean, setter: (v: boolean) => void) => {
    const newValue = !currentValue;
    setter(newValue);
    localStorage.setItem(key, String(newValue));
    toast.success("Preferences updated");
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("API Token copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAppCache = () => {
    localStorage.removeItem(`notifications_${user?.id}`);
    toast.success("Local alerts log purged successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display font-extrabold tracking-tight">System Settings</h1>
        <p className="text-body text-brand-gray/50">
          Configure security credentials, notification channels, and developer integrations.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex space-x-1.5 p-1 bg-surface-2 rounded-xl border border-surface-4 max-w-md">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2 px-3 rounded-lg text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "profile"
              ? "bg-brand-lime text-brand-black shadow"
              : "text-brand-gray/60 hover:text-brand-white"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>My Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 py-2 px-3 rounded-lg text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "preferences"
              ? "bg-brand-lime text-brand-black shadow"
              : "text-brand-gray/60 hover:text-brand-white"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Preferences</span>
        </button>
        <button
          onClick={() => setActiveTab("developer")}
          className={`flex-1 py-2 px-3 rounded-lg text-caption font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === "developer"
              ? "bg-brand-lime text-brand-black shadow"
              : "text-brand-gray/60 hover:text-brand-white"
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Developer Tools</span>
        </button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-brand-lime" />
              <span>Personal Identification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-caption">
              <div className="space-y-1">
                <span className="text-brand-gray/40 block font-bold">Full Name</span>
                <div className="py-2.5 px-4 bg-surface-1 border border-surface-3 rounded-lg font-semibold text-brand-white">
                  {user?.full_name}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-brand-gray/40 block font-bold">Role Assignment</span>
                <div className="py-2.5 px-4 bg-surface-1 border border-surface-3 rounded-lg font-semibold text-brand-lime capitalize flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-brand-gray/40 block font-bold">Email Address</span>
                <div className="py-2.5 px-4 bg-surface-1 border border-surface-3 rounded-lg font-semibold text-brand-white flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-brand-gray/30" />
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-brand-gray/40 block font-bold">Phone Number</span>
                <div className="py-2.5 px-4 bg-surface-1 border border-surface-3 rounded-lg font-semibold text-brand-white flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-brand-gray/30" />
                  <span>{user?.phone || "No phone linked"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Lock className="h-5 w-5 text-brand-lime" />
              <span>Password & Security</span>
            </h3>
            <p className="text-caption text-brand-gray/50 leading-relaxed">
              Your password authentication is verified directly against Silver Oak University LDAP systems. Changing system passwords requires direct request through IT support ticketing portals.
            </p>
            <div className="flex justify-between items-center py-2 text-caption">
              <span className="text-brand-gray/40">Account Verification Status</span>
              <span className="text-status-success font-extrabold bg-status-success/10 border border-status-success/20 px-2.5 py-0.5 rounded capitalize">
                Verified Faculty/Student
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-4">
            <h3 className="text-title font-bold flex items-center space-x-2 pb-2 border-b border-surface-4/40">
              <Bell className="h-5 w-5 text-brand-lime" />
              <span>Alert Toggles</span>
            </h3>

            {/* Toggle Row 1 */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="text-caption font-extrabold text-brand-white">Audio Alert Triggers</h5>
                <p className="text-micro text-brand-gray/40">Play sounds on critical telemetry and cargo status updates</p>
              </div>
              <button 
                onClick={() => handleToggle("pref_sound_alerts", soundAlerts, setSoundAlerts)}
                className="text-brand-lime focus:outline-none"
              >
                {soundAlerts ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-brand-gray/30" />}
              </button>
            </div>

            {/* Toggle Row 2 */}
            <div className="flex items-center justify-between py-2 border-t border-surface-4/40">
              <div>
                <h5 className="text-caption font-extrabold text-brand-white">On-Screen Auto Synchronization</h5>
                <p className="text-micro text-brand-gray/40">Refetch dashboard data dynamically using React Query timers</p>
              </div>
              <button 
                onClick={() => handleToggle("pref_auto_refresh", autoRefresh, setAutoRefresh)}
                className="text-brand-lime focus:outline-none"
              >
                {autoRefresh ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-brand-gray/30" />}
              </button>
            </div>

            {/* Toggle Row 3 */}
            <div className="flex items-center justify-between py-2 border-t border-surface-4/40">
              <div>
                <h5 className="text-caption font-extrabold text-brand-white">Default Express Routing</h5>
                <p className="text-micro text-brand-gray/40">Always request high-priority queues for dispatch missions</p>
              </div>
              <button 
                onClick={() => handleToggle("pref_priority_delivery", priorityDelivery, setPriorityDelivery)}
                className="text-brand-lime focus:outline-none"
              >
                {priorityDelivery ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-brand-gray/30" />}
              </button>
            </div>

            {/* Toggle Row 4 */}
            <div className="flex items-center justify-between py-2 border-t border-surface-4/40">
              <div>
                <h5 className="text-caption font-extrabold text-brand-white">Email Receipts</h5>
                <p className="text-micro text-brand-gray/40">Send delivery confirmation summaries to academic email</p>
              </div>
              <button 
                onClick={() => handleToggle("pref_email_alerts", emailAlerts, setEmailAlerts)}
                className="text-brand-lime focus:outline-none"
              >
                {emailAlerts ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-brand-gray/30" />}
              </button>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-status-error" />
              <span>Application Cache Management</span>
            </h3>
            <p className="text-caption text-brand-gray/50 leading-relaxed">
              Flush localized notification caches stored inside the browser window context. This will reset the live notifications panel log.
            </p>
            <button
              onClick={handleResetAppCache}
              className="py-2.5 px-5 rounded-xl border border-surface-4 hover:border-status-error/30 text-caption font-bold text-brand-white hover:text-status-error transition-all flex items-center space-x-2"
            >
              <Trash2 className="h-4.5 w-4.5" />
              <span>Purge Notifications Storage</span>
            </button>
          </div>
        </div>
      )}

      {/* Developer Tab */}
      {activeTab === "developer" && (
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl border border-surface-4 p-6 space-y-6">
            <h3 className="text-title font-bold flex items-center space-x-2">
              <Code className="h-5 w-5 text-brand-lime" />
              <span>API Gateway Access Keys</span>
            </h3>
            <p className="text-caption text-brand-gray/50 leading-relaxed">
              Use this bearer authorization key to query FastAPI endpoints, dispatch packages, or poll MQTT telemetry broker payloads externally.
            </p>

            <div className="space-y-2">
              <label className="text-micro text-brand-gray/40 font-bold block">JSON Web Token (JWT) Credentials</label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-surface-1 border border-surface-3 rounded-lg py-2.5 px-4 font-mono text-micro text-brand-gray/40 select-all truncate max-w-full">
                  {token}
                </div>
                <button
                  onClick={handleCopyToken}
                  className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-4 text-brand-gray hover:text-brand-lime transition-all shrink-0"
                  title="Copy Token"
                >
                  {copied ? <Check className="h-5 w-5 text-status-success" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-lime/5 border border-brand-lime/10 space-y-2">
              <span className="text-caption font-extrabold text-brand-lime block">Integration Command Line Example</span>
              <code className="text-[10px] font-mono text-brand-gray/60 block leading-relaxed break-all select-all">
                curl -H "Authorization: Bearer [TOKEN]" http://localhost:8000/api/v1/robots
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
