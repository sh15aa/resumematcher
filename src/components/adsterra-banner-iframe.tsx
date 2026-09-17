import { useEffect, useRef, memo } from "react";
import { normalizeAdsterraKey, normalizeScriptSrc } from "@/lib/ads-config";

interface AdsterraBannerIframeProps {
  adKey: string;
  width: number;
  height: number;
  scriptUrl?: string;
  className?: string;
}

/**
 * Isolated iframe container for Adsterra banner advertisements.
 *
 * Runs each banner in its own sandboxed document context so that:
 * 1. Global `window.atOptions` does NOT collide or get deleted between multiple banners.
 * 2. `invoke.js` finds its dedicated script container reliably.
 * 3. React re-renders and virtual DOM diffing cannot corrupt ad scripts.
 * 4. Clicks open sponsor links in a new tab via `<base target="_blank">`.
 */
export const AdsterraBannerIframe = memo(function AdsterraBannerIframe({
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

    // Reset container to clear prior iframes on key or dimension change
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.title = `Adsterra-${cleanKey}`;
    iframe.width = String(width);
    iframe.height = String(height);
    iframe.scrolling = "no";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("marginwidth", "0");
    iframe.setAttribute("marginheight", "0");
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.maxWidth = "100%";
    iframe.style.backgroundColor = "transparent";

    container.appendChild(iframe);

    const adHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base target="_blank">
    <style>
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      try {
        if (window.parent && window.parent.location) {
          Object.defineProperty(document, 'referrer', {
            get: function() { return window.parent.location.href; },
            configurable: true
          });
        }
      } catch (e) {}

      atOptions = {
        'key': '${cleanKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    </script>
    <script type="text/javascript" src="${cleanScriptUrl}"></script>
  </body>
</html>`;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(adHtml);
        doc.close();
      } else {
        iframe.srcdoc = adHtml;
      }
    } catch {
      iframe.srcdoc = adHtml;
    }

    return () => {
      container.innerHTML = "";
    };
  }, [cleanKey, cleanScriptUrl, width, height]);

  if (!cleanKey) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden flex items-center justify-center max-w-full ${className}`}
      style={{ minHeight: `${height}px`, minWidth: `${Math.min(width, 320)}px` }}
    />
  );
});
