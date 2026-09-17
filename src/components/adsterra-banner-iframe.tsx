import { useEffect, useRef } from "react";
import { normalizeAdsterraKey, normalizeScriptSrc } from "@/lib/ads-config";

interface AdsterraBannerIframeProps {
  adKey: string;
  width: number;
  height: number;
  scriptUrl?: string;
  className?: string;
}

export function AdsterraBannerIframe({
  adKey,
  width,
  height,
  scriptUrl,
  className = "",
}: AdsterraBannerIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanKey = normalizeAdsterraKey(adKey);
  const cleanScriptUrl =
    normalizeScriptSrc(scriptUrl) || `https://boughwarrior.com/${cleanKey}/invoke.js`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cleanKey) return;

    // Avoid injecting multiple times if already initialized
    if (container.querySelector("iframe") || container.getAttribute("data-ad-loaded") === "true") {
      return;
    }

    container.setAttribute("data-ad-loaded", "true");

    try {
      const conf = document.createElement("script");
      conf.type = "text/javascript";
      conf.innerHTML = `
        atOptions = {
          'key': '${cleanKey}',
          'format': 'iframe',
          'height': ${height},
          'width': ${width},
          'params': {}
        };
      `;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = cleanScriptUrl;
      script.async = true;

      container.appendChild(conf);
      container.appendChild(script);
    } catch (e) {
      console.error("[Adsterra] Error injecting banner:", e);
    }
  }, [cleanKey, cleanScriptUrl, width, height]);

  if (!cleanKey) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden flex items-center justify-center max-w-full ${className}`}
      style={{ minHeight: `${height}px` }}
    />
  );
}
