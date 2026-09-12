import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export function FaqSection({ className = "" }: { className?: string }) {
  const faqs = [
    {
      q: "How does the 100% ATS Shortlist & Keyword Infiltration guarantee work?",
      a: "Our matcher engine analyzes the exact job posting and extracts every technical skill, required competency, tooling framework, and metric. It injects these verbatim into your resume's categorized skills section and experience bullet points, ensuring automated applicant tracking filters score you at the top 1% bracket for human recruiter review.",
    },
    {
      q: "What is the Ghost Keyword (White-Font Injection) feature?",
      a: "The Ghost Keyword feature embeds all missing, secondary, and niche semantic keywords from the job description in microscopic, transparent white font (#ffffff). Human recruiters see a spotless, beautifully structured resume without clutter, while ATS text parsers extract 100% of the keywords directly from the document layer. You can toggle this on or off anytime and use 'X-Ray View' to inspect the exact keywords injected.",
    },
    {
      q: "Which Applicant Tracking Systems (ATS) are supported?",
      a: "ResumeMatcher templates are benchmarked and verified across all major enterprise ATS platforms including Workday, Greenhouse, Lever, Taleo, iCIMS, Ashby, BambooHR, and SmartRecruiters. All 31 templates avoid complex multi-column glitches, unreadable text frames, or unsupported graphic symbols.",
    },
    {
      q: "Can I download my resume in both Microsoft Word (.doc) and PDF formats?",
      a: "Yes! Free tier users get instant, unlimited downloads in Microsoft Word (.doc) format with corporate styling and ATS formatting intact. Enterprise Pro users also unlock high-resolution vector PDF downloads and access to all 31 Big Tech & FAANG templates.",
    },
    {
      q: "Will human recruiters or HR see the hidden white keywords?",
      a: "No. The ghost keywords are rendered in exact background-matching white font (#ffffff) with zero line-height and microscopic sizing. When printed or viewed on screens by hiring managers, the page looks completely normal and pristine. Only algorithmic ATS parsers read the document text stream.",
    },
    {
      q: "What is your refund policy if I don't get interview callbacks?",
      a: "We offer a 100% no-questions-asked 30-Day Money-Back Guarantee. If our ATS optimization and templates do not noticeably increase your interview invitation rate, email us at support@resumematcher.ai for an immediate, full refund.",
    },
    {
      q: "Is my resume data and contact information secure?",
      a: "Absolutely. We adhere to strict GDPR and CCPA privacy frameworks. We never sell, scrape, or share your career details with third parties or external recruiters. Your documents are processed in memory and encrypted with bank-level 256-bit SSL protocols.",
    },
  ];

  return (
    <section aria-labelledby="faq-heading" className={`py-12 ${className}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 ring-1 ring-primary/20">
            <HelpCircle className="size-5" />
          </div>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Everything you need to know about our ATS matching engine, ghost keyword infiltration,
            and document exports.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/60 rounded-xl px-4 py-1 data-[state=open]:bg-muted/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-primary shrink-0" />
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-5 pb-3">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>
            Have more questions? Reach our 24/7 technical team at support@resumematcher.ai
          </span>
        </div>
      </div>
    </section>
  );
}
