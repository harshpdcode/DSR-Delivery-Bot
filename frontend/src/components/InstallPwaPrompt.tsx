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
      toast.success("DSR Go installed successfully on your device!");
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

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-brand-lime/30 text-brand-lime text-micro font-bold">
        <Check className="h-3.5 w-3.5" />
        <span>{"App Installed"}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-lime text-brand-black hover:scale-105 transition-all text-micro font-extrabold shadow-glow-lime/30 group cursor-pointer"
      title="Install DSR Go app on your mobile device"
    >
      <Smartphone className="h-4 w-4 group-hover:scale-110 transition-transform" />
      <span className="inline font-bold">{"Install App"}</span>
      <Download className="h-3.5 w-3.5" />
    </button>
  );
}
