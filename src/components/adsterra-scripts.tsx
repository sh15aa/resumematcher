import { useEffect } from "react";
import { ADS_CONFIG, normalizeScriptSrc } from "@/lib/ads-config";
import { useSubscription } from "@/lib/subscription";

/**
 * Injects Adsterra global scripts (Popunder, Social Bar, Anti-Adblock sync)
 * into the DOM for free users, while respecting Pro subscription (no ads for subscribers).
 */
export function AdsterraScripts() {
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    if (isSubscribed || !ADS_CONFIG.enabled || typeof document === "undefined") {
      return;
    }

    const scriptsToLoad = [
      { id: "adsterra-popunder-script", url: normalizeScriptSrc(ADS_CONFIG.popunderScriptUrl) },
      { id: "adsterra-socialbar-script", url: normalizeScriptSrc(ADS_CONFIG.socialBarScriptUrl) },
      {
        id: "adsterra-antiadblock-script",
        url: normalizeScriptSrc(ADS_CONFIG.antiAdblockScriptUrl),
      },
    ].filter((item) => Boolean(item.url));

    const addedElements: HTMLScriptElement[] = [];

    scriptsToLoad.forEach(({ id, url }) => {
      if (document.getElementById(id)) return;

      const script = document.createElement("script");
      script.id = id;
      script.type = "text/javascript";
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
      addedElements.push(script);
    });

    return () => {
      addedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [isSubscribed]);

  return null;
}
