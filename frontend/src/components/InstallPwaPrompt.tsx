"use client";

import { useEffect, useState } from "react";
import { Smartphone, Download, Check } from "lucide-react";
import { toast } from "sonner";

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("DSR Delivery Bot installed successfully on your device!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("To install on iOS/Safari: tap Share ➔ Add to Home Screen. On Android/Chrome: tap 3 dots ➔ Install app.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      toast.success("Installing DSR Delivery Bot...");
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-brand-lime/30 text-brand-lime text-micro font-bold">
        <Check className="h-3.5 w-3.5" />
        <span>{"App Installed"}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-lime/20 to-brand-lime/10 border border-brand-lime/40 text-brand-lime hover:bg-brand-lime hover:text-brand-black transition-all text-micro font-bold shadow-glow-lime/20 group"
      title="Install DSR Delivery Bot app on your mobile device"
    >
      <Smartphone className="h-4 w-4 group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">{"Install App"}</span>
      <Download className="h-3.5 w-3.5" />
    </button>
  );
}
