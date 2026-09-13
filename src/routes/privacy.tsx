import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CVFitt Enterprise" },
      {
        name: "description",
        content:
          "CVFitt Enterprise Privacy Policy. Learn how we handle your resume data, job descriptions, security standards, GDPR & CCPA compliance.",
      },
      { property: "og:title", content: "Privacy Policy — CVFitt Enterprise" },
      {
        property: "og:description",
        content:
          "Complete transparency into our strict data protection, zero-data-selling pledge, and bank-grade encryption standards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://cv.fitt.workers.dev/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-[#090A0F]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4 text-primary" /> Back to CVFitt
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <Shield className="size-3" /> GDPR &amp; CCPA Compliant
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-b from-primary/10 via-card/30 to-background py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
            <Lock className="size-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight hero-gradient-text">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
            Last Updated: September 12, 2026 • Effective Date: January 1, 2026
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-10 text-sm leading-relaxed text-foreground/90">
        {/* Core Guarantee */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-2">
          <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-5" /> Our Fundamental Privacy Commitment
          </h2>
          <p className="text-sm text-foreground/80">
            CVFitt Enterprise is designed with privacy-first architecture. We never sell, rent, or
            monetize your resume text, job application history, or personally identifiable
            information (PII) to third-party data brokers, recruiters, or advertisers. Your
            documents remain strictly your property.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            1. Information We Collect
          </h2>
          <p>
            When utilizing CVFitt, we may collect the following information necessary to provide and
            enhance our resume tailoring and ATS matching capabilities:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Resume Data &amp; Career Details:</strong> Text
              extracted from uploaded resumes (PDF, Word, or plain text) and inputs provided in your
              career profile (job titles, work achievements, contact details, educational history).
            </li>
            <li>
              <strong className="text-foreground">Job Posting Content:</strong> Target job
              descriptions and requirements entered into the matcher engine to compute keyword
              overlap and ATS fit scores.
            </li>
            <li>
              <strong className="text-foreground">Account Credentials:</strong> If you create an
              account, your email address and encrypted authentication credentials managed via
              Supabase Auth.
            </li>
            <li>
              <strong className="text-foreground">Billing &amp; Transaction Information:</strong>{" "}
              Subscription tiers, currency selections, and tokenized payment verification records.
              Full credit card numbers are handled exclusively by certified PCI-DSS Level 1 payment
              processors and are never stored on our application servers.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            2. How We Use Your Information
          </h2>
          <p>We process collected data exclusively for the following legitimate purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              Computing ATS keyword fit scores and generating tailored resumes &amp; cover letters.
            </li>
            <li>Providing instant downloads in Word (.doc) and vector PDF formats.</li>
            <li>
              Saving candidate history and cloud career profiles if logged into an authenticated
              account.
            </li>
            <li>
              Preventing automated abuse, rate limit breaches, and fraudulent payment activities.
            </li>
            <li>Ensuring technical uptime, error diagnostic logging, and product reliability.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            3. Data Security &amp; Encryption
          </h2>
          <p>
            We implement state-of-the-art security safeguards to protect your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">End-to-End Transit Security:</strong> All data
              transmitted between your browser and our servers is secured using modern TLS 1.3 /
              HTTPS encryption.
            </li>
            <li>
              <strong className="text-foreground">Zero Retention Option:</strong> Guest users can
              clear browser history and local storage at any time with a single click.
            </li>
            <li>
              <strong className="text-foreground">Sandboxed Execution:</strong> AI parsing and
              document formatting take place in secure, memory-isolated runtime environments.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            4. Cookies &amp; Local Storage
          </h2>
          <p>
            CVFitt uses minimal cookies and HTML5 LocalStorage to remember your preferred template,
            localized currency, drafts, and cookie consent preferences. We do not use intrusive
            third-party cross-site tracking cookies. You may manage or revoke your consent
            preferences at any time via our Cookie Consent banner.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            5. Your Rights (GDPR &amp; CCPA / CPRA)
          </h2>
          <p>
            You maintain full sovereignty over your professional data. Under GDPR, CCPA/CPRA, and
            international data regulations, you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Access &amp; Portability:</strong> Request an
              export of all career profile details and saved tailored resumes.
            </li>
            <li>
              <strong className="text-foreground">Right to Erasure (Be Forgotten):</strong> Delete
              your profile and tailored documents at any time.
            </li>
            <li>
              <strong className="text-foreground">Right to Non-Discrimination:</strong> Exercising
              your privacy rights will never degrade your access to our services.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
            6. Contact Data Protection Officer
          </h2>
          <p>
            For privacy inquiries, data subject requests (DSR), or compliance verification, please
            contact our Data Protection Officer at:
          </p>
          <div className="rounded-xl border border-border bg-card p-4 text-xs font-mono">
            <p className="text-foreground font-semibold">CVFitt Enterprise Legal &amp; Privacy</p>
            <p className="text-muted-foreground">Email: privacy@cvfitt.ai</p>
            <p className="text-muted-foreground">Security Team: security@cvfitt.ai</p>
          </div>
        </section>

        {/* Back Button */}
        <div className="pt-6 border-t border-border/60 flex items-center justify-between">
          <Link to="/">
            <Button variant="default">Return to ATS Resume Tailor</Button>
          </Link>
          <Link
            to="/terms"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
