import { useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/lib/ads-config";
import { useSubscription } from "@/lib/subscription";

interface NativeBannerAdProps {
  className?: string;
}

export function NativeBannerAd({ className = "" }: NativeBannerAdProps) {
  const { isSubscribed } = useSubscription();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const config = ADS_CONFIG.nativeBanner;
  const isEnabled = ADS_CONFIG.enabled && Boolean(config.scriptUrl && config.containerId);

  useEffect(() => {
    if (isSubscribed || !isEnabled || !wrapperRef.current) return;

    // Clean up any stale script instance to ensure clean remount
    const existing = document.getElementById(`script-${config.containerId}`);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const script = document.createElement("script");
    script.id = `script-${config.containerId}`;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = config.scriptUrl;

    wrapperRef.current.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isSubscribed, isEnabled, config.scriptUrl, config.containerId]);

  if (isSubscribed || !isEnabled) return null;

  return (
    <div
      ref={wrapperRef}
      className={`w-full overflow-hidden rounded-2xl border border-border bg-card/40 p-3 sm:p-4 my-6 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>Sponsored Recommendations</span>
        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px]">
          Sponsored
        </span>
      </div>
      <div id={config.containerId} className="w-full min-h-[120px]" />
    </div>
  );
}
