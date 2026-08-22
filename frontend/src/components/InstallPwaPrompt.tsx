"use client";

import { useEffect, useState } from "react";
import { Smartphone, Download, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isHiddenBySetting, setIsHiddenBySetting] = useState(false);

  useEffect(() => {
    const checkSetting = () => {
      if (typeof window !== "undefined") {
        setIsHiddenBySetting(localStorage.getItem("pref_hide_pwa_prompt") === "true");
      }
    };
    checkSetting();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("DSR Go installed successfully on your device!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("dsr-settings-changed", checkSetting);

    // Check if running as standalone PWA
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("dsr-settings-changed", checkSetting);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        toast.success("Installing DSR Go app on your phone...");
      }
    } else {
      toast.info("📲 Tap your browser menu (⋮ or Share) ➔ Select 'Install app' to install DSR Go on your phone.");
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_hide_pwa_prompt", "true");
      window.dispatchEvent(new Event("dsr-settings-changed"));
      toast.info("Install button hidden. You can enable it anytime in Settings.");
    }
  };

  if (isHiddenBySetting) {
    return null;
  }

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-brand-lime/30 text-brand-lime text-micro font-bold">
        <Check className="h-3.5 w-3.5" />
        <span>{"App Installed"}</span>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center space-x-1.5 bg-brand-lime text-[#0A0A0A] px-3 py-1.5 rounded-lg shadow-sm group shrink-0 border-0">
      <button
        onClick={handleInstallClick}
        className="flex items-center space-x-1.5 text-micro font-extrabold text-[#0A0A0A] bg-transparent border-0 p-0 hover:opacity-85 transition-opacity cursor-pointer"
        title="Install DSR Go app on your mobile device"
      >
        <Smartphone className="h-4 w-4 shrink-0 text-[#0A0A0A]" />
        <span className="font-extrabold shrink-0 text-[#0A0A0A]">Install App</span>
        <Download className="h-3.5 w-3.5 shrink-0 text-[#0A0A0A]" />
      </button>

      <button
        onClick={handleDismiss}
        className="p-0.5 rounded hover:bg-black/15 text-[#0A0A0A]/80 hover:text-[#0A0A0A] bg-transparent border-0 transition-colors cursor-pointer flex items-center justify-center"
        title="Hide Install Button (Available in Settings)"
        aria-label="Dismiss Install Button"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
