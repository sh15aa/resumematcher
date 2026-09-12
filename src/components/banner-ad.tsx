import { useState } from "react";
import { ExternalLink, X, ArrowUpRight, Sparkles, ShieldCheck } from "lucide-react";
import { useSubscription } from "@/lib/subscription";

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
    return (
      <aside
        aria-label="Sponsored Notification"
        className={`fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md py-2 px-3 sm:px-6 shadow-lg transition-transform animate-in slide-in-from-bottom duration-300 ${className}`}
      >
        <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-primary shrink-0 uppercase tracking-wider">
              Sponsored
            </span>
            <p className="font-semibold text-foreground text-xs truncate">
              AWS &amp; Distributed Cloud Architecture Certification
            </p>
            <span className="hidden lg:inline text-muted-foreground text-[11px] truncate">
              — Pass high-scale system design tests &amp; unlock $180k+ Staff roles.
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://aws.amazon.com/certification/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 text-[11px] sm:text-xs font-bold transition-opacity shadow-2xs"
            >
              Learn More <ArrowUpRight className="size-3" />
            </a>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="hidden md:inline-flex text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Hide ads with Pro
              </button>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
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
    return (
      <aside
        aria-label="Sponsored Partner"
        className={`w-full border-y border-border/80 bg-gradient-to-r from-card via-card/70 to-card py-4 px-4 sm:px-6 z-30 transition-all ${className}`}
      >
        <div className="w-full max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                  Partner Spotlight
                </span>
                <span className="font-bold text-foreground text-xs sm:text-sm">
                  Executive Cloud &amp; Distributed Systems Engineering
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Benchmark your skills against real-world FAANG interview rubrics with official certifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <a
              href="https://aws.amazon.com/certification/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              Explore Programs <ArrowUpRight className="size-3.5" />
            </a>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Hide ads with Pro
              </button>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              title="Dismiss sponsor message"
              aria-label="Dismiss banner"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Minimal Sidebar / Inline Sponsor Card
  return (
    <div
      className={`rounded-xl border border-border/70 bg-card/60 p-3.5 text-xs transition-all relative ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Partner Spotlight
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-0.5"
          aria-label="Dismiss banner"
        >
          <X className="size-3" />
        </button>
      </div>
      <p className="font-semibold text-foreground text-xs leading-snug">
        Master Executive System Design &amp; Cloud Architecture
      </p>
      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
        Curated interview guides, mock architectural diagrams, and ATS optimization benchmarks.
      </p>
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
        <a
          href="https://aws.amazon.com/certification/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Explore guides <ExternalLink className="size-3" />
        </a>
        {onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="text-muted-foreground hover:text-foreground"
          >
            Go Ad-Free
          </button>
        )}
      </div>
    </div>
  );
}
