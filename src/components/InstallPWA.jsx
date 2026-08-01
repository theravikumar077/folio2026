import { useState, useEffect } from "react";

/**
 * InstallPWA Component
 * Prompts user to install the Portfolio as a PWA app across Android, Windows, macOS, Linux.
 * Preserves dark mode aesthetic with sleek glassmorphism floating banner.
 */
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Hide if app is already installed/standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Install] User choice outcome: ${outcome}`);

    // Clear deferred prompt
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Install App Prompt"
      className="fixed bottom-6 left-6 z-[9999] flex items-center gap-4 bg-black/90 text-white border border-white/20 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-500 animate-bounce-subtle"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-white font-bold text-sm">
          RK
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium tracking-tight">Install Portfolio App</span>
          <span className="text-xs text-white/50">Faster access & full offline mode</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-black bg-white rounded-full hover:bg-white/90 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          Install
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer text-sm"
          aria-label="Dismiss Install Prompt"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};

export default InstallPWA;
