import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_STORAGE_KEY = "resumematcher:cookie_consent:v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Delay slightly for smooth page entrance
        timer = setTimeout(() => setVisible(true), 1200);
      }
    } catch {
      // Storage unavailable
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const savePreferences = (consent: "all" | "essential" | "custom") => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          status: consent,
          analytics: consent === "all" || (consent === "custom" && analyticsConsent),
          timestamp: Date.now(),
        }),
      );
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent preferences"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-border/80 bg-card/95 p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Cookie className="size-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="sm:hidden text-primary">🍪</span> We Value Your Privacy &amp; Data
              Control
            </h3>
            <button
              type="button"
              onClick={() => savePreferences("essential")}
              className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
              aria-label="Dismiss cookie notice"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            We use essential cookies to remember your template selections and localized currency. We
            also use privacy-first analytics to monitor ATS matching performance. We never sell your
            resume data. Read our{" "}
            <Link
              to="/privacy"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              to="/terms"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Terms
            </Link>
            .
          </p>

          {showDetails && (
            <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Essential Storage (Required)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Session auth, template state, local currency
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                  Always Active
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div>
                  <p className="font-semibold text-foreground">Performance &amp; ATS Diagnostics</p>
                  <p className="text-[11px] text-muted-foreground">
                    Anonymous keyword scoring &amp; telemetry
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {showDetails ? "Hide Preferences" : "Customize"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => savePreferences(showDetails ? "custom" : "essential")}
              className="text-xs h-8 px-3"
            >
              Necessary Only
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => savePreferences("all")}
              className="text-xs h-8 px-3.5 font-semibold"
            >
              <Check className="size-3 mr-1.5" /> Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
