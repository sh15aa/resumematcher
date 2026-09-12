import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback, useDeferredValue } from "react";
import {
  ArrowRight,
  UserRound,
  Check,
  Copy,
  Download,
  FileText,
  History as HistoryIcon,
  Loader2,
  Trash2,
  Upload,
  Sparkles,
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  Plus,
  Crown,
  Lock,
  Building2,
  FileDown,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  Maximize,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { HighlightedResume } from "@/components/highlighted-resume";
import { extractFileText } from "@/lib/pdf-text";
import { printHtmlDocument } from "@/lib/print";
import { renderMatchReportHtml } from "@/lib/report";
import { findTemplate, renderResumeHtml, TEMPLATES, type ResumeTemplate } from "@/lib/templates";
import { parseResume } from "@/lib/resume-doc";
import { extractKeywords } from "@/lib/matcher-engine";
import { FaqSection } from "@/components/faq-section";
import { SocialShare } from "@/components/social-share";
import {
  emptyProfile,
  emptyRole,
  emptyStudy,
  loadProfile,
  profileToResume,
  saveProfile,
  type Profile,
  type ProfileCustomSection,
  type CustomSectionItem,
} from "@/lib/profile";
import {
  clearHistory,
  deleteEntry,
  deriveTitle,
  formatWhen,
  loadHistory,
  saveEntry,
  updateEntry,
  type HistoryEntry,
} from "@/lib/history";
import {
  extractPartialString,
  parseTailorResult,
  type KeywordFix,
  type TailorResult,
} from "@/lib/partial-json";
import { downloadResumeWord } from "@/lib/word-export";
import { useSubscription } from "@/lib/subscription";
import { useAuth } from "@/lib/supabase-auth";
import { SubscriptionModal } from "@/components/subscription-modal";
import { AuthModal } from "@/components/auth-modal";
import { TemplateZoomModal } from "@/components/template-zoom-modal";
import { TemplateCard } from "@/components/template-card";
import { BannerAd } from "@/components/banner-ad";
import { PENDING_RESUME_KEY } from "./profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeMatcher Enterprise — 100% ATS Resume Matcher & Stealth Cloak" },
      {
        name: "description",
        content:
          "Transform candidate details into 100% ATS-shortlisted resumes. Features exact keyword extraction, invisible white-font ATS cloaking, Word (.doc) and vector PDF export with 25 FAANG templates.",
      },
      {
        property: "og:title",
        content: "ResumeMatcher Enterprise — 100% ATS Resume Matcher & Stealth Cloak",
      },
      {
        property: "og:description",
        content:
          "ATS match scoring, exact keyword infiltration, invisible white font cloaking, 25 world-class templates, Word and vector PDF downloads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://resumematcher.lovable.app/" }],
  }),
  component: Index,
});

const TONES = [
  { id: "impact", label: "Executive Impact (Recommended)" },
  { id: "concise", label: "Concise & Metric-Dense" },
  { id: "formal", label: "Traditional & Formal" },
] as const;

type Tone = (typeof TONES)[number]["id"];

const SAMPLE_PROFILE: Profile = {
  name: "Alex Chen",
  headline: "Senior Full-Stack & Distributed Systems Architect",
  email: "alex.chen@example.com",
  phone: "+1 (415) 890-2341",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexchen-dev",
  website: "alexchen.dev",
  about:
    "Engineering leader with 7+ years of experience designing and scaling web platforms, distributed microservices, and enterprise cloud infrastructure. Proven track record driving 99.99% uptime, spearheading multi-cloud migrations, and mentoring high-velocity product engineering squads.",
  roles: [
    {
      title: "Senior Full-Stack Engineer",
      company: "Starlight Technologies",
      dates: "2022 – Present",
      bullets:
        "Architected high-throughput web platform using React, TypeScript, and Node.js serving 800,000+ monthly active users.\nSpearheaded migration to microservices on AWS (ECS, Lambda, RDS PostgreSQL), reducing infrastructure latency by 42%.\nInstituted automated CI/CD deployment pipelines and comprehensive unit/integration test suites, increasing sprint release velocity by 35%.\nMentored 6 junior and mid-level engineers in system design, state management, and production debugging practices.",
    },
    {
      title: "Software Engineer",
      company: "Apex Cloud Systems",
      dates: "2019 – 2022",
      bullets:
        "Engineered scalable REST and GraphQL API services in Node.js and Python handling 10M+ daily transactions.\nDeveloped responsive, accessible UI component library adopted across 6 cross-functional product squads.\nCollaborated closely with product managers, UX designers, and QA engineers to deliver core customer-facing features on schedule.",
    },
  ],
  studies: [
    {
      qualification: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      dates: "2019",
    },
  ],
  skills:
    "React, TypeScript, JavaScript, Node.js, Next.js, Python, PostgreSQL, Redis, Docker, AWS, GraphQL, REST APIs, Tailwind CSS, Jest, CI/CD, Git, System Design",
  certifications: "AWS Certified Solutions Architect (Associate), 2023",
  customSections: [
    {
      id: "cs-projects-sample",
      title: "Key Projects & Systems",
      content: "",
      items: [
        {
          id: "item-1",
          name: "OpenSource Distributed Query Engine",
          subtitle: "Rust, WebAssembly, Vector DB",
          dates: "2023 – 2024",
          description:
            "Engineered an ultra-fast vector search indexing parser with 15,000+ GitHub stars.\nReduced query indexing overhead by 58% using custom memory-mapped SIMD routines.",
        },
        {
          id: "item-2",
          name: "Enterprise Developer Cloud CLI",
          subtitle: "TypeScript, Go, AWS ECS",
          dates: "2022 – 2023",
          description:
            "Created terminal deployment tooling adopted by 40+ engineering organizations.\nAutomated containerized rollouts, slashing staging test cycles from 45 min to under 6 min.",
        },
      ],
    },
  ],
};

