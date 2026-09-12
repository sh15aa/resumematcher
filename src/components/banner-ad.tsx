import { useState } from "react";
import { ExternalLink, X, ArrowUpRight } from "lucide-react";
import { useSubscription } from "@/lib/subscription";

interface BannerAdProps {
  variant?: "bottom" | "inline" | "sidebar";
  onUpgradeClick?: () => void;
  className?: string;
}

export function BannerAd({ variant = "bottom", onUpgradeClick, className = "" }: BannerAdProps) {
  const { isSubscribed } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (isSubscribed || dismissed) return null;

  if (variant === "bottom") {
    return (
      <aside
        aria-label="Sponsored Partner"
        className={`w-full border-t border-border/70 bg-card/90 backdrop-blur-md py-2.5 px-4 z-30 transition-all ${className}`}
      >
        <div className="w-full max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Sponsored
            </span>
            <span className="font-medium text-foreground truncate">
              AWS & Cloud Architecture Masterclass
            </span>
            <span className="hidden md:inline text-muted-foreground">
              — Advance your career with real-world system design test suites.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://aws.amazon.com/certification/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Learn More <ArrowUpRight className="size-3" />
            </a>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="hidden sm:inline-flex text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Hide ads with Pro
              </button>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              title="Dismiss sponsor message"
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
        >
          <X className="size-3" />
        </button>
      </div>
      <p className="font-semibold text-foreground text-xs leading-snug">
        Master Executive System Design & Cloud Architecture
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
