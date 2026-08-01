import { useState, useEffect } from "react";

/**
 * UpdateNotification Component
 * Displays a toast notification when a new version/deployment of the portfolio is ready.
 * Prompts user to click [Update Now] which triggers SW skipWaiting and reloads the page with new assets.
 */
const UpdateNotification = ({ registration }) => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (registration) {
      setShowUpdate(true);
    }
  }, [registration]);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to waiting SW to skip waiting and activate immediately
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
    // Reload window to load updated assets
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 bg-black/95 text-white border border-blue-500/40 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-2xl animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-white">New version available</span>
          <span className="text-xs text-white/60">An update has been deployed.</span>
        </div>
      </div>
      <button
        onClick={handleUpdate}
        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ml-2"
      >
        Update Now
      </button>
    </div>
  );
};

export default UpdateNotification;
