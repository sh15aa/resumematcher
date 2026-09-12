import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileCheck, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ResumeMatcher Enterprise" },
      {
        name: "description",
        content:
          "ResumeMatcher Enterprise Terms of Service, billing, subscription terms, 30-day refund guarantee, and acceptable usage policy.",
      },
      { property: "og:title", content: "Terms of Service — ResumeMatcher Enterprise" },
      {
        property: "og:description",
        content:
          "Transparent, user-friendly terms governing your subscription, intellectual property, and satisfaction guarantee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://resumematcher.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to ResumeMatcher
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <FileCheck className="size-3" /> Enterprise Terms
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-background py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
            <FileCheck className="size-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Last Updated: September 12, 2026 • Valid for all active users and subscribers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-10 text-sm leading-relaxed text-foreground/90">
        {/* Money Back Guarantee Highlight */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" /> 100% Satisfaction &amp; 30-Day
            Money-Back Guarantee
          </h2>
          <p className="text-sm text-foreground/80">
            We are confident in our ATS resume matching and keyword tailoring engine. If you are not
            completely satisfied with your interview shortlisting results, you may request a 100%
            no-questions-asked refund within 30 days of purchase.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using ResumeMatcher Enterprise (&quot;Service&quot;), provided by
            ResumeMatcher Inc., you agree to be bound by these Terms of Service. If you do not agree
            to these terms, you must discontinue using the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            2. Intellectual Property &amp; Your Content
          </h2>
          <p>
            <strong className="text-foreground">You retain 100% ownership of your content.</strong>{" "}
            All text, work experience, career achievements, and documents you create or upload
            remain your sole intellectual property. We claim no ownership over your resume content.
          </p>
          <p>
            The software, visual styling, templates, and tailoring algorithms are the exclusive
            property of ResumeMatcher Enterprise and are protected under international copyright and
            trademark laws.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            3. Free Tier vs. Enterprise Pro Subscriptions
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Free Tier:</strong> Includes access to the first 5
              executive resume templates, custom section builder, ATS keyword matching, and
              unlimited Microsoft Word (.doc) exports.
            </li>
            <li>
              <strong className="text-foreground">Enterprise Pro:</strong> Unlocks all 31
              world-class Big Tech templates, high-resolution vector PDF downloads, cloud profile
              synchronization, and ad-free experience.
            </li>
            <li>
              <strong className="text-foreground">Billing Cycles:</strong> Pro is available in
              Monthly and Annual billing plans with localized currency pricing. Subscriptions can be
              managed and cancelled anytime directly from your dashboard or profile settings.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            4. ATS Scoring &amp; Shortlist Optimization Disclaimer
          </h2>
          <p>
            ResumeMatcher Enterprise provides industry-leading ATS parsing analysis, keyword
            extraction, and bullet point rewrites designed to maximize candidate interview
            shortlisting rates across Workday, Greenhouse, Lever, Taleo, and other enterprise ATS
            systems.
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              Candidates are solely responsible for ensuring the factual accuracy of their career
              claims, degrees, certifications, and technical proficiencies prior to submitting
              applications to prospective employers.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            5. Termination &amp; Cancellation
          </h2>
          <p>
            You may cancel your recurring subscription at any time without penalty. Following
            cancellation, your Pro benefits will remain active until the conclusion of your current
            prepaid billing cycle, after which your account reverts smoothly to the Free tier with
            Word exports intact.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            6. Governing Law &amp; Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws,
            without regard to conflict of law principles. Any legal disputes shall be resolved
            through good-faith mutual negotiation or binding arbitration.
          </p>
        </section>

        {/* Back Button */}
        <div className="pt-6 border-t border-border/60 flex items-center justify-between">
          <Link to="/">
            <Button variant="default">Return to ATS Resume Tailor</Button>
          </Link>
          <Link
            to="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            View Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
