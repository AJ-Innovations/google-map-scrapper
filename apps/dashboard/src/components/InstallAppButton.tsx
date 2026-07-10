"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isInstalled) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl opacity-60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Download size={16} className="text-gray-500" />
            Install App
          </div>
          <p className="text-sm text-gray-500">App is already installed.</p>
        </div>
        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-500">
          Installed
        </div>
      </div>
    );
  }

  if (!isInstallable) {
    // If not installable (e.g., iOS Safari which doesn't support beforeinstallprompt, or already installed but not in standalone mode)
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-accent-primary/30 transition-colors">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <Download size={16} className="text-gray-500" />
          Install Desktop App
        </div>
        <p className="text-sm text-gray-500">Install X-Scrapper for a better native experience.</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-primary/90 transition-colors shadow-sm"
      >
        Install
      </button>
    </div>
  );
}
