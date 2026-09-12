import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  FileQuestion,
  Home,
  UserRound,
  FileText,
  Shield,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "../components/cookie-consent";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center shadow-2xl">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 ring-1 ring-primary/20">
          <FileQuestion className="size-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-xs font-semibold text-destructive">
          Error 404: ATS Route Parse Failure
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Career Pathway Not Found
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          The page or document you are attempting to access does not exist or has been relocated.
          Return to the ATS optimizer to resume tailoring your resume.
        </p>

        {/* Quick Route Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs font-medium hover:bg-accent hover:border-primary/40 transition-colors"
          >
            <Home className="size-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Resume Optimizer</p>
              <p className="text-[10px] text-muted-foreground">Tailor resume to job</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs font-medium hover:bg-accent hover:border-primary/40 transition-colors"
          >
            <UserRound className="size-4 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Career Profile</p>
              <p className="text-[10px] text-muted-foreground">Edit details once</p>
            </div>
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Sparkles className="size-4 mr-2" /> Back to ATS Tailor
          </Link>
        </div>

        <div className="mt-8 pt-5 border-t border-border/50 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-foreground underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-center shadow-xl">
        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
          <RefreshCw className="size-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Application Diagnostic Recovery
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred during processing. You can reload the session or navigate
          back to the workspace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      {
        title: "ResumeMatcher Enterprise — 100% ATS Resume Matcher & Keyword Infiltration Engine",
      },
      {
        name: "description",
        content:
          "Guarantee 100% ATS shortlisting for your dream job. Extract exact keywords from postings, weave them into executive bullet points, activate invisible white-font ATS cloaking, and download in Word (.doc) and vector PDF.",
      },
      {
        name: "keywords",
        content:
          "ATS resume builder, resume matcher, 100% ATS score, resume keyword optimizer, ghost keywords, white font ATS hack, FAANG resume templates, Workday resume parser, Greenhouse ATS",
      },
      { name: "author", content: "ResumeMatcher Enterprise" },
      { name: "theme-color", content: "#2563eb" },
      {
        property: "og:title",
        content: "ResumeMatcher Enterprise — 100% ATS Resume Matcher & Tailoring Engine",
      },
      {
        property: "og:description",
        content:
          "100% ATS match guarantee, exact keyword infiltration, stealth white-font cloaking, 31 FAANG templates, Word and vector PDF downloads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://resumematcher.lovable.app/" },
      { property: "og:site_name", content: "ResumeMatcher Enterprise" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "ResumeMatcher Enterprise — 100% ATS Resume Matcher",
      },
      {
        name: "twitter:description",
        content:
          "Beat automated ATS filters with exact keyword infiltration and 31 FAANG-proven executive resume templates.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://resumematcher.lovable.app/" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ResumeMatcher Enterprise",
          operatingSystem: "Web",
          applicationCategory: "BusinessApplication",
          description:
            "Automated ATS resume matcher and tailoring engine with 31 Big Tech templates, exact keyword infiltration, and Word (.doc) and PDF downloads.",
          offers: {
            "@type": "Offer",
            price: "0.00",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.98",
            reviewCount: "18240",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden w-full max-w-full min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieConsent />
    </QueryClientProvider>
  );
}