const SAMPLE_JOBS = [
  {
    id: "fullstack",
    title: "Principal Full-Stack Engineer",
    company: "Fintech Scale-Up",
    text: `About the Role:
We are looking for a Principal Full-Stack Engineer to lead the architecture and development of our next-generation financial platform. You will build mission-critical features, scale distributed backend systems, and craft intuitive frontend experiences.

Key Responsibilities:
- Design, build, and maintain high-volume, reliable full-stack applications using React, TypeScript, and Node.js.
- Architect scalable backend microservices and databases using PostgreSQL, Redis, and cloud services (AWS).
- Drive engineering excellence through code reviews, automated testing (Jest, Cypress), and CI/CD best practices.
- Collaborate with product managers and designers to rapidly iterate on high-impact customer features.

Requirements:
- 5+ years of software development experience in modern web stacks.
- Strong proficiency with TypeScript, React, Node.js, and modern state management.
- Experience with cloud architecture (AWS/Docker), relational databases (PostgreSQL), and REST/GraphQL APIs.
- Passion for software craftsmanship, system scalability, and mentoring teammates.`,
  },
  {
    id: "frontend",
    title: "Lead Frontend Architect",
    company: "AI Cloud Platforms",
    text: `About the Role:
Seeking a Lead Frontend Engineer to drive our core enterprise web application architecture and UI design systems.

Responsibilities:
- Spearhead development of our complex web application using React 19, TypeScript, Next.js, and Tailwind CSS.
- Optimize frontend performance, web vitals, state management, and real-time data visualization.
- Partner with UX designers and backend engineers to build seamless, accessible user interfaces.
- Establish frontend testing standards, CI/CD pipelines, and maintain our enterprise design system.

Requirements:
- Deep expertise in TypeScript, React, modern web standards, and component libraries.
- Strong knowledge of performance profiling, bundle optimization, and automated testing.
- Track record of technical leadership and cross-functional collaboration.`,
  },
  {
    id: "product",
    title: "Technical Product Manager",
    company: "Cloud Infrastructure",
    text: `About the Role:
We are hiring an experienced Technical Product Manager to lead platform infrastructure and developer experience products.

Responsibilities:
- Define product vision, strategy, and roadmap for cloud platform services.
- Translate customer and engineering requirements into clear product specs and user stories.
- Partner with engineering leads to prioritize technical debt, architecture scalability, and feature delivery.
- Drive product metrics, user adoption, and cross-functional stakeholder communication.

Requirements:
- 4+ years in product management with a strong engineering or computer science background.
- Experience with APIs, cloud infrastructure, and agile methodologies.
- Exceptional analytical, problem-solving, and communication skills.`,
  },
];

const SECTION_PRESETS = [
  { label: "🚀 Key Projects & Systems", title: "Key Projects" },
  { label: "📜 Certifications & Credentials", title: "Certifications & Credentials" },
  { label: "🏆 Honors & Awards", title: "Awards & Honors" },
  { label: "🌐 Languages & Fluency", title: "Languages & Fluency" },
  { label: "🤝 Leadership & Community", title: "Leadership & Community" },
  { label: "💡 Custom Section...", title: "Additional Experience" },
];

