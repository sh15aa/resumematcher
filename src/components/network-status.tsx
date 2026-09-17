import { useState, useEffect, useCallback } from "react";
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface NetworkInformation extends EventTarget {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
  onchange?: EventListener;
}

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [reconnectedMessage, setReconnectedMessage] = useState(false);

  const checkConnectionQuality = useCallback(() => {
    if (typeof navigator === "undefined") return;

    // Check offline
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }
    setIsOffline(false);

    // Check NetworkInformation API
    const nav = navigator as Navigator & { connection?: NetworkInformation };
    if (nav.connection) {
      const { effectiveType, rtt } = nav.connection;
      const isSlowSpeed =
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        (typeof rtt === "number" && rtt > 1200);

      setIsSlow(isSlowSpeed);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    checkConnectionQuality();

    const handleOnline = () => {
      setIsOffline(false);
      setReconnectedMessage(true);
      setTimeout(() => setReconnectedMessage(false), 3000);
      checkConnectionQuality();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const nav = navigator as Navigator & { connection?: NetworkInformation };
    if (nav.connection && nav.connection.addEventListener) {
      nav.connection.addEventListener("change", checkConnectionQuality);
    }

    // Listen for custom app slow network events
    const handleAppSlowEvent = () => {
      setIsSlow(true);
      setDismissed(false);
    };
    window.addEventListener("app:slow-network", handleAppSlowEvent);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (nav.connection && nav.connection.removeEventListener) {
        nav.connection.removeEventListener("change", checkConnectionQuality);
      }
      window.removeEventListener("app:slow-network", handleAppSlowEvent);
    };
  }, [checkConnectionQuality]);

  const handleCustomReload = () => {
    setReloading(true);
    // Ping health check or reload session data
    fetch("/api/verify-subscription", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setReloading(false);
          setIsSlow(false);
          setDismissed(true);
        }, 1200);
      });
  };

  if (dismissed && !isOffline) return null;

  if (reconnectedMessage) {
    return (
      <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/90 px-4 py-1.5 text-xs font-medium text-emerald-300 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span>Connection restored · Ready</span>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/40 bg-card/95 px-4 py-2 text-xs text-foreground shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <WifiOff className="size-4 animate-pulse" />
            <span>Offline</span>
          </div>
          <span className="text-muted-foreground text-[11px] hidden sm:inline">
            Network connection lost. Changes will sync when reconnected.
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-lg bg-destructive px-2.5 py-1 text-[11px] font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer"
          >
            <RefreshCw className="size-3" /> Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isSlow) {
    return (
      <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/40 bg-[#161208]/95 px-4 py-2 text-xs text-amber-200 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 font-semibold text-amber-400">
            <AlertTriangle className="size-4" />
            <span>Slow Connection Detected</span>
          </div>
          <span className="text-amber-300/80 text-[11px] hidden sm:inline">
            Data loading may take slightly longer than usual.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCustomReload}
              disabled={reloading}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${reloading ? "animate-spin" : ""}`} />
              {reloading ? "Optimizing..." : "Reload Connection"}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-amber-400/60 hover:text-amber-400 text-[10px] px-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
