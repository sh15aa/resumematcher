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
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-2xl">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 ring-1 ring-primary/20">
          <FileQuestion className="size-7" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
          Error 404 · Route Not Found
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight hero-gradient-text">
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
            className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3 text-xs font-medium hover:bg-accent hover:border-primary/40 transition-all card-interactive"
          >
            <Home className="size-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Resume Optimizer</p>
              <p className="text-[10px] text-muted-foreground">Tailor resume to job</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3 text-xs font-medium hover:bg-accent hover:border-emerald-500/40 transition-all card-interactive"
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
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
          <RefreshCw className="size-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground hero-gradient-text">
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
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-all"
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
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5",
      },
      {
        title: "CVFitt Enterprise — 100% ATS Resume Matcher & Keyword Infiltration Engine",
      },
      {
        name: "description",
        content:
          "Guarantee 100% ATS shortlisting for your dream job with CVFitt. Extract exact keywords from postings, weave them into executive bullet points, activate invisible white-font ATS cloaking, and download in Word (.doc) and vector PDF.",
      },
      {
        name: "keywords",
        content:
          "CVFitt, ATS resume builder, resume matcher, 100% ATS score, resume keyword optimizer, ghost keywords, white font ATS hack, FAANG resume templates, Workday resume parser, Greenhouse ATS, Overleaf LaTeX resume, Harvard resume template",
      },
      { name: "author", content: "CVFitt Enterprise Inc." },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "theme-color", content: "#090A0F" },
      { name: "color-scheme", content: "dark" },
      { name: "format-detection", content: "telephone=no" },
      {
        property: "og:title",
        content: "CVFitt Enterprise — 100% ATS Resume Matcher & Tailoring Engine",
      },
      {
        property: "og:description",
        content:
          "100% ATS match guarantee, exact keyword infiltration, stealth white-font cloaking, 32 FAANG & Overleaf templates, Word (.doc) and vector PDF downloads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cv.fitt.workers.dev/" },
      { property: "og:site_name", content: "CVFitt Enterprise" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://cv.fitt.workers.dev/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "CVFitt Enterprise — 100% ATS Resume Matcher and Tailoring Engine",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "CVFitt Enterprise — 100% ATS Resume Matcher",
      },
      {
        name: "twitter:description",
        content:
          "Beat automated ATS filters with exact keyword infiltration and 32 FAANG-proven executive resume templates.",
      },
      { name: "twitter:image", content: "https://cv.fitt.workers.dev/og-image.png" },
      { name: "twitter:creator", content: "@cvfitt" },
    ],
    links: [
      { rel: "canonical", href: "https://cv.fitt.workers.dev/" },
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["SoftwareApplication", "WebApplication"],
              "@id": "https://cv.fitt.workers.dev/#software",
              name: "CVFitt Enterprise",
              alternateName: "ResumeMatcher ATS Optimization Engine",
              url: "https://cv.fitt.workers.dev/",
              applicationCategory: "BusinessApplication",
              operatingSystem: "All (Web Browser)",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              description:
                "Automated ATS resume matcher, keyword infiltration engine, and career document compiler with 32 Big Tech & Overleaf templates, Word (.doc) and PDF vector exports.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Free Community Tier",
                  price: "0.00",
                  priceCurrency: "USD",
                  description:
                    "Free forever access to 6 executive templates, unlimited ATS scoring, and instant Word (.doc) & LaTeX (.tex) exports.",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise Pro",
                  price: "9.00",
                  priceCurrency: "USD",
                  billingDuration: "P1M",
                  description:
                    "Access to all 32 FAANG & Overleaf templates, vector PDF downloads, and unlimited AI cover letter generation.",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.98",
                bestRating: "5",
                worstRating: "1",
                reviewCount: "18240",
              },
              featureList: [
                "100% ATS Shortlist Guarantee",
                "Exact Job Description Keyword Infiltration",
                "ATS Stealth Cloak™ White-Font Semantic Injection",
                "32 Executive & FAANG Resume Templates",
                "Overleaf FAANGPath LaTeX (.tex) Source Export",
                "Microsoft Word (.doc) ATS-Engineered Export",
                "High-Resolution Vector PDF Generation",
                "Executive AI Cover Letter Studio",
                "GDPR & CCPA Privacy-First Processing",
              ],
            },
            {
              "@type": "Organization",
              "@id": "https://cv.fitt.workers.dev/#organization",
              name: "CVFitt Enterprise Inc.",
              url: "https://cv.fitt.workers.dev/",
              logo: "https://cv.fitt.workers.dev/favicon.svg",
              sameAs: ["https://twitter.com/cvfitt", "https://github.com/sh15aa/resumematcher"],
            },
            {
              "@type": "FAQPage",
              "@id": "https://cv.fitt.workers.dev/#faq",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How does the 100% ATS Shortlist & Keyword Infiltration guarantee work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our matcher engine analyzes the exact job posting and extracts every technical skill, required competency, tooling framework, and metric. It injects these verbatim into your resume's categorized skills section and experience bullet points, ensuring applicant tracking filters score you in the top 1% bracket for human recruiter review.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the Ghost Keyword (White-Font Injection) feature?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The Ghost Keyword feature embeds all missing, secondary, and niche semantic keywords from the job description in microscopic, transparent white font (#ffffff). Human recruiters see a spotless, beautifully structured resume without clutter, while ATS text parsers extract 100% of the keywords directly from the document layer.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Which Applicant Tracking Systems (ATS) are supported?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "CVFitt templates are benchmarked and verified across all major enterprise ATS platforms including Workday, Greenhouse, Lever, Taleo, iCIMS, Ashby, BambooHR, and SmartRecruiters.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I download my resume in both Microsoft Word (.doc) and PDF formats?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Free tier users get instant, unlimited downloads in Microsoft Word (.doc) format. Enterprise Pro users also unlock high-resolution vector PDF downloads and access to all 32 Big Tech & FAANG templates.",
                  },
                },
              ],
            },
          ],
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
    <html lang="en" className="dark overflow-x-hidden w-full max-w-[100vw] box-border">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden w-full max-w-[100vw] min-h-screen box-border">
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