function Index() {
  const { isSubscribed } = useSubscription();
  const { user, signOut } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [workspaceLayout, setWorkspaceLayout] = useState<"split" | "full">("split");
  const [inputMode, setInputMode] = useState<"form" | "paste">("form");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tone, setTone] = useState<Tone>("impact");
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reading, setReading] = useState(false);
  const [templateId, setTemplateId] = useState(TEMPLATES[0]!.id);
  const [templateFilter, setTemplateFilter] = useState<
    "all" | "free" | "pro" | "award" | "highest_rated"
  >("all");
  const [previewMode, setPreviewMode] = useState<"visual" | "text">("visual");
  const [coverLetter, setCoverLetter] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [tab, setTab] = useState("resume");

  // Zoom controls for the resume preview
  const [previewZoom, setPreviewZoom] = useState(100);

  // 100% ATS Shortlist Invisibility Cloak & X-Ray Mode
  const [stealthCloakActive, setStealthCloakActive] = useState(true);
  const [showXRay, setShowXRay] = useState(false);

  // Template Zoom Modal state
  const [zoomTemplate, setZoomTemplate] = useState<ResumeTemplate | null>(null);

  // Subscription modal state
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subReason, setSubReason] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    const savedProf = loadProfile();
    if (savedProf.name || savedProf.headline || savedProf.roles.some((r) => r.title)) {
      setProfile(savedProf);
      setResume(profileToResume(savedProf));
    }
    const pendingResume = sessionStorage.getItem(PENDING_RESUME_KEY);
    if (pendingResume) {
      setResume(pendingResume);
      setInputMode("paste");
      sessionStorage.removeItem(PENDING_RESUME_KEY);
      toast.success("Resume loaded from your profile.");
    }
  }, []);

  // Performance-optimized profile update: updates local UI instantly, debounces storage & resume generation
  const updateProfileField = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((curr) => {
      const next = { ...curr, [key]: value };
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        saveProfile(next);
        setResume(profileToResume(next));
      }, 250);
      return next;
    });
  }, []);

  // Custom sections handlers (fully featured)
  function handleAddSection(presetTitle = "Key Projects") {
    const id = `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSection: ProfileCustomSection = {
      id,
      title: presetTitle,
      content: "",
      items: [
        {
          id: `item-${Date.now()}`,
          name: presetTitle.includes("Project") ? "Key Project Name" : "Credential / Detail Name",
          subtitle: presetTitle.includes("Project")
            ? "Technologies, Architecture, Role"
            : "Issuing Organization / Context",
          dates: "2023 – Present",
          description:
            "Delivered impactful result with measurable business or technical metric.\nCollaborated with cross-functional leadership on implementation.",
        },
      ],
    };
    const updated = [...(profile.customSections || []), newSection];
    updateProfileField("customSections", updated);
    toast.success(`Added new section: "${presetTitle}"`);
  }

  function handleRemoveSection(sectionId: string) {
    const updated = (profile.customSections || []).filter((s) => s.id !== sectionId);
    updateProfileField("customSections", updated);
    toast.info("Section removed");
  }

  function handleUpdateSectionTitle(sectionId: string, newTitle: string) {
    const updated = (profile.customSections || []).map((s) =>
      s.id === sectionId ? { ...s, title: newTitle } : s,
    );
    updateProfileField("customSections", updated);
  }

  function handleAddItemToSection(sectionId: string) {
    const updated = (profile.customSections || []).map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newItem: CustomSectionItem = {
        id: `item-${Date.now()}`,
        name: "New Entry Title",
        subtitle: "Role, Stack or Issuer",
        dates: "2024",
        description: "Accomplishment or detail bullet point...",
      };
      return {
        ...sec,
        items: [...(sec.items || []), newItem],
      };
    });
    updateProfileField("customSections", updated);
    toast.success("Added new entry to section");
  }

  function handleUpdateSectionItem(
    sectionId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    value: string,
  ) {
    const updated = (profile.customSections || []).map((sec) => {
      if (sec.id !== sectionId) return sec;
      const items = (sec.items || []).map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      );
      return { ...sec, items };
    });
    updateProfileField("customSections", updated);
  }

  function handleRemoveSectionItem(sectionId: string, itemId: string) {
    const updated = (profile.customSections || []).map((sec) => {
      if (sec.id !== sectionId) return sec;
      const items = (sec.items || []).filter((item) => item.id !== itemId);
      return { ...sec, items };
    });
    updateProfileField("customSections", updated);
  }

  function handleLoadSampleDetails() {
    setProfile(SAMPLE_PROFILE);
    saveProfile(SAMPLE_PROFILE);
    setResume(profileToResume(SAMPLE_PROFILE));
    toast.success("Loaded full sample candidate profile (Alex Chen).");
  }

  function handleLoadSampleJob(sample: (typeof SAMPLE_JOBS)[number]) {
    setJob(sample.text);
    setJobTitle(sample.title);
    toast.success(`Loaded "${sample.title}" posting.`);
  }

  function handleLoadAllDemo() {
    handleLoadSampleDetails();
    handleLoadSampleJob(SAMPLE_JOBS[0]!);
    toast.success("Demo profile & job ready! Click 'Generate & Match Resume'.");
  }

  const ready = resume.trim().length > 30 && job.trim().length > 30 && !streaming;
  const text = result?.tailored_resume ?? draft;
  const deferredText = useDeferredValue(text);
  const template = useMemo(() => findTemplate(templateId), [templateId]);
  const applicant = useMemo(
    () => profile.name.trim() || parseResume(resume).name || "Alex Chen",
    [profile.name, resume],
  );

  const filteredTemplates = useMemo(() => {
    switch (templateFilter) {
      case "free":
        return TEMPLATES.filter((t) => t.isFree);
      case "pro":
        return TEMPLATES.filter((t) => !t.isFree);
      case "award":
        return TEMPLATES.filter((t) => t.tag === "award");
      case "highest_rated":
        return TEMPLATES.filter((t) => t.tag === "highest_rated");
      default:
        return TEMPLATES;
    }
  }, [templateFilter]);

  // Extract all target keywords from the job description for the 100% ATS Cloak
  const activeGhostKeywords = useMemo(() => {
    if (result?.ghost_keywords && result.ghost_keywords.length > 0) {
      return result.ghost_keywords;
    }
    if (result?.all_keywords && result.all_keywords.length > 0) {
      return result.all_keywords;
    }
    if (job.trim().length > 15) {
      return extractKeywords(job).all;
    }
    return [];
  }, [result, job]);

  async function onFile(file: File | null) {
    if (!file) return;
    setReading(true);
    try {
      const extracted = await extractFileText(file);
      setResume(extracted);
      setInputMode("paste");
      toast.success(`Extracted text from ${file.name}`);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not read that file.");
    } finally {
      setReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function tailor() {
    setStreaming(true);
    setError(null);
    setResult(null);
    setDraft("");
    setCoverLetter("");
    setEntryId(null);
    setTab("resume");
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job, tone }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Something went wrong while tailoring your resume.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        setDraft(extractPartialString(raw, "tailored_resume"));
      }

      const parsed = parseTailorResult(raw);
      if (!parsed || !parsed.tailored_resume.trim()) {
        throw new Error("Empty result returned. Please check the text and try again.");
      }
      setResult(parsed);

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const derivedTitle = jobTitle || deriveTitle(job);
      setEntryId(id);
      setHistory(
        saveEntry({
          id,
          createdAt: Date.now(),
          title: derivedTitle,
          tone,
          resume,
          job,
          result: parsed,
          templateId,
        }),
      );
      toast.success("Resume tailored successfully!");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unexpected error.");
    } finally {
      setStreaming(false);
    }
  }

  async function writeCoverLetter() {
    if (!result) return;
    setCoverBusy(true);
    setCoverLetter("");
    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: result.tailored_resume, job, tone, applicant }),
      });
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not generate cover letter.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let out = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        out += decoder.decode(value, { stream: true });
        setCoverLetter(out);
      }
      if (entryId) setHistory(updateEntry(entryId, { coverLetter: out }));
      toast.success("Cover letter generated!");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unexpected error.");
    } finally {
      setCoverBusy(false);
    }
  }

  function applyFix(fix: KeywordFix) {
    if (!fix.original_snippet) return;
    const index = resume.indexOf(fix.original_snippet);
    if (index === -1) {
      navigator.clipboard.writeText(fix.suggestion);
      toast.success("Suggested wording copied — paste it where it fits.");
      return;
    }
    setResume(
      resume.slice(0, index) + fix.suggestion + resume.slice(index + fix.original_snippet.length),
    );
    toast.success("Applied to your resume. Click 'Generate & Match Resume' to refresh your score.");
  }

  // Word Format Download (Free for first 5 templates, Free for all if subscribed)
  const handleDownloadWord = useCallback(
    (chosenTemplate: ResumeTemplate = template) => {
      if (!text) return;
      if (!chosenTemplate.isFree && !isSubscribed) {
        setSubReason(
          `"${chosenTemplate.name}" is one of our 20 Executive Pro templates. Subscribe to unlock all 25 templates!`,
        );
        setSubModalOpen(true);
        return;
      }
      const kws =
        stealthCloakActive && activeGhostKeywords.length > 0 ? activeGhostKeywords : undefined;
      downloadResumeWord(text, chosenTemplate, applicant, kws);
      toast.success(
        `Downloaded "${chosenTemplate.name}" in Word (.doc) format ${
          kws ? "with 100% ATS Stealth Cloak" : ""
        }.`,
      );
    },
    [text, isSubscribed, template, applicant, stealthCloakActive, activeGhostKeywords],
  );

  // PDF Download (Requires subscription for all templates)
  const handleDownloadPdf = useCallback(
    async (chosenTemplate: ResumeTemplate = template) => {
      if (!text) return;
      if (!isSubscribed) {
        setSubReason(
          "To download PDF format, an active subscription is required. Free users can select the first 5 templates and download in Word (.doc) format anytime.",
        );
        setSubModalOpen(true);
        return;
      }
      const kws =
        stealthCloakActive && activeGhostKeywords.length > 0 ? activeGhostKeywords : undefined;
      await printHtmlDocument(renderResumeHtml(text, chosenTemplate, applicant, kws, false));
    },
    [text, isSubscribed, template, applicant, stealthCloakActive, activeGhostKeywords],
  );

  // Select a template
  const handleSelectTemplate = useCallback(
    (item: ResumeTemplate) => {
      if (!item.isFree && !isSubscribed) {
        setSubReason(
          `"${item.name}" is an Executive Pro exclusive template. Free users can select the first 5 templates. Upgrade to Pro to unlock all 25 world-class templates!`,
        );
        setSubModalOpen(true);
        return;
      }
      setTemplateId(item.id);
      if (entryId) setHistory(updateEntry(entryId, { templateId: item.id }));
      setTab("resume");
      setPreviewMode("visual");
      toast.success(`Switched to "${item.name}" template`);
    },
    [isSubscribed, entryId],
  );

  async function downloadCoverPdf() {
    if (!coverLetter) return;
    if (!isSubscribed) {
      setSubReason("PDF export for cover letters requires an active Enterprise Pro subscription.");
      setSubModalOpen(true);
      return;
    }
    await printHtmlDocument(
      renderResumeHtml(
        `${applicant}\n\nCOVER LETTER\n${coverLetter}`,
        template,
        applicant || "Cover letter",
      ),
    );
  }

  async function downloadReport() {
    if (!result) return;
    if (!isSubscribed) {
      setSubReason("Executive Match Report PDF is an Enterprise Pro feature.");
      setSubModalOpen(true);
      return;
    }
    await printHtmlDocument(
      renderMatchReportHtml(result, {
        role: jobTitle || deriveTitle(job),
        tone,
        when: new Date().toLocaleString(),
      }),
    );
  }

  function restore(entry: HistoryEntry) {
    setResume(entry.resume);
    setJob(entry.job);
    setJobTitle(entry.title);
    setTone(entry.tone as Tone);
    setResult(entry.result);
    setDraft("");
    setCoverLetter(entry.coverLetter ?? "");
    setEntryId(entry.id);
    if (entry.templateId) setTemplateId(entry.templateId);
    setTab("resume");
    toast.success("Version restored");
  }

  async function copyResume() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Tailored resume copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${applicant.toLowerCase().replace(/\s+/g, "-")}-tailored-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased">
      <Toaster position="top-right" />

      {/* Supabase Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authModalMode}
        onSuccess={(_userId) => {
          if (!isSubscribed) {
            setSubModalOpen(true);
          }
        }}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        open={subModalOpen}
        onOpenChange={setSubModalOpen}
        featureReason={subReason}
      />

      {/* Template Full-Page High-Res Zoom Modal */}
      <TemplateZoomModal
        template={zoomTemplate}
        resumeText={text || resume || profileToResume(SAMPLE_PROFILE)}
        applicant={applicant}
        isSubscribed={isSubscribed}
        onClose={() => setZoomTemplate(null)}
        onSelect={handleSelectTemplate}
        onDownloadWord={handleDownloadWord}
        onDownloadPdf={handleDownloadPdf}
      />

      <div>
        {/* Modern Minimal Header */}
        <header className="border-b border-border/70 bg-card/85 backdrop-blur-md sticky top-0 z-40">
          <div className="w-full max-w-[1740px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 h-14">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs">
                <Sparkles className="size-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-base tracking-tight">
                  ResumeMatcher
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/15">
                  25 Templates
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Workspace Layout Toggle */}
              <div className="hidden md:inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setWorkspaceLayout("split")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    workspaceLayout === "split"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Split View"
                >
                  <Columns className="size-3.5" /> Split
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceLayout("full")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    workspaceLayout === "full"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Full Width Editor"
                >
                  <Maximize className="size-3.5" /> Full Width
                </button>
              </div>

              {/* User Account / Auth State */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 py-1 px-2.5 text-xs">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-foreground max-w-[130px] truncate">
                      {user.email}
                    </span>
                    {isSubscribed && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        PRO
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await signOut();
                      toast.info("Signed out successfully.");
                    }}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSubscribed ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1 px-2.5 gap-1 shadow-xs">
                      <Crown className="size-3.5 fill-current" /> Pro Active
                    </Badge>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSubReason(
                            "Free tier includes 5 templates & Word (.doc) export. Subscribe to unlock all 25 world-class templates and vector PDF exports!",
                          );
                          setSubModalOpen(true);
                        }}
                        className="h-8 text-xs font-semibold px-3 gap-1 shadow-xs"
                      >
                        <Crown className="size-3.5 text-amber-300" /> Upgrade to Pro
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode("sign_in");
                          setAuthModalOpen(true);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 transition-colors"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadAllDemo}
                className="h-8 border-border/70 hover:bg-accent text-xs font-medium px-2.5"
              >
                <Sparkles className="size-3.5 text-primary mr-1" /> Demo
              </Button>

              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium px-2.5">
                <Link to="/profile">
                  <UserRound className="size-3.5 mr-1" /> Profile
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Wide Full-Width Fluid Container (No Wasted Empty Margins on Laptops) */}
        <div className="w-full max-w-[1740px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
          {/* Clear CTA & Trust Hero Banner */}
          <div className="mb-6 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" /> 100% ATS SHORTLIST GUARANTEE
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-xs font-semibold text-foreground">
                    25 FAANG &amp; Big Tech Templates
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-xs text-muted-foreground">
                    Word (.doc) &amp; Vector PDF
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  Match Your Resume &amp; Infiltrate Automated ATS Filters
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Extract exact technical keywords from any job posting, weave them into executive
                  accomplishment bullets, and activate the{" "}
                  <strong className="text-foreground">ATS Stealth Cloak™</strong> (white-font
                  keyword injection) to guarantee a 100% bot match.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  onClick={handleLoadAllDemo}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold px-3"
                >
                  <Sparkles className="size-3.5 mr-1.5 text-primary" /> Load Sample Job &amp;
                  Candidate
                </Button>
                <Button
                  onClick={() => {
                    if (!resume.trim() || !job.trim()) {
                      handleLoadAllDemo();
                    }
                    outputRef.current?.scrollIntoView({ behavior: "smooth" });
                    if (ready) tailor();
                  }}
                  size="sm"
                  className="h-9 text-xs font-bold px-4 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start ATS Optimization <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Grid: Fills the entire laptop display effortlessly */}
          <div
            className={
              workspaceLayout === "split"
                ? "grid gap-7 lg:grid-cols-12 items-start"
                : "space-y-8 w-full"
            }
          >
            {/* Left Workspace Column: Inputs & Job Target */}
            <section
              className={
                workspaceLayout === "split"
                  ? "lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6"
                  : "space-y-6 w-full max-w-[1400px] mx-auto"
              }
            >
              {/* Step 1: Career Details & FULL Custom Section Builder */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      Candidate Career Details
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInputMode("form")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        inputMode === "form"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("paste")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        inputMode === "paste"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      Paste / PDF
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadSampleDetails}
                      className="h-7 px-2 text-xs text-primary hover:bg-primary/10 font-semibold"
                    >
                      <Sparkles className="size-3 mr-1" /> Demo Data
                    </Button>
                  </div>
                </div>

                {inputMode === "form" ? (
                  <div className="space-y-5">
                    {/* Basic Contact Info */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          Full Name
                        </span>
                        <Input
                          value={profile.name}
                          onChange={(e) => updateProfileField("name", e.target.value)}
                          placeholder="Alex Chen"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          Target Title / Headline
                        </span>
                        <Input
                          value={profile.headline}
                          onChange={(e) => updateProfileField("headline", e.target.value)}
                          placeholder="Senior Full-Stack Architect"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          Email Address
                        </span>
                        <Input
                          value={profile.email}
                          onChange={(e) => updateProfileField("email", e.target.value)}
                          placeholder="alex.chen@example.com"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          Phone & Location
                        </span>
                        <Input
                          value={
                            profile.phone
                              ? `${profile.phone} | ${profile.location}`
                              : profile.location
                          }
                          onChange={(e) => updateProfileField("location", e.target.value)}
                          placeholder="+1 (415) 890-2341 | San Francisco, CA"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          LinkedIn Profile URL
                        </span>
                        <Input
                          value={profile.linkedin}
                          onChange={(e) => updateProfileField("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/alexchen-dev"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-foreground">
                          Website / Portfolio
                        </span>
                        <Input
                          value={profile.website}
                          onChange={(e) => updateProfileField("website", e.target.value)}
                          placeholder="alexchen.dev"
                          className="h-10 text-sm bg-background"
                        />
                      </label>
                    </div>

                    {/* Executive Summary */}
                    <label className="block border-t border-border/80 pt-3">
                      <span className="mb-1 block text-xs font-bold text-foreground">
                        Executive Summary
                      </span>
                      <Textarea
                        value={profile.about}
                        onChange={(e) => updateProfileField("about", e.target.value)}
                        placeholder="Brief overview of your experience, leadership, and accomplishments."
                        className="min-h-20 resize-y bg-background text-sm leading-relaxed p-3"
                      />
                    </label>

                    {/* Work Experience */}
                    <div className="space-y-3 border-t border-border/80 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Briefcase className="size-3.5 text-primary" /> Work Experience
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-semibold px-2.5 border-border"
                          onClick={() =>
                            updateProfileField("roles", [
                              ...profile.roles,
                              {
                                ...emptyRole,
                                title: "Software Engineer",
                                company: "Company Name",
                                dates: "2021 – Present",
                              },
                            ])
                          }
                        >
                          <Plus className="size-3 mr-1" /> Add Role
                        </Button>
                      </div>
                      {profile.roles.map((role, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border bg-background/50 p-3 space-y-2.5 shadow-2xs"
                        >
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              value={role.title}
                              onChange={(e) =>
                                updateProfileField(
                                  "roles",
                                  profile.roles.map((r, i) =>
                                    i === idx ? { ...r, title: e.target.value } : r,
                                  ),
                                )
                              }
                              placeholder="Job Title"
                              className="h-9 text-xs bg-background"
                            />
                            <Input
                              value={role.company}
                              onChange={(e) =>
                                updateProfileField(
                                  "roles",
                                  profile.roles.map((r, i) =>
                                    i === idx ? { ...r, company: e.target.value } : r,
                                  ),
                                )
                              }
                              placeholder="Company"
                              className="h-9 text-xs bg-background"
                            />
                            <Input
                              value={role.dates}
                              onChange={(e) =>
                                updateProfileField(
                                  "roles",
                                  profile.roles.map((r, i) =>
                                    i === idx ? { ...r, dates: e.target.value } : r,
                                  ),
                                )
                              }
                              placeholder="2022 – Present"
                              className="h-9 text-xs bg-background"
                            />
                          </div>
                          <Textarea
                            value={role.bullets}
                            onChange={(e) =>
                              updateProfileField(
                                "roles",
                                profile.roles.map((r, i) =>
                                  i === idx ? { ...r, bullets: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="Accomplishments bullets (one per line) — lead with measurable impact."
                            className="min-h-20 resize-y bg-background text-xs leading-relaxed p-2.5"
                          />
                          {profile.roles.length > 1 && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  updateProfileField(
                                    "roles",
                                    profile.roles.filter((_, i) => i !== idx),
                                  )
                                }
                                className="text-[11px] font-medium text-muted-foreground hover:text-destructive flex items-center gap-1"
                              >
                                <Trash2 className="size-3" /> Remove role
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Technical Skills */}
                    <label className="block border-t border-border/80 pt-3">
                      <span className="mb-1 block text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Wrench className="size-3.5 text-primary" /> Technical & Domain Skills
                      </span>
                      <Textarea
                        value={profile.skills}
                        onChange={(e) => updateProfileField("skills", e.target.value)}
                        placeholder="React, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker, GraphQL, System Design..."
                        className="min-h-16 resize-y bg-background text-xs leading-relaxed p-2.5"
                      />
                    </label>

                    {/* Education */}
                    <div className="space-y-2 border-t border-border/80 pt-3">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-primary" /> Education
                      </span>
                      {profile.studies.map((study, idx) => (
                        <div key={idx} className="grid gap-2 sm:grid-cols-3">
                          <Input
                            value={study.qualification}
                            onChange={(e) =>
                              updateProfileField(
                                "studies",
                                profile.studies.map((s, i) =>
                                  i === idx ? { ...s, qualification: e.target.value } : s,
                                ),
                              )
                            }
                            placeholder="Degree / B.S."
                            className="h-9 text-xs bg-background"
                          />
                          <Input
                            value={study.school}
                            onChange={(e) =>
                              updateProfileField(
                                "studies",
                                profile.studies.map((s, i) =>
                                  i === idx ? { ...s, school: e.target.value } : s,
                                ),
                              )
                            }
                            placeholder="University / College"
                            className="h-9 text-xs bg-background"
                          />
                          <Input
                            value={study.dates}
                            onChange={(e) =>
                              updateProfileField(
                                "studies",
                                profile.studies.map((s, i) =>
                                  i === idx ? { ...s, dates: e.target.value } : s,
                                ),
                              )
                            }
                            placeholder="2019"
                            className="h-9 text-xs bg-background"
                          />
                        </div>
                      ))}
                    </div>

                    {/* FULLY STRUCTURED CUSTOM SECTIONS BUILDER */}
                    <div className="space-y-3.5 border-t border-border/80 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Layers className="size-3.5 text-primary" /> Custom Resume Sections
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Add projects, credentials, awards & tabs
                        </span>
                      </div>

                      {/* Active Custom Sections */}
                      {(profile.customSections || []).map((section) => (
                        <div
                          key={section.id}
                          className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3 shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase text-primary">
                                Section:
                              </span>
                              <Input
                                value={section.title}
                                onChange={(e) =>
                                  handleUpdateSectionTitle(section.id, e.target.value)
                                }
                                placeholder="Section Title (e.g., Key Projects)"
                                className="h-8 text-xs font-bold bg-background max-w-xs border-primary/30"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] font-semibold bg-background"
                                onClick={() => handleAddItemToSection(section.id)}
                              >
                                <Plus className="size-3 mr-1" /> Add Entry
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSection(section.id)}
                                className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                              >
                                <Trash2 className="size-3" /> Remove
                              </button>
                            </div>
                          </div>

                          {/* Items inside this section */}
                          {section.items && section.items.length > 0 ? (
                            <div className="space-y-3">
                              {section.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg border border-border bg-background p-3 space-y-2"
                                >
                                  <div className="grid gap-2 sm:grid-cols-3">
                                    <Input
                                      value={item.name}
                                      onChange={(e) =>
                                        handleUpdateSectionItem(
                                          section.id,
                                          item.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Entry / Project Name"
                                      className="h-8 text-xs"
                                    />
                                    <Input
                                      value={item.subtitle || ""}
                                      onChange={(e) =>
                                        handleUpdateSectionItem(
                                          section.id,
                                          item.id,
                                          "subtitle",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Tech Stack / Role / Issuer"
                                      className="h-8 text-xs"
                                    />
                                    <Input
                                      value={item.dates || ""}
                                      onChange={(e) =>
                                        handleUpdateSectionItem(
                                          section.id,
                                          item.id,
                                          "dates",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Dates / Year"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <Textarea
                                    value={item.description || ""}
                                    onChange={(e) =>
                                      handleUpdateSectionItem(
                                        section.id,
                                        item.id,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Accomplishment bullets or details..."
                                    className="min-h-16 text-xs p-2"
                                  />
                                  {section.items!.length > 1 && (
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSectionItem(section.id, item.id)}
                                        className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                                      >
                                        <Trash2 className="size-3" /> Remove entry
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Textarea
                              value={section.content}
                              onChange={(e) => {
                                const updated = (profile.customSections || []).map((s) =>
                                  s.id === section.id ? { ...s, content: e.target.value } : s,
                                );
                                updateProfileField("customSections", updated);
                              }}
                              placeholder="Enter accomplishments or bullets (one per line)..."
                              className="min-h-20 text-xs p-2 bg-background"
                            />
                          )}
                        </div>
                      ))}

                      {/* Quick Presets for Custom Sections */}
                      <div className="rounded-lg border border-dashed border-border p-3 bg-muted/40">
                        <span className="text-xs font-semibold text-foreground block mb-2">
                          + Add a New Section:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {SECTION_PRESETS.map((preset) => (
                            <button
                              key={preset.title}
                              type="button"
                              onClick={() => handleAddSection(preset.title)}
                              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {resume.trim().length} characters
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                      >
                        {reading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Upload className="size-3.5" />
                        )}
                        Upload Existing Resume (PDF / TXT)
                      </button>
                    </div>
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.txt,.md,application/pdf,text/plain"
                      className="hidden"
                      onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    />
                    <Textarea
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste your full resume text here..."
                      className="min-h-64 resize-y bg-background text-xs leading-relaxed p-3"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Target Job Description */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      Target Job Description{" "}
                      {jobTitle && <span className="text-primary font-medium">· {jobTitle}</span>}
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{job.trim().length} chars</span>
                </div>

                {/* Sample job quick buttons */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Sample:</span>
                  {SAMPLE_JOBS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSampleJob(sample)}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>

                <Textarea
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="Paste the target job description here (requirements, qualifications, tech stack)..."
                  className="min-h-40 resize-y bg-background text-xs leading-relaxed p-3"
                />

                {/* Tone Selection */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="text-xs font-bold text-foreground mr-1">Tone:</span>
                  {TONES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTone(option.id)}
                      className={`rounded-md border px-3 py-1 text-xs font-semibold transition-all ${
                        tone === option.id
                          ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Submit Action Button */}
                <Button
                  size="lg"
                  className="mt-5 w-full h-12 text-base font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  disabled={!ready}
                  onClick={tailor}
                >
                  {streaming ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" /> Tailoring & Scoring Resume…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-5 text-amber-300" /> Generate & Match Resume{" "}
                      <ArrowRight className="ml-1.5 size-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Sidebar Corporate Banner Ad (Placed in left column) */}
              <BannerAd
                variant="sidebar"
                onUpgradeClick={() => {
                  setSubReason(
                    "Upgrade to Enterprise Pro to remove all sponsor banners and unlock all 25 templates.",
                  );
                  setSubModalOpen(true);
                }}
              />

              {/* Saved Generations History */}
              {history.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <h3 className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <HistoryIcon className="size-3.5 text-muted-foreground" /> Saved Generations (
                      {history.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setHistory(clearHistory())}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="mt-2 divide-y divide-border/60">
                    {history.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                        <button
                          type="button"
                          onClick={() => restore(entry)}
                          className="min-w-0 flex-1 text-left group"
                        >
                          <p className="truncate text-xs font-bold text-foreground group-hover:text-primary">
                            {entry.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatWhen(entry.createdAt)} ·{" "}
                            <span className="text-primary font-bold">
                              {entry.result.match_score}/100
                            </span>{" "}
                            · {entry.tone}
                          </p>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete entry"
                          onClick={() => setHistory(deleteEntry(entry.id))}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Right Workspace Column: Tailored Resume & 25 Templates Showcase */}
            <section
              ref={outputRef}
              className={
                workspaceLayout === "split"
                  ? "lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-6"
                  : "space-y-6 w-full max-w-[1400px] mx-auto"
              }
            >
              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* Empty state when no resume generated yet: Clean Minimalist View with Banner Ad */}
              {!text && !error && (
                <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card/60 p-8 text-center shadow-xs">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <Award className="size-9" />
                  </div>
                  <h3 className="mt-4 text-xl sm:text-2xl font-bold text-foreground">
                    Your Tailored Executive Resume Lands Here
                  </h3>
                  <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Fill in candidate details on the left, paste a target job posting, and click
                    Generate. The AI scores keywords, matches competencies, and renders 25
                    templates.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2.5 justify-center">
                    <Button onClick={handleLoadAllDemo} size="sm" className="font-medium text-xs">
                      <Sparkles className="mr-1.5 size-3.5 text-amber-300" /> Try with Demo Data
                    </Button>
                  </div>
                </div>
              )}

              {text && (
                <>
                  {/* ATS Match Score Header Card */}
                  {result && (
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            ATS Target Match Fit
                          </span>
                          <h2 className="text-lg sm:text-xl font-bold text-foreground">
                            {jobTitle || deriveTitle(job)}
                          </h2>
                        </div>
                        <div className="text-right">
                          <span className="text-4xl font-extrabold text-primary">
                            {result.match_score}
                          </span>
                          <span className="text-sm font-bold text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-blue-600 transition-all duration-700"
                          style={{ width: `${result.match_score}%` }}
                        />
                      </div>
                      {result.missing_keywords.length > 0 && (
                        <div className="mt-3.5 border-t border-border/60 pt-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Target Keywords to Highlight:
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {result.missing_keywords.map((kw) => (
                              <Badge
                                key={kw}
                                variant="secondary"
                                className="text-xs font-medium px-2 py-0.5"
                              >
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadWord(template)}
                          className="h-8 border-border text-foreground hover:bg-accent font-bold text-xs"
                        >
                          <FileDown className="size-3.5 mr-1 text-blue-600" /> Word (.doc) Free
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadPdf(template)}
                          disabled={streaming}
                          className="h-8 bg-primary hover:bg-primary/90 font-bold text-xs text-primary-foreground"
                        >
                          <Download className="size-3.5 mr-1" />
                          {isSubscribed ? "Download PDF" : "Download PDF (Pro)"}
                          {!isSubscribed && <Lock className="size-3 ml-1 text-amber-300" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadReport}
                          className="h-8 text-xs font-semibold"
                        >
                          Match Report PDF
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ⚡ 100% ATS SHORTLIST SECRET WEAPON: GHOST KEYWORDS (WHITE-FONT INJECTION) */}
                  <div className="rounded-2xl border-2 border-emerald-500/35 bg-emerald-500/5 p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                              ⚡ ATS Stealth Cloak™ (White-Font Keyword Infiltration)
                            </h3>
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] py-0.5 px-2">
                              100% BOT SHORTLIST GUARANTEE
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                            Injects all target job keywords in invisible white font (
                            <code className="font-mono text-emerald-600 dark:text-emerald-400">
                              #ffffff
                            </code>
                            ). Human recruiters see a clean, professional resume with zero clutter,
                            while automated ATS bots (Workday, Greenhouse, Taleo, Lever) parse a
                            100% keyword match.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <Button
                          type="button"
                          variant={showXRay ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowXRay(!showXRay)}
                          className="h-8 text-xs font-semibold gap-1.5"
                        >
                          <Eye className="size-3.5" />
                          {showXRay ? "Hide X-Ray" : "X-Ray View (Reveal)"}
                        </Button>

                        <div className="flex items-center gap-2 pl-2 border-l border-border/70">
                          <span className="text-xs font-semibold text-foreground">
                            {stealthCloakActive ? "Armed" : "Disabled"}
                          </span>
                          <Switch
                            checked={stealthCloakActive}
                            onCheckedChange={setStealthCloakActive}
                            aria-label="Toggle ATS Stealth Cloak"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Keywords Pill List */}
                    {stealthCloakActive && activeGhostKeywords.length > 0 && (
                      <div className="pt-2.5 border-t border-emerald-500/20">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                            Target Keywords Armed ({activeGhostKeywords.length} terms):
                          </span>
                          <span className="text-muted-foreground">
                            {showXRay ? "Revealed in preview below" : "Invisible to human eye"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                          {activeGhostKeywords.slice(0, 25).map((kw, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 font-mono"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                          {activeGhostKeywords.length > 25 && (
                            <span className="text-[10px] text-muted-foreground py-0.5 px-1 font-medium">
                              +{activeGhostKeywords.length - 25} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tabs: Resume, 25 Templates, Gaps, Cover Letter */}
                  <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 h-11 bg-muted/80 p-1 rounded-lg">
                      <TabsTrigger value="resume" className="text-xs font-bold">
                        🎯 Tailored Resume
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="text-xs font-bold">
                        🎨 25 Templates
                      </TabsTrigger>
                      <TabsTrigger value="original" className="text-xs font-bold">
                        🔍 Gaps & Fixes
                      </TabsTrigger>
                      <TabsTrigger value="cover" className="text-xs font-bold">
                        ✉️ Cover Letter
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: TAILORED RESUME PREVIEW WITH ZOOM CONTROLS */}
                    <TabsContent value="resume" className="mt-4 space-y-4">
                      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                        {/* Sub-header Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 sm:px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              Template: <span className="text-primary">{template.name}</span>
                            </span>
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">
                              ({template.badge})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Toggle Preview Mode */}
                            <div className="mr-1 inline-flex rounded-md border border-border bg-background p-0.5">
                              <button
                                type="button"
                                onClick={() => setPreviewMode("visual")}
                                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                                  previewMode === "visual"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Eye className="size-3" /> Visual
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewMode("text")}
                                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                                  previewMode === "text"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <FileText className="size-3" /> Plain Text
                              </button>
                            </div>

                            {/* Zoom Controls for Visual Preview */}
                            {previewMode === "visual" && (
                              <div className="inline-flex items-center rounded-md border border-border bg-background p-0.5 gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => setPreviewZoom((z) => Math.max(70, z - 15))}
                                  title="Zoom Out"
                                >
                                  <ZoomOut className="size-3" />
                                </Button>
                                <span className="text-[11px] font-bold px-1 min-w-[36px] text-center">
                                  {previewZoom}%
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                                  title="Zoom In"
                                >
                                  <ZoomIn className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => setZoomTemplate(template)}
                                  title="Open Fullscreen Zoom Modal"
                                >
                                  <Maximize2 className="size-3" />
                                </Button>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyResume}
                              disabled={streaming}
                              className="h-8 text-xs font-semibold"
                            >
                              {copied ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}{" "}
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadWord(template)}
                              disabled={streaming}
                              className="h-8 text-xs font-bold text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                            >
                              <FileDown className="size-3.5 mr-1" /> Word Free
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPdf(template)}
                              disabled={streaming}
                              className="h-8 text-xs font-bold"
                            >
                              <Download className="size-3.5 mr-1" /> PDF
                              {!isSubscribed && <Lock className="size-3 ml-1 text-amber-300" />}
                            </Button>
                          </div>
                        </div>

                        {/* Visual Preview Canvas */}
                        {previewMode === "visual" ? (
                          <div className="relative bg-slate-200/50 dark:bg-slate-950/50 p-4 sm:p-6 flex justify-center overflow-auto max-h-[720px]">
                            <div
                              style={{
                                transform: `scale(${previewZoom / 100})`,
                                transformOrigin: "top center",
                                transition: "transform 0.15s ease",
                              }}
                              className="w-[850px] min-h-[1100px] bg-white shadow-xl rounded-sm overflow-hidden mb-12"
                            >
                              <iframe
                                title="Tailored Resume Live Preview"
                                srcDoc={renderResumeHtml(
                                  deferredText,
                                  template,
                                  applicant,
                                  stealthCloakActive && activeGhostKeywords.length > 0
                                    ? activeGhostKeywords
                                    : undefined,
                                  showXRay,
                                )}
                                className="w-[850px] h-[1100px] border-0"
                              />
                            </div>
                          </div>
                        ) : (
                          <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-xs sm:text-sm leading-relaxed text-foreground bg-card">
                            {text}
                            {streaming && (
                              <span className="ml-1 inline-block size-2 animate-pulse bg-primary" />
                            )}
                          </pre>
                        )}
                      </div>

                      {/* What changed explanation */}
                      {result && result.changes.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Check className="size-3.5 text-emerald-500" /> Strategic Optimizations
                            Made
                          </h3>
                          <ul className="mt-2.5 space-y-1.5">
                            {result.changes.map((change, idx) => (
                              <li
                                key={idx}
                                className="flex gap-2 text-xs sm:text-sm leading-relaxed text-foreground"
                              >
                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>

                    {/* TAB 2: 25 WORLD-CLASS TEMPLATES SHOWCASE */}
                    <TabsContent value="templates" className="mt-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">
                              25 Award-Winning FAANG & Big Tech Templates
                            </h3>
                            <Badge variant="secondary" className="text-[10px] font-semibold px-2">
                              Top 25
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Verified formats used by Staff & Principal hires at Google, Meta, Apple,
                            Amazon, Netflix, Stripe, and OpenAI. First 5 are Free (Word .doc).
                          </p>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTemplateFilter("all")}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                              templateFilter === "all"
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            All 25
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateFilter("free")}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                              templateFilter === "free"
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            Free (First 5)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateFilter("pro")}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                              templateFilter === "pro"
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            ⭐ Pro Exclusive (20)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateFilter("award")}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                              templateFilter === "award"
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            🏆 Award Winners
                          </button>
                        </div>
                      </div>

                      {/* Memoized, Fast-Rendering 25 Template Cards Grid */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {filteredTemplates.map((item) => (
                          <TemplateCard
                            key={item.id}
                            template={item}
                            isSelected={item.id === templateId}
                            isSubscribed={isSubscribed}
                            resumeText={deferredText || resume}
                            applicant={applicant}
                            onSelect={handleSelectTemplate}
                            onDownloadWord={handleDownloadWord}
                            onDownloadPdf={handleDownloadPdf}
                            onZoom={setZoomTemplate}
                          />
                        ))}
                      </div>
                    </TabsContent>

                    {/* TAB 3: ORIGINAL GAPS & INLINE FIXES */}
                    <TabsContent value="original" className="mt-4">
                      <HighlightedResume
                        resume={resume}
                        fixes={result?.keyword_fixes ?? []}
                        onApply={applyFix}
                      />
                    </TabsContent>

                    {/* TAB 4: COVER LETTER */}
                    <TabsContent value="cover" className="mt-4 space-y-4">
                      <div className="rounded-xl border border-border bg-card shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              Matched Cover Letter
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Tailored to {jobTitle || "the target role"}.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={writeCoverLetter}
                              disabled={!result || coverBusy}
                              className="h-8 text-xs font-semibold"
                            >
                              {coverBusy ? (
                                <Loader2 className="size-3.5 animate-spin mr-1" />
                              ) : (
                                <Sparkles className="size-3.5 mr-1" />
                              )}
                              {coverLetter ? "Regenerate" : "Generate Cover Letter"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={downloadCoverPdf}
                              disabled={!coverLetter || coverBusy}
                              className="h-8 text-xs font-semibold"
                            >
                              <Download className="size-3.5 mr-1" /> PDF
                              {!isSubscribed && <Lock className="size-3 ml-1 text-amber-400" />}
                            </Button>
                          </div>
                        </div>
                        <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-xs sm:text-sm leading-relaxed text-foreground">
                          {coverLetter ||
                            "Click 'Generate Cover Letter' to write a personalized letter aligned with this job posting."}
                          {coverBusy && (
                            <span className="ml-1 inline-block size-2 animate-pulse bg-primary" />
                          )}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Corporate Sticky / Bottom Banner Ad */}
      <BannerAd
        variant="bottom"
        className="mt-12"
        onUpgradeClick={() => {
          setSubReason("Upgrade to Pro to remove all sponsor banners.");
          setSubModalOpen(true);
        }}
      />

      {/* Social Share Referral Widget */}
      <div className="w-full max-w-[1740px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-12">
        <SocialShare score={result?.match_score || 100} roleTitle={jobTitle || deriveTitle(job)} />
      </div>

      {/* Comprehensive FAQ Section */}
      <FaqSection className="mt-14 border-t border-border/70 bg-card/30" />

      {/* Modern Enterprise Footer */}
      <footer className="border-t border-border/80 bg-card/60 backdrop-blur-xs py-12 text-foreground">
        <div className="w-full max-w-[1740px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
                  RM
                </div>
                <span className="font-bold text-base tracking-tight">ResumeMatcher Enterprise</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The premier ATS resume matcher and keyword infiltration engine. Built strictly
                around Big Tech and FAANG hiring formulas with 25 executive templates.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>GDPR &amp; CCPA Compliant • Bank-grade Security</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Document Studio
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ATS Resume Matcher &amp; Tailor
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Candidate Career Profile
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("templates");
                      outputRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    25 FAANG Resume Templates
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("cover");
                      outputRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Executive Cover Letter Studio
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Legal &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy (GDPR / CCPA)
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    30-Day Money-Back Guarantee
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSubReason("Upgrade to Pro for high-res vector PDFs & 25 templates.");
                      setSubModalOpen(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Enterprise Pro Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                100% Shortlist Weapon
              </h4>
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ATS Stealth Cloak™ Active
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Automatic white-font injection guarantees 100% ATS token indexing across Workday,
                  Greenhouse, Lever, Taleo, and iCIMS.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 ResumeMatcher Enterprise Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground underline">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground underline">
                Terms
              </Link>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-foreground underline"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
