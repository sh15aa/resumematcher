import { useState } from "react";
import { ExternalLink, X, ArrowUpRight, Sparkles } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { ADS_CONFIG, normalizeAdsterraKey } from "@/lib/ads-config";
import { AdsterraBannerIframe } from "./adsterra-banner-iframe";

interface BannerAdProps {
  variant?: "bottom" | "sticky-bottom" | "inline" | "sidebar";
  onUpgradeClick?: () => void;
  className?: string;
}

export function BannerAd({ variant = "bottom", onUpgradeClick, className = "" }: BannerAdProps) {
  const { isSubscribed } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (isSubscribed || dismissed) return null;

  // Floating Sticky Bottom Bar (Fixed to bottom of screen on Mobile & Desktop)
  if (variant === "sticky-bottom") {
    const stickyConfig = ADS_CONFIG.banners.stickyBottom;
    const hasRealAd = ADS_CONFIG.enabled && Boolean(normalizeAdsterraKey(stickyConfig.key));

    return (
      <aside
        aria-label="Sponsored Notification"
        className={`fixed bottom-0 inset-x-0 z-40 border-t border-border bg-[#090A0F]/90 backdrop-blur-md py-2 px-3 sm:px-6 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom ${className}`}
      >
        <div className="w-full max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-400 shrink-0 uppercase tracking-wider">
              Sponsored
            </span>
            {!hasRealAd ? (
              <>
                <p className="font-medium text-slate-200 text-xs truncate">
                  AWS &amp; Distributed Cloud Architecture Certification
                </p>
                <span className="hidden lg:inline text-slate-500 text-[11px] truncate">
                  — Pass high-scale system design tests &amp; unlock $180k+ Staff roles.
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-[11px]">Adsterra Network Partner</span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasRealAd ? (
              <AdsterraBannerIframe
                adKey={stickyConfig.key}
                width={stickyConfig.width}
                height={stickyConfig.height}
                scriptUrl={stickyConfig.scriptUrl}
              />
            ) : (
              <a
                href="https://aws.amazon.com/certification/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 text-xs font-semibold transition-all shadow-xs"
              >
                Learn More <ArrowUpRight className="size-3" />
              </a>
            )}

            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="hidden md:inline-flex text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
              >
                Hide ads with Pro
              </button>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
              title="Dismiss sponsor banner"
              aria-label="Dismiss banner"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Full-width Bottom Ad Unit (Above the Footer)
  if (variant === "bottom") {
    const bottomConfig = ADS_CONFIG.banners.bottom;
    const hasRealAd = ADS_CONFIG.enabled && Boolean(normalizeAdsterraKey(bottomConfig.key));

    return (
      <aside
        aria-label="Sponsored Partner"
        className={`w-full border-y border-border bg-[#121624]/60 backdrop-blur-xs py-5 px-4 sm:px-6 z-30 transition-all ${className}`}
      >
        <div className="w-full max-w-[1720px] mx-auto flex flex-col items-center justify-between gap-4 text-xs">
          <div className="w-full flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-medium uppercase text-slate-400 tracking-wider">
                {hasRealAd ? "Advertisement" : "Partner Spotlight"}
              </span>
              <span className="font-semibold text-foreground text-xs sm:text-sm">
                {hasRealAd
                  ? "Sponsored Recommendations"
                  : "Executive Cloud & Distributed Systems Engineering"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onUpgradeClick && (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
                >
                  Hide ads with Pro
                </button>
              )}
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss sponsor message"
                aria-label="Dismiss banner"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {hasRealAd ? (
            <div className="w-full flex justify-center py-2 overflow-x-hidden">
              {/* Desktop / Tablet: 728x90 */}
              <div className="hidden sm:block">
                <AdsterraBannerIframe
                  adKey={bottomConfig.key}
                  width={bottomConfig.width}
                  height={bottomConfig.height}
                  scriptUrl={bottomConfig.scriptUrl}
                />
              </div>
              {/* Mobile (< 640px): 320x50 */}
              <div className="block sm:hidden">
                <AdsterraBannerIframe
                  adKey={ADS_CONFIG.banners.stickyBottom.key}
                  width={ADS_CONFIG.banners.stickyBottom.width}
                  height={ADS_CONFIG.banners.stickyBottom.height}
                  scriptUrl={ADS_CONFIG.banners.stickyBottom.scriptUrl}
                />
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Benchmark your skills against real-world FAANG interview rubrics with official
                  certifications.
                </p>
              </div>

              <a
                href="https://aws.amazon.com/certification/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-card hover:bg-accent text-foreground border border-border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs self-start md:self-center"
              >
                Explore Programs <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Minimal Sidebar / Inline Sponsor Card (variant === 'sidebar' or 'inline')
  const sidebarConfig = ADS_CONFIG.banners.sidebar;
  const hasRealAd = ADS_CONFIG.enabled && Boolean(normalizeAdsterraKey(sidebarConfig.key));

  return (
    <div
      className={`rounded-2xl border border-border bg-card/60 p-4 text-xs transition-all relative card-interactive ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {hasRealAd ? "Sponsored" : "Partner Spotlight"}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="size-3" />
        </button>
      </div>

      {hasRealAd ? (
        <div className="my-2 flex justify-center">
          <AdsterraBannerIframe
            adKey={sidebarConfig.key}
            width={sidebarConfig.width}
            height={sidebarConfig.height}
            scriptUrl={sidebarConfig.scriptUrl}
          />
        </div>
      ) : (
        <>
          <p className="font-semibold text-foreground text-xs leading-snug">
            Master Executive System Design &amp; Cloud Architecture
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            Curated interview guides, mock architectural diagrams, and ATS optimization benchmarks.
          </p>
        </>
      )}

      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-border/50 text-xs">
        {!hasRealAd ? (
          <a
            href="https://aws.amazon.com/certification/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Explore guides <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-[10px] text-muted-foreground">Ads by Adsterra</span>
        )}

        {onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-[11px]"
          >
            Go Ad-Free
          </button>
        )}
      </div>
    </div>
  );
}
