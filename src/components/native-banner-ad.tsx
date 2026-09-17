import { useMemo } from "react";
import { ADS_CONFIG } from "@/lib/ads-config";
import { useSubscription } from "@/lib/subscription";

interface NativeBannerAdProps {
  className?: string;
}

export function NativeBannerAd({ className = "" }: NativeBannerAdProps) {
  const { isSubscribed } = useSubscription();

  const config = ADS_CONFIG.nativeBanner;
  const isEnabled = ADS_CONFIG.enabled && Boolean(config.scriptUrl && config.containerId);

  const srcDoc = useMemo(() => {
    if (!isEnabled) return "";
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script async="async" data-cfasync="false" src="${config.scriptUrl}"></script>
  <div id="${config.containerId}"></div>
</body>
</html>`;
  }, [config.scriptUrl, config.containerId, isEnabled]);

  if (isSubscribed || !isEnabled) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-border bg-card/40 p-3 sm:p-4 my-6 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>Sponsored Recommendations</span>
        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px]">
          Sponsored
        </span>
      </div>
      <iframe
        title="Sponsored Recommendations"
        srcDoc={srcDoc}
        className="w-full border-0 overflow-hidden min-h-[160px]"
        scrolling="no"
      />
    </div>
  );
}
