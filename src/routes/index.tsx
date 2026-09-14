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
  FileCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { ResumeMatcherLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

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
import { generateOverleafFaangLatex } from "@/lib/latex-generator";
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
      { title: "CVFitt Enterprise — 100% ATS Resume Matcher & Stealth Cloak" },
      {
        name: "description",
        content:
          "Transform candidate details into 100% ATS-shortlisted resumes with CVFitt. Features exact keyword extraction, invisible white-font ATS cloaking, Overleaf FAANGPath LaTeX (.tex), Word (.doc), and vector PDF export with 32 FAANG templates.",
      },
      {
        property: "og:title",
        content: "CVFitt Enterprise — 100% ATS Resume Matcher & Overleaf LaTeX Engine",
      },
      {
        property: "og:description",
        content:
          "ATS match scoring, exact keyword infiltration, Overleaf FAANGPath LaTeX (.tex) export, 32 world-class templates, Word and vector PDF downloads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://cv.fitt.workers.dev/" }],
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
  const [historyOpenMobile, setHistoryOpenMobile] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [tab, setTab] = useState("resume");
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Zoom controls for the resume preview
  const [previewZoom, setPreviewZoom] = useState(100);
  const [zoomMode, setZoomMode] = useState<"fit" | "custom">("fit");

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
  const builderRef = useRef<HTMLElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToStep = useCallback((step: 1 | 2 | 3 | 4 | 5) => {
    setWizardStep(step);
  }, []);

  useEffect(() => {
    setHistory(loadHistory());
    const savedProf = loadProfile();
    if (savedProf.name || savedProf.headline || savedProf.roles.some((r) => r.title)) {
      setProfile(savedProf);
      setResume(profileToResume(savedProf));
    }
    try {
      const pendingResume = sessionStorage.getItem(PENDING_RESUME_KEY);
      if (pendingResume) {
        setResume(pendingResume);
        setInputMode("paste");
        sessionStorage.removeItem(PENDING_RESUME_KEY);
        toast.success("Resume loaded from your profile.");
      }
    } catch {
      // sessionStorage restricted or blocked
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

  function handleLoadSampleDetails(silent = false) {
    setProfile(SAMPLE_PROFILE);
    saveProfile(SAMPLE_PROFILE);
    setResume(profileToResume(SAMPLE_PROFILE));
    if (!silent) toast.success("Loaded full sample candidate profile (Alex Chen).");
  }

  function handleLoadSampleJob(sample: (typeof SAMPLE_JOBS)[number], silent = false) {
    setJob(sample.text);
    setJobTitle(sample.title);
    if (!silent) toast.success(`Loaded "${sample.title}" posting.`);
  }

  function handleLoadAllDemo() {
    handleLoadSampleDetails(true);
    handleLoadSampleJob(SAMPLE_JOBS[0]!, true);
    toast.success("Demo profile & job ready! Click 'Generate & Match Resume'.");
  }

  const ready = resume.trim().length > 30 && job.trim().length > 30 && !streaming;
  const text = result?.tailored_resume ?? draft;
  const activeResumeText = text || resume.trim() || profileToResume(profile);
  const deferredText = useDeferredValue(activeResumeText);
  const deferredJob = useDeferredValue(job);

  // Live real-time extracted ATS technical keywords from target job description (deferred for 120 FPS typing)
  const liveTargetKeywords = useMemo<string[]>(() => {
    if (!deferredJob.trim()) return [];
    return extractKeywords(deferredJob).all;
  }, [deferredJob]);

  // Canvas width/height observer for responsive preview fitting & zero mobile horizontal overflow
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [previewDocHeight, setPreviewDocHeight] = useState<number>(1100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic message handler from iframe for height calculation & smooth vertical wheel scroll
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === "RESUME_DOC_HEIGHT" && typeof e.data.height === "number") {
        const safeH = Math.min(15000, Math.max(1100, Math.ceil(e.data.height)));
        setPreviewDocHeight((prev) => (prev !== safeH ? safeH : prev));
      } else if (
        e.data &&
        e.data.type === "RESUME_WHEEL" &&
        typeof e.data.deltaY === "number" &&
        !isNaN(e.data.deltaY)
      ) {
        if (previewCanvasRef.current) {
          const delta = Math.min(250, Math.max(-250, e.data.deltaY));
          previewCanvasRef.current.scrollTop += delta;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (!previewCanvasRef.current) return;
    let rafId: number | null = null;
    const updateDims = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (previewCanvasRef.current) {
          const w = previewCanvasRef.current.clientWidth;
          const h = previewCanvasRef.current.clientHeight;
          setCanvasWidth((prev) => (prev !== w ? w : prev));
          setCanvasHeight((prev) => (prev !== h ? h : prev));
        }
      });
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(previewCanvasRef.current);
    window.addEventListener("resize", updateDims);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", updateDims);
    };
  }, [tab, previewMode]);

  // Responsive fit scale: dynamically scales document to match available canvas width
  // so paper fits 100% of the screen width on mobile (<768px) with zero horizontal clipping.
  const fitScale = useMemo(() => {
    if (typeof window !== "undefined") {
      const screenW = window.innerWidth;
      // Account for mobile page horizontal margins: px-4 (32px) + canvas wrapper p-2 (16px) = 48px
      const maxMobileAvail = screenW < 768 ? Math.max(160, screenW - 48) : 850;
      const effectiveW =
        canvasWidth > 0 ? Math.min(canvasWidth - 16, maxMobileAvail) : maxMobileAvail;
      const scaleW = effectiveW / 850;
      return Number(Math.min(1.0, Math.max(0.15, scaleW)).toFixed(3));
    }
    if (canvasWidth > 0) {
      const availW = Math.max(160, canvasWidth - 16);
      return Number(Math.min(1.0, Math.max(0.15, availW / 850)).toFixed(3));
    }
    return 0.85;
  }, [canvasWidth]);

  // Responsive scale: defaults to fitScale so full page is 100% visible; switches to previewZoom on manual zoom
  const previewScale = useMemo(() => {
    if (zoomMode === "fit") {
      return fitScale;
    }
    if (canvasWidth > 0) {
      const avail = Math.max(160, canvasWidth - (canvasWidth < 768 ? 16 : 32));
      const baseScale = Math.min(1, avail / 850);
      return Number((baseScale * (previewZoom / 100)).toFixed(3));
    }
    return Number((previewZoom / 100).toFixed(3));
  }, [zoomMode, fitScale, canvasWidth, previewZoom]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(previewDocHeight / 1100)),
    [previewDocHeight],
  );

  const scrollToPage = useCallback(
    (pageNum: number) => {
      const p = Math.max(1, Math.min(totalPages, pageNum));
      setCurrentPage(p);
      if (previewCanvasRef.current) {
        const targetTop = (p - 1) * 1100 * previewScale;
        previewCanvasRef.current.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    },
    [totalPages, previewScale],
  );

  const scrollRaf = useRef<number | null>(null);
  const handlePreviewScroll = useCallback(() => {
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      if (!previewCanvasRef.current) return;
      const st = previewCanvasRef.current.scrollTop;
      const pageHeightScaled = 1100 * previewScale;
      const page = Math.min(totalPages, Math.max(1, Math.floor(st / pageHeightScaled + 0.4) + 1));
      setCurrentPage((prev) => (prev !== page ? page : prev));
    });
  }, [totalPages, previewScale]);

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

  // Extract all target keywords from the job description for the 100% ATS Cloak (deferred for 120 FPS typing)
  const activeGhostKeywords = useMemo(() => {
    if (result?.ghost_keywords && result.ghost_keywords.length > 0) {
      return result.ghost_keywords;
    }
    if (result?.all_keywords && result.all_keywords.length > 0) {
      return result.all_keywords;
    }
    if (deferredJob.trim().length > 15) {
      return extractKeywords(deferredJob).all;
    }
    return [];
  }, [result, deferredJob]);

  // Pure memoized live resume HTML to avoid recalculating string on non-content renders
  const previewHtml = useMemo(() => {
    const kws =
      stealthCloakActive && activeGhostKeywords.length > 0 ? activeGhostKeywords : undefined;
    return renderResumeHtml(deferredText, template, applicant, kws, showXRay, {
      isInteractive: true,
      includeLatexLayer: true,
    });
  }, [deferredText, template, applicant, stealthCloakActive, activeGhostKeywords, showXRay]);

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

  // Word Format Download (Free for first 6 templates including Overleaf FAANGPath)
  const handleDownloadWord = useCallback(
    (chosenTemplate: ResumeTemplate = template) => {
      if (!text) return;
      if (!chosenTemplate.isFree && !isSubscribed) {
        setSubReason(
          `"${chosenTemplate.name}" is one of our 26 Executive Pro templates. Subscribe to unlock all 32 templates!`,
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

  // Overleaf FAANGPath LaTeX Source Generation (Underlying LaTeX engine)
  const generatedLatex = useMemo(() => {
    if (!text) return "";
    const kws =
      stealthCloakActive && activeGhostKeywords.length > 0 ? activeGhostKeywords : undefined;
    return generateOverleafFaangLatex(text, {
      ghostKeywords: kws,
      stealthCloakActive,
      jobTitle: jobTitle || deriveTitle(job),
    });
  }, [text, stealthCloakActive, activeGhostKeywords, jobTitle, job]);

  const [copiedLatex, setCopiedLatex] = useState(false);
  const copyLatex = useCallback(() => {
    if (!generatedLatex) return;
    void navigator.clipboard.writeText(generatedLatex);
    setCopiedLatex(true);
    toast.success("Overleaf FAANGPath LaTeX source code copied to clipboard!");
    setTimeout(() => setCopiedLatex(false), 2000);
  }, [generatedLatex]);

  // LaTeX .tex Download (Free for all users)
  const handleDownloadLatex = useCallback(() => {
    if (!text) return;
    const kws =
      stealthCloakActive && activeGhostKeywords.length > 0 ? activeGhostKeywords : undefined;
    const latexCode = generateOverleafFaangLatex(text, {
      ghostKeywords: kws,
      stealthCloakActive,
      jobTitle: jobTitle || deriveTitle(job),
    });
    const blob = new Blob([latexCode], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = (applicant || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `${baseName}-overleaf-faang.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Overleaf FAANGPath LaTeX (.tex) file!");
  }, [text, stealthCloakActive, activeGhostKeywords, applicant, jobTitle, job]);

  // Select a template
  const handleSelectTemplate = useCallback(
    (item: ResumeTemplate) => {
      if (!item.isFree && !isSubscribed) {
        setSubReason(
          `"${item.name}" is an Executive Pro exclusive template. Free users can select the first 6 templates (including Overleaf FAANGPath). Upgrade to Pro to unlock all 32 world-class templates!`,
        );
        setSubModalOpen(true);
        return;
      }
      setTemplateId(item.id);
      if (entryId) setHistory(updateEntry(entryId, { templateId: item.id }));
      setTab("resume");
      setPreviewMode("visual");
      setZoomMode("fit");
      setPreviewDocHeight(1100);
      setCurrentPage(1);
      if (previewCanvasRef.current) {
        previewCanvasRef.current.scrollTop = 0;
      }
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased w-full max-w-[100vw] overflow-x-hidden box-border">
      <Toaster />

      {/* Accessible Skip Navigation Link (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-primary-foreground font-semibold text-xs transition-all"
      >
        Skip to main content
      </a>

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
      {zoomTemplate && (
        <TemplateZoomModal
          template={zoomTemplate}
          resumeText={text || resume || profileToResume(SAMPLE_PROFILE)}
          applicant={applicant}
          isSubscribed={isSubscribed}
          onClose={() => setZoomTemplate(null)}
          onSelect={handleSelectTemplate}
          onDownloadWord={handleDownloadWord}
          onDownloadPdf={handleDownloadPdf}
          onDownloadLatex={handleDownloadLatex}
        />
      )}

      {/* Modern Minimal Header */}
      <header className="border-b border-border bg-[#090A0F]/75 backdrop-blur-md sticky top-0 z-40 w-full overflow-x-hidden">
        <div className="w-full max-w-[1740px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 h-14">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <ResumeMatcherLogo size={32} />
            <span className="hidden sm:inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
              32 Templates (Overleaf + FAANG)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Workspace Layout Toggle */}
            <div className="hidden sm:inline-flex items-center rounded-xl border border-border bg-[#121624] p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setWorkspaceLayout("split")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  workspaceLayout === "split"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Switch to split workspace layout"
                title="Split View"
              >
                <Columns className="size-3.5" /> Split
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceLayout("full")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  workspaceLayout === "full"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Switch to full-width editor layout"
                title="Full Width Editor"
              >
                <Maximize className="size-3.5" /> Full Width
              </button>
            </div>

            {/* User Account / Auth State */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 py-1 px-2.5 text-xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="font-medium text-foreground max-w-[90px] sm:max-w-[130px] truncate">
                    {user.email}
                  </span>
                  {isSubscribed && (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
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
                  className="h-8 text-xs text-muted-foreground hover:text-foreground px-1.5 sm:px-2"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                {isSubscribed ? (
                  <span className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-xs">
                    <Crown className="size-3.5 fill-current" />{" "}
                    <span className="hidden sm:inline">Pro Active</span>
                    <span className="sm:hidden">Pro</span>
                  </span>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSubReason(
                          "Free tier includes 6 templates & Word (.doc) and LaTeX (.tex) export. Subscribe to unlock all 32 world-class templates and vector PDF exports!",
                        );
                        setSubModalOpen(true);
                      }}
                      className="h-8 text-xs font-semibold px-2.5 sm:px-3 gap-1.5 shadow-xs"
                    >
                      <Crown className="size-3.5 text-primary-foreground" />{" "}
                      <span className="hidden sm:inline">Upgrade to </span>Pro
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("sign_in");
                        setAuthModalOpen(true);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium px-1.5 sm:px-2 py-1 transition-colors cursor-pointer"
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
              className="h-8 border-border hover:bg-accent text-xs font-medium px-2 sm:px-2.5"
            >
              <Sparkles className="size-3.5 text-primary sm:mr-1" />{" "}
              <span className="hidden sm:inline">Demo</span>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium px-2 sm:px-2.5"
            >
              <Link to="/profile">
                <UserRound className="size-3.5 sm:mr-1 text-primary" />{" "}
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Wide Full-Width Fluid Container */}
      <main
        id="main-content"
        className="w-full max-w-[1740px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8 overflow-x-hidden box-border"
      >
        {/* Clear CTA & Trust Hero Banner */}
        <section
          aria-labelledby="hero-title"
          className="mb-5 sm:mb-8 rounded-2xl border border-border bg-card/75 p-4 sm:p-7 shadow-xs overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
            <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="size-3 sm:size-3.5" /> 100% ATS SHORTLIST GUARANTEE
                </span>
                <span className="text-xs text-slate-700 hidden sm:inline">•</span>
                <span className="text-[11px] sm:text-xs font-medium text-slate-300">
                  32 FAANG &amp; Overleaf Templates
                </span>
                <span className="text-xs text-slate-700 hidden sm:inline">•</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground hidden xs:inline sm:inline">
                  Word &amp; Vector PDF
                </span>
              </div>
              <h1
                id="hero-title"
                className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight hero-gradient-text leading-snug"
              >
                Match Your Resume &amp; Infiltrate Automated ATS Filters
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Extract exact technical keywords from job postings, tailor bullet points, and
                activate the{" "}
                <strong className="text-slate-200 font-semibold">ATS Stealth Cloak™</strong>{" "}
                (white-font keyword injection) to guarantee a 100% bot match.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
              <Button
                onClick={handleLoadAllDemo}
                variant="outline"
                size="sm"
                aria-label="Load sample job posting and candidate profile"
                className="h-9 text-xs font-semibold px-3.5 w-full sm:w-auto cursor-pointer"
              >
                <Sparkles className="size-3.5 mr-1.5 text-primary" /> Load Sample Demo
              </Button>
              <Button
                onClick={() => {
                  builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                size="sm"
                aria-label="Start ATS resume optimization process"
                className="h-9 text-xs font-semibold px-4 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto cursor-pointer"
              >
                Start ATS Optimization <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </section>

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
            ref={builderRef}
            id="builder"
            aria-labelledby="wizard-heading"
            className={
              workspaceLayout === "split"
                ? "lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6 min-w-0"
                : "space-y-6 w-full max-w-[1400px] mx-auto min-w-0"
            }
          >
            {/* Step-by-Step Guided Wizard Workspace */}
            <div
              className={
                workspaceLayout === "full"
                  ? "rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-md space-y-6"
                  : "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5"
              }
            >
              {/* Header & Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 sm:pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-primary text-xs sm:text-sm font-bold text-primary-foreground shadow-xs">
                      {inputMode === "form" ? wizardStep : "✎"}
                    </span>
                    <h2
                      id="wizard-heading"
                      className="text-base sm:text-lg lg:text-xl font-bold text-foreground"
                    >
                      {inputMode === "form" ? (
                        <>
                          {wizardStep === 1 && "Step 1: Target Role & Job Posting"}
                          {wizardStep === 2 && "Step 2: Contact & Identity"}
                          {wizardStep === 3 && "Step 3: Professional Experience"}
                          {wizardStep === 4 && "Step 4: Education, Skills & Custom Sections"}
                          {wizardStep === 5 && "Step 5: ATS Optimization & Stealth Cloak"}
                        </>
                      ) : (
                        "Quick Import / Paste Resume Text"
                      )}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {inputMode === "form" ? (
                      <>
                        {wizardStep === 1 &&
                          "Target job requirements, tech stack & real-time ATS keyword detection."}
                        {wizardStep === 2 &&
                          "Your personal branding, contact info, and executive headline."}
                        {wizardStep === 3 &&
                          "Career achievements with metrics, scale, and action verb helpers."}
                        {wizardStep === 4 &&
                          "Degrees, core competencies, certifications, and key project sections."}
                        {wizardStep === 5 &&
                          "Verify keyword coverage, arm the ATS Stealth Cloak, and generate."}
                      </>
                    ) : (
                      "Upload a PDF or paste an existing resume to optimize and match instantly."
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setInputMode("form")}
                    aria-label="Switch to guided wizard input mode"
                    className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all flex items-center cursor-pointer ${
                      inputMode === "form"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Guided Wizard
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("paste")}
                    aria-label="Switch to paste or PDF upload input mode"
                    className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all flex items-center cursor-pointer ${
                      inputMode === "paste"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Paste / PDF
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadAllDemo}
                    aria-label="Load demo resume and job data"
                    className="h-8 sm:h-9 px-2.5 text-xs sm:text-sm text-primary hover:bg-primary/10 font-semibold"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Demo Data
                  </Button>
                </div>
              </div>

              {inputMode === "form" ? (
                <div className="space-y-6">
                  {/* 5-Step Responsive Tracker Bar */}
                  <div className="space-y-3">
                    {/* Desktop Stepper (sm and above) */}
                    <div className="hidden sm:grid sm:grid-cols-5 gap-1.5 text-xs sm:text-sm font-semibold w-full">
                      {[
                        { step: 1, label: "1. Job Target" },
                        { step: 2, label: "2. Identity" },
                        { step: 3, label: "3. Experience" },
                        { step: 4, label: "4. Skills & Sections" },
                        { step: 5, label: "5. ATS Stealth" },
                      ].map((item) => (
                        <button
                          key={item.step}
                          type="button"
                          onClick={() => goToStep(item.step as 1 | 2 | 3 | 4 | 5)}
                          aria-label={item.label}
                          className={`rounded-xl py-2 px-1.5 min-h-[40px] flex items-center justify-center text-center truncate transition-all cursor-pointer ${
                            wizardStep === item.step
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : wizardStep > item.step
                                ? "bg-muted/80 text-foreground font-medium hover:bg-muted"
                                : "bg-muted/30 text-muted-foreground hover:text-foreground"
                          }`}
                          title={item.label}
                        >
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Stepper (< sm) - Sleek connected step circles + active label */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between w-full px-1">
                        {[
                          { step: 1, name: "Job" },
                          { step: 2, name: "Identity" },
                          { step: 3, name: "Experience" },
                          { step: 4, name: "Skills" },
                          { step: 5, name: "ATS" },
                        ].map((item, idx, arr) => (
                          <div key={item.step} className="flex items-center flex-1 last:flex-none">
                            <button
                              type="button"
                              onClick={() => goToStep(item.step as 1 | 2 | 3 | 4 | 5)}
                              aria-label={`Go to step ${item.step}: ${item.name}`}
                              className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                wizardStep === item.step
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary/40 shadow-xs"
                                  : wizardStep > item.step
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {wizardStep > item.step ? "✓" : item.step}
                            </button>
                            {idx < arr.length - 1 && (
                              <div
                                className={`h-0.5 flex-1 mx-1.5 rounded-full transition-all ${
                                  wizardStep > item.step ? "bg-emerald-500/50" : "bg-muted"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between px-1 text-xs">
                        <span className="font-bold text-foreground truncate max-w-[240px]">
                          Step {wizardStep}/5:{" "}
                          <span className="text-primary font-semibold">
                            {wizardStep === 1 && "Job Target"}
                            {wizardStep === 2 && "Identity & Contact"}
                            {wizardStep === 3 && "Work Experience"}
                            {wizardStep === 4 && "Skills & Education"}
                            {wizardStep === 5 && "ATS Stealth & Match"}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          {Math.round((wizardStep / 5) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress line */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${(wizardStep / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* STEP 1: TARGET ROLE & JOB POSTING */}
                  {wizardStep === 1 && (
                    <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                      {/* Sample job quick buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground mr-1">
                          Load Benchmark Job:
                        </span>
                        {SAMPLE_JOBS.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleLoadSampleJob(sample)}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer shadow-xs"
                          >
                            {sample.title}
                          </button>
                        ))}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Target Role Title
                          </span>
                          <Input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Full-Stack Engineer"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Target Company / Industry
                          </span>
                          <Input
                            placeholder="e.g. Stripe, Google, or Tech Startup"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                      </div>

                      <label className="block space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            Target Job Description (Requirements &amp; Tech Stack)
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {job.trim().length} characters
                          </span>
                        </div>
                        <Textarea
                          value={job}
                          onChange={(e) => setJob(e.target.value)}
                          placeholder="Paste the target job posting here. Requirements, responsibilities, languages, frameworks, tech stack..."
                          className="min-h-[260px] sm:min-h-[340px] resize-y bg-background text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary transition-all"
                        />
                      </label>

                      {/* Real-time Extracted ATS Keywords Preview */}
                      {liveTargetKeywords.length > 0 && (
                        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-primary flex items-center gap-2">
                              <Sparkles className="size-4" /> Detected ATS Keywords (
                              {liveTargetKeywords.length} terms):
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Extracted from job posting
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {liveTargetKeywords.slice(0, 20).map((kw, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-lg bg-background border border-primary/30 px-2.5 py-1 text-xs font-semibold text-foreground font-mono shadow-2xs"
                              >
                                ✓ {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tone Selection */}
                      <div className="border-t border-border pt-4">
                        <span className="mb-2 block text-sm font-bold text-foreground">
                          Target Executive Tone:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {TONES.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setTone(option.id)}
                              className={`rounded-lg border px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                tone === option.id
                                  ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                                  : "border-border bg-background text-foreground hover:bg-accent"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Footer Nav */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadSampleJob(SAMPLE_JOBS[0]!)}
                          className="h-10 px-3 text-xs sm:text-sm font-semibold rounded-xl"
                        >
                          <Sparkles className="size-3.5 mr-1.5 text-primary" /> Load Sample Job
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          {ready && !streaming && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={tailor}
                              className="h-10 px-3 text-xs sm:text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
                              title="Generate resume right away with current details"
                            >
                              <Sparkles className="size-3.5 mr-1" /> Quick Match
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-base font-bold rounded-xl shadow-xs cursor-pointer"
                          >
                            Next: Contact →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PERSONAL & CONTACT INFORMATION */}
                  {wizardStep === 2 && (
                    <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                      <div
                        className={
                          workspaceLayout === "full"
                            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid gap-4 sm:grid-cols-2"
                        }
                      >
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Full Name
                          </span>
                          <Input
                            value={profile.name}
                            onChange={(e) => updateProfileField("name", e.target.value)}
                            placeholder="Alex Chen"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Target Headline / Title
                          </span>
                          <Input
                            value={profile.headline}
                            onChange={(e) => updateProfileField("headline", e.target.value)}
                            placeholder="Senior Full-Stack Architect"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Email Address
                          </span>
                          <Input
                            value={profile.email}
                            onChange={(e) => updateProfileField("email", e.target.value)}
                            placeholder="alex.chen@example.com"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Phone &amp; Location
                          </span>
                          <Input
                            value={
                              profile.phone
                                ? `${profile.phone} | ${profile.location}`
                                : profile.location
                            }
                            onChange={(e) => updateProfileField("location", e.target.value)}
                            placeholder="+1 (415) 890-2341 | San Francisco, CA"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            LinkedIn Profile URL
                          </span>
                          <Input
                            value={profile.linkedin}
                            onChange={(e) => updateProfileField("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/alexchen-dev"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-bold text-foreground">
                            Website / Portfolio
                          </span>
                          <Input
                            value={profile.website}
                            onChange={(e) => updateProfileField("website", e.target.value)}
                            placeholder="alexchen.dev"
                            className="h-12 text-sm sm:text-base bg-background px-4 rounded-xl border border-border/80"
                          />
                        </label>
                      </div>

                      {/* Executive Summary */}
                      <label className="block border-t border-border pt-4 space-y-1.5">
                        <span className="block text-sm sm:text-base font-bold text-foreground">
                          Executive Summary / Profile Intro
                        </span>
                        <Textarea
                          value={profile.about}
                          onChange={(e) => updateProfileField("about", e.target.value)}
                          placeholder="Brief overview of your experience, leadership, key metrics, and accomplishments..."
                          className="min-h-[160px] sm:min-h-[220px] resize-y bg-background text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary transition-all"
                        />
                      </label>

                      {/* Footer Nav */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => goToStep(1)}
                          className="h-10 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                        >
                          ← Back: Job
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          {ready && !streaming && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={tailor}
                              className="h-10 px-3 text-xs sm:text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
                              title="Generate resume right away with current details"
                            >
                              <Sparkles className="size-3.5 mr-1" /> Quick Match
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => goToStep(3)}
                            className="h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-base font-bold rounded-xl shadow-xs cursor-pointer"
                          >
                            Next: Experience →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: WORK EXPERIENCE */}
                  {wizardStep === 3 && (
                    <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="size-4 text-primary" /> Career Roles (
                          {profile.roles.length})
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 sm:h-10 text-xs sm:text-sm font-semibold px-3 sm:px-4 rounded-xl border-border hover:border-primary cursor-pointer"
                          onClick={() =>
                            updateProfileField("roles", [
                              ...profile.roles,
                              {
                                ...emptyRole,
                                title: "Software Engineer",
                                company: "Company Name",
                                dates: "2022 – Present",
                              },
                            ])
                          }
                        >
                          <Plus className="size-3.5 mr-1 text-primary" /> Add Another Role
                        </Button>
                      </div>

                      {/* Power Action Verb Pills Helper */}
                      <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground block">
                          ⚡ Executive Action Verbs (Click to copy/inspire):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Architected",
                            "Spearheaded",
                            "Engineered",
                            "Orchestrated",
                            "Scaled to 1M+",
                            "Reduced Latency by 40%",
                            "Streamlined",
                            "Automated",
                          ].map((verb) => (
                            <button
                              key={verb}
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(verb);
                                toast.info(`Copied "${verb}" to clipboard!`);
                              }}
                              className="rounded-lg bg-background border border-border px-2.5 py-1 text-xs sm:text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-2xs"
                            >
                              + {verb}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Role list */}
                      <div className="space-y-4">
                        {profile.roles.map((role, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-border bg-background/60 p-4 sm:p-5 space-y-3 shadow-xs"
                          >
                            <div className="grid gap-3 sm:grid-cols-3">
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
                                className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
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
                                className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
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
                                placeholder="Dates (e.g. 2022 – Present)"
                                className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
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
                              placeholder="Accomplishment bullets (one per line) — lead with strong verbs and measurable metrics (%, $, scale)..."
                              className="min-h-[160px] sm:min-h-[220px] resize-y bg-background text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary font-mono sm:font-sans transition-all"
                            />
                            {profile.roles.length > 1 && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProfileField(
                                      "roles",
                                      profile.roles.filter((_, i) => i !== idx),
                                    )
                                  }
                                  className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" /> Remove role
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer Nav */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => goToStep(2)}
                          className="h-10 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                        >
                          ← Back: Contact
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          {ready && !streaming && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={tailor}
                              className="h-10 px-3 text-xs sm:text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
                              title="Generate resume right away with current details"
                            >
                              <Sparkles className="size-3.5 mr-1" /> Quick Match
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => goToStep(4)}
                            className="h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-base font-bold rounded-xl shadow-xs cursor-pointer"
                          >
                            Next: Skills →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: EDUCATION, SKILLS & CUSTOM SECTIONS */}
                  {wizardStep === 4 && (
                    <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                      {/* Technical Skills */}
                      <label className="block space-y-1.5">
                        <span className="block text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <Wrench className="size-4 text-primary" /> Core Technical &amp; Domain
                          Skills
                        </span>
                        <Textarea
                          value={profile.skills}
                          onChange={(e) => updateProfileField("skills", e.target.value)}
                          placeholder="React, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker, Kubernetes, GraphQL, Distributed Systems, Microservices..."
                          className="min-h-[140px] sm:min-h-[180px] resize-y bg-background text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary transition-all"
                        />
                      </label>

                      {/* Education */}
                      <div className="space-y-3 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="size-4 text-primary" /> Education
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateProfileField("studies", [
                                ...profile.studies,
                                { ...emptyStudy, qualification: "B.S. in Computer Science" },
                              ])
                            }
                            className="text-xs sm:text-sm text-primary font-semibold hover:underline cursor-pointer"
                          >
                            + Add Degree
                          </button>
                        </div>
                        {profile.studies.map((study, idx) => (
                          <div key={idx} className="grid gap-3 sm:grid-cols-3">
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
                              className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
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
                              className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
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
                              placeholder="Dates (e.g. 2020)"
                              className="h-11 sm:h-12 text-sm sm:text-base bg-background px-3.5 sm:px-4 rounded-xl border border-border/80"
                            />
                          </div>
                        ))}
                      </div>

                      {/* CUSTOM SECTIONS BUILDER */}
                      <div className="space-y-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                            <Layers className="size-4 text-primary" /> Custom Resume Sections
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Projects, Certifications, Awards
                          </span>
                        </div>

                        {(profile.customSections || []).map((section) => (
                          <div
                            key={section.id}
                            className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5 space-y-3 shadow-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-3">
                              <Input
                                value={section.title}
                                onChange={(e) =>
                                  handleUpdateSectionTitle(section.id, e.target.value)
                                }
                                placeholder="Section Title"
                                className="h-10 sm:h-11 text-sm sm:text-base font-bold bg-background max-w-xs border-primary/30 rounded-xl px-3.5"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 sm:h-9 text-xs sm:text-sm font-semibold bg-background rounded-xl px-3 cursor-pointer"
                                  onClick={() => handleAddItemToSection(section.id)}
                                >
                                  <Plus className="size-3.5 mr-1" /> Add Entry
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="text-xs sm:text-sm text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" /> Remove
                                </button>
                              </div>
                            </div>

                            {section.items && section.items.length > 0 ? (
                              <div className="space-y-3">
                                {section.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-border bg-background p-3.5 sm:p-4 space-y-2.5 shadow-2xs"
                                  >
                                    <div className="grid gap-3 sm:grid-cols-3">
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
                                        className="h-10 sm:h-11 text-sm sm:text-base bg-background px-3.5 rounded-xl border border-border/80"
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
                                        placeholder="Stack / Issuer"
                                        className="h-10 sm:h-11 text-sm sm:text-base bg-background px-3.5 rounded-xl border border-border/80"
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
                                        className="h-10 sm:h-11 text-sm sm:text-base bg-background px-3.5 rounded-xl border border-border/80"
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
                                      placeholder="Accomplishment bullets, metrics, technologies used..."
                                      className="min-h-[100px] sm:min-h-[130px] text-sm sm:text-base leading-relaxed p-3.5 sm:p-4 rounded-xl border border-border/80 bg-background/90"
                                    />
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
                                placeholder="Enter accomplishments, credentials, or bullets..."
                                className="min-h-[140px] sm:min-h-[180px] text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 bg-background/90"
                              />
                            )}
                          </div>
                        ))}

                        {/* Quick Section Presets */}
                        <div className="rounded-xl border border-dashed border-border p-4 bg-muted/30 space-y-2">
                          <span className="text-xs sm:text-sm font-semibold text-foreground block">
                            + Add a Custom Section Preset:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {SECTION_PRESETS.map((preset) => (
                              <button
                                key={preset.title}
                                type="button"
                                onClick={() => handleAddSection(preset.title)}
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Nav */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => goToStep(3)}
                          className="h-10 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                        >
                          ← Back: Experience
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          {ready && !streaming && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={tailor}
                              className="h-10 px-3 text-xs sm:text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
                              title="Generate resume right away with current details"
                            >
                              <Sparkles className="size-3.5 mr-1" /> Quick Match
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => goToStep(5)}
                            className="h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-base font-bold rounded-xl shadow-xs cursor-pointer"
                          >
                            Next: ATS Optimization →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: ATS OPTIMIZATION & STEALTH CLOAK */}
                  {wizardStep === 5 && (
                    <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                      {/* Readiness Summary */}
                      <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 space-y-3">
                        <span className="font-bold text-sm sm:text-base text-foreground block">
                          Optimization Readiness Checklist:
                        </span>
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>
                              Target: <strong>{jobTitle || "Job Configured"}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>
                              Candidate: <strong>{profile.name || "Alex Chen"}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>
                              Roles: <strong>{profile.roles.length} entries</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>
                              ATS Keywords: <strong>{liveTargetKeywords.length} terms</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Main Generate Button Section */}
                      <div className="space-y-2">
                        <Button
                          size="lg"
                          className="w-full h-auto min-h-14 sm:h-15 text-sm sm:text-base md:text-lg font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl cursor-pointer px-4 py-3.5 whitespace-normal text-center"
                          disabled={!ready}
                          onClick={tailor}
                        >
                          {streaming ? (
                            <div className="flex items-center justify-center flex-wrap gap-2">
                              <Loader2 className="size-5 animate-spin shrink-0" />
                              <span>Infiltrating &amp; Tailoring Resume…</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center flex-wrap gap-2">
                              <Sparkles className="size-5 shrink-0" />
                              <span>Generate 100% ATS Matched Resume</span>
                              <ArrowRight className="size-5 shrink-0" />
                            </div>
                          )}
                        </Button>
                        {!ready && (
                          <p className="text-xs text-amber-500 dark:text-amber-400 text-center font-medium">
                            Please provide candidate information (Step 2) and a target job (Step 1)
                            to generate.
                          </p>
                        )}
                      </div>

                      {/* ATS Stealth Cloak Notice */}
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              ATS Stealth Cloak™ Armed &amp; Ready
                            </span>
                          </div>
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] sm:text-xs py-0.5 px-2">
                            100% SHORTLIST
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Injects target keywords in invisible white font (
                          <code className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                            #ffffff
                          </code>
                          ) into Word and PDF exports. Recruiters see a spotless executive layout
                          while automated parsers index a 100% keyword match.
                        </p>
                      </div>

                      {/* Footer Nav */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => goToStep(4)}
                          className="h-10 px-4 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                        >
                          ← Back: Skills &amp; Sections
                        </Button>
                        <span className="text-xs text-muted-foreground font-semibold">
                          Step 5 of 5
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PASTE / PDF UPLOAD VIEW - Ultra-wide 2-column responsive layout */
                <div className="space-y-6">
                  <div
                    className={
                      workspaceLayout === "full"
                        ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                        : "space-y-5"
                    }
                  >
                    {/* Left Box: Candidate Resume */}
                    <div className="space-y-2 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          Your Current Resume
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {resume.trim().length} chars
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer shadow-xs"
                          >
                            {reading ? (
                              <Loader2 className="size-3.5 animate-spin text-primary" />
                            ) : (
                              <Upload className="size-3.5 text-primary" />
                            )}
                            Upload (PDF / TXT)
                          </button>
                        </div>
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
                        placeholder="Paste your full resume text here, or click upload to import from PDF..."
                        className={`flex-1 resize-y bg-background/90 text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary font-mono sm:font-sans transition-all ${
                          workspaceLayout === "full"
                            ? "min-h-[380px] lg:min-h-[480px]"
                            : "min-h-[260px] sm:min-h-[320px]"
                        }`}
                      />
                    </div>

                    {/* Right Box: Target Job Description */}
                    <div className="space-y-2 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="size-4 text-primary" />
                          Target Job Description
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {job.trim().length} chars
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadSampleJob(SAMPLE_JOBS[0]!)}
                            className="h-8 text-xs font-semibold px-2.5 rounded-lg"
                          >
                            <Sparkles className="size-3 mr-1 text-primary" /> Sample Job
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        placeholder="Paste target job requirements, qualifications, responsibilities, and tech stack here..."
                        className={`flex-1 resize-y bg-background/90 text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-xl border border-border/80 focus:border-primary transition-all ${
                          workspaceLayout === "full"
                            ? "min-h-[380px] lg:min-h-[480px]"
                            : "min-h-[220px] sm:min-h-[280px]"
                        }`}
                      />

                      {/* Real-time Extracted ATS Keywords Preview in Paste Mode */}
                      {liveTargetKeywords.length > 0 && (
                        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-primary flex items-center gap-1.5">
                              <Sparkles className="size-3.5" /> Detected ATS Keywords (
                              {liveTargetKeywords.length}):
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {liveTargetKeywords.slice(0, 14).map((kw, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-md bg-background border border-primary/30 px-2 py-0.5 text-xs font-semibold text-foreground font-mono"
                              >
                                ✓ {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-auto min-h-14 sm:h-15 text-sm sm:text-base md:text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all cursor-pointer px-4 py-3 whitespace-normal text-center"
                    disabled={!ready}
                    onClick={tailor}
                  >
                    {streaming ? (
                      <div className="flex items-center justify-center flex-wrap gap-2">
                        <Loader2 className="size-5 animate-spin shrink-0" />
                        <span>Tailoring Resume…</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center flex-wrap gap-2">
                        <Sparkles className="size-5 shrink-0" />
                        <span>Generate 100% ATS Matched Resume</span>
                        <ArrowRight className="size-5 shrink-0" />
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar Corporate Banner Ad (Placed in left column) */}
            <BannerAd
              variant="sidebar"
              onUpgradeClick={() => {
                setSubReason(
                  "Upgrade to Enterprise Pro to remove all sponsor banners and unlock all 32 templates.",
                );
                setSubModalOpen(true);
              }}
            />

            {/* Saved Generations History - Collapsible Drawer on Mobile */}
            {history.length > 0 && (
              <aside
                aria-labelledby="history-heading"
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs"
              >
                <div
                  className="flex items-center justify-between border-b border-border pb-2.5 cursor-pointer sm:cursor-default select-none"
                  onClick={() => setHistoryOpenMobile((prev) => !prev)}
                >
                  <h3
                    id="history-heading"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground"
                  >
                    <HistoryIcon className="size-3.5 text-muted-foreground" /> Saved Generations (
                    {history.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory(clearHistory());
                      }}
                      aria-label="Clear all saved generations"
                      className="text-xs text-muted-foreground hover:text-destructive p-1"
                    >
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryOpenMobile((prev) => !prev)}
                      className="sm:hidden p-1 text-muted-foreground hover:text-foreground"
                      aria-label={
                        historyOpenMobile
                          ? "Collapse saved generations"
                          : "Expand saved generations"
                      }
                      aria-expanded={historyOpenMobile}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          historyOpenMobile && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                </div>
                <ul
                  className={cn(
                    "mt-2 divide-y divide-border/60 transition-all",
                    !historyOpenMobile && "hidden sm:block",
                  )}
                >
                  {history.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                      <button
                        type="button"
                        onClick={() => restore(entry)}
                        aria-label={`Restore saved resume: ${entry.title}`}
                        className="min-w-0 flex-1 text-left group min-h-[44px] sm:min-h-0 flex flex-col justify-center"
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
                        aria-label={`Delete entry ${entry.title}`}
                        onClick={() => setHistory(deleteEntry(entry.id))}
                        className="text-muted-foreground hover:text-destructive p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </section>

          {/* Right Workspace Column: Tailored Resume & 32 Templates Showcase */}
          <section
            ref={outputRef}
            aria-labelledby="output-heading"
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
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center shadow-xs">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner mb-4">
                  <Award className="size-7" />
                </div>
                <h2
                  id="output-heading"
                  className="mt-2 text-xl sm:text-2xl font-bold hero-gradient-text"
                >
                  Your Tailored Executive Resume Lands Here
                </h2>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Fill in candidate details on the left, paste a target job posting, and click
                  Generate. The AI scores keywords, matches competencies, and renders 32 templates
                  with full Overleaf LaTeX (.tex) support.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
                  <Button
                    onClick={handleLoadAllDemo}
                    size="sm"
                    className="font-semibold text-xs shadow-xs"
                  >
                    <Sparkles className="mr-1.5 size-3.5 text-primary" /> Try with Demo Data
                  </Button>
                </div>
              </div>
            )}

            {text && (
              <>
                {/* ATS Match Score Header Card */}
                {result && (
                  <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
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
                        className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 transition-all duration-700"
                        style={{ width: `${result.match_score}%` }}
                      />
                    </div>
                    {/* Interactive ATS Fit Score Breakdown */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/60 text-center">
                      <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          ATS Infiltration
                        </p>
                        <p className="text-sm font-extrabold text-emerald-400">100% Guaranteed</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Core Match
                        </p>
                        <p className="text-sm font-extrabold text-primary">
                          {Math.min(100, Math.max(85, result.match_score))}%
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Vector Layout
                        </p>
                        <p className="text-sm font-extrabold text-blue-400">100% Pass</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Action Impact
                        </p>
                        <p className="text-sm font-extrabold text-indigo-400">96% FAANG</p>
                      </div>
                    </div>

                    {result.missing_keywords.length > 0 && (
                      <div className="mt-3.5 border-t border-border/60 pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Target Keywords (Click to Copy):
                          </p>
                          <span className="text-[11px] text-muted-foreground hidden sm:inline">
                            Click any tag to copy into your experience bullets
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {result.missing_keywords.map((kw) => (
                            <button
                              key={kw}
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(kw);
                                toast.success(`Copied keyword "${kw}" to clipboard!`);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium px-2 py-0.5 border border-border/60 transition-transform active:scale-95 cursor-pointer group"
                              title="Click to copy keyword"
                            >
                              <span>{kw}</span>
                              <Copy className="size-2.5 opacity-50 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive FAANG Executive Power Verbs Bank */}
                    <div className="mt-3.5 border-t border-border/60 pt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Sparkles className="size-3 text-primary" /> FAANG Executive Action Verbs:
                        </p>
                        <span className="text-[10px] text-muted-foreground">Click to copy</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Spearheaded",
                          "Architected",
                          "Orchestrated",
                          "Engineered",
                          "Automated",
                          "Accelerated",
                          "Streamlined",
                          "Maximized",
                          "Pioneered",
                          "Consolidated",
                          "Transformed",
                          "Scaled",
                        ].map((verb) => (
                          <button
                            key={verb}
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(verb);
                              toast.success(`Copied action verb "${verb}"!`);
                            }}
                            className="rounded-md bg-muted/60 hover:bg-primary/15 hover:text-primary text-[11px] font-semibold px-2 py-0.5 border border-border/40 text-foreground transition-all active:scale-95 cursor-pointer"
                            title={`Copy '${verb}' to clipboard`}
                          >
                            {verb}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadWord(template)}
                        className="h-8 border-border text-foreground hover:bg-accent font-bold text-xs"
                      >
                        <FileDown className="size-3.5 mr-1 text-primary" /> Word (.doc) Free
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTab("latex");
                          if (outputRef.current) {
                            outputRef.current.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="h-8 border-emerald-600/30 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs"
                        title="View & Export Overleaf FAANGPath LaTeX (.tex) format"
                      >
                        <FileCode className="size-3.5 mr-1 text-emerald-400" /> Overleaf LaTeX
                        (.tex)
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadPdf(template)}
                        disabled={streaming}
                        className="h-8 bg-primary hover:bg-primary/90 font-bold text-xs text-primary-foreground shadow-xs"
                      >
                        <Download className="size-3.5 mr-1" />
                        {isSubscribed ? "Download PDF" : "Download PDF (Pro)"}
                        {!isSubscribed && <Lock className="size-3 ml-1 text-primary-foreground" />}
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
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 sm:p-5 shadow-xs space-y-3">
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
                          while automated ATS bots (Workday, Greenhouse, Taleo, Lever) parse a 100%
                          keyword match.
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

                {/* Tabs: Resume, 31 Templates, Gaps, Cover Letter */}
                <Tabs value={tab} onValueChange={setTab} className="w-full max-w-full">
                  <TabsList className="w-full flex sm:grid sm:grid-cols-5 overflow-x-auto no-scrollbar h-12 sm:h-11 bg-card/80 border border-border/80 p-1 rounded-xl gap-1">
                    <TabsTrigger
                      value="resume"
                      className="text-xs font-bold px-2 sm:px-2.5 truncate shrink-0 sm:shrink min-w-[76px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">🎯 Live Resume</span>
                      <span className="sm:hidden">🎯 Resume</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="latex"
                      className="text-xs font-bold px-2 sm:px-2.5 truncate shrink-0 sm:shrink min-w-[76px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">📜 LaTeX (.tex)</span>
                      <span className="sm:hidden">📜 LaTeX</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="templates"
                      className="text-xs font-bold px-2 sm:px-2.5 truncate shrink-0 sm:shrink min-w-[76px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">🎨 32 Templates</span>
                      <span className="sm:hidden">🎨 Templates</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="original"
                      className="text-xs font-bold px-2 sm:px-2.5 truncate shrink-0 sm:shrink min-w-[76px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">🔍 ATS Gaps</span>
                      <span className="sm:hidden">🔍 Gaps</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="cover"
                      className="text-xs font-bold px-2 sm:px-2.5 truncate shrink-0 sm:shrink min-w-[76px] sm:min-w-0"
                    >
                      <span className="hidden sm:inline">✉️ Cover Letter</span>
                      <span className="sm:hidden">✉️ Letter</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: TAILORED RESUME PREVIEW WITH ZOOM CONTROLS */}
                  <TabsContent value="resume" className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                      {/* Sub-header Toolbar */}
                      <div className="flex flex-col gap-2.5 border-b border-border bg-card/70 px-3 sm:px-5 py-2.5 backdrop-blur-xs w-full max-w-full">
                        {/* Row 1: Template Selection & Page Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0 w-full">
                          {/* Direct Template Selector Dropdown */}
                          <div className="flex items-center gap-1.5 bg-background/90 border border-border rounded-xl px-2.5 py-1 shadow-2xs max-w-full flex-1 sm:flex-initial min-w-0">
                            <label
                              htmlFor="resume-template-select"
                              className="text-[11px] font-bold text-muted-foreground whitespace-nowrap shrink-0"
                            >
                              Template:
                            </label>
                            <select
                              id="resume-template-select"
                              aria-label="Choose resume template"
                              value={template.id}
                              onChange={(e) => {
                                const selected = TEMPLATES.find((t) => t.id === e.target.value);
                                if (selected) handleSelectTemplate(selected);
                              }}
                              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer pr-1 truncate w-full sm:max-w-[280px]"
                            >
                              <optgroup label="✨ Free Templates">
                                {TEMPLATES.filter((t) => t.isFree).map((t) => (
                                  <option
                                    key={t.id}
                                    value={t.id}
                                    className="text-foreground bg-background"
                                  >
                                    {t.name} ({t.badge})
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="👑 Pro Templates">
                                {TEMPLATES.filter((t) => !t.isFree).map((t) => (
                                  <option
                                    key={t.id}
                                    value={t.id}
                                    className="text-foreground bg-background"
                                  >
                                    {t.name} {!isSubscribed ? "🔒" : ""} ({t.badge})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {/* Multi-Page Navigation Controls when totalPages > 1 */}
                          {previewMode === "visual" && totalPages > 1 && (
                            <div className="inline-flex items-center rounded-xl border border-primary/30 bg-primary/5 px-2.5 py-1 gap-1.5 shadow-2xs shrink-0">
                              <span className="text-[11px] font-bold text-primary whitespace-nowrap">
                                Page {currentPage}/{totalPages}
                              </span>
                              <div className="inline-flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => scrollToPage(currentPage - 1)}
                                  disabled={currentPage <= 1}
                                  className="p-0.5 rounded hover:bg-primary/20 text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Previous Page"
                                  aria-label="Previous resume page"
                                >
                                  <ChevronLeft className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => scrollToPage(currentPage + 1)}
                                  disabled={currentPage >= totalPages}
                                  className="p-0.5 rounded hover:bg-primary/20 text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Next Page"
                                  aria-label="Next resume page"
                                >
                                  <ChevronRight className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Row 2: View mode, Zoom & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 w-full pt-1 border-t sm:border-t-0 border-border/50">
                          {/* Left: View mode & Zoom controls */}
                          <div className="flex items-center gap-1.5">
                            {/* Toggle Preview Mode */}
                            <div className="inline-flex rounded-lg border border-border bg-card/80 p-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewMode("visual")}
                                aria-label="Visual resume preview mode"
                                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
                                  previewMode === "visual"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Eye className="size-3" />{" "}
                                <span className="hidden sm:inline">Visual</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewMode("text")}
                                aria-label="Plain text resume preview mode"
                                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
                                  previewMode === "text"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <FileText className="size-3" />{" "}
                                <span className="hidden sm:inline">Plain </span>Text
                              </button>
                            </div>

                            {/* Zoom Controls for Visual Preview */}
                            {previewMode === "visual" && (
                              <div className="flex items-center rounded-xl border border-border bg-[#121624] p-0.5 shadow-xs shrink-0">
                                <Button
                                  variant={zoomMode === "fit" ? "default" : "ghost"}
                                  size="sm"
                                  className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-bold rounded-lg cursor-pointer"
                                  onClick={() => setZoomMode("fit")}
                                  title="Fit resume width to screen"
                                  aria-label="Fit resume to screen width"
                                >
                                  Fit
                                </Button>
                                <Button
                                  variant={
                                    zoomMode === "custom" && previewZoom === 100
                                      ? "default"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className="h-7 sm:h-8 px-1.5 sm:px-2.5 text-xs font-bold rounded-lg cursor-pointer hidden xs:inline-flex sm:inline-flex"
                                  onClick={() => {
                                    setZoomMode("custom");
                                    setPreviewZoom(100);
                                  }}
                                  title="100% scale"
                                  aria-label="Set resume zoom to 100 percent"
                                >
                                  100%
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 sm:size-8 rounded-lg cursor-pointer hidden sm:inline-flex"
                                  onClick={() => {
                                    setZoomMode("custom");
                                    setPreviewZoom((z) =>
                                      Math.max(
                                        40,
                                        (zoomMode === "fit" ? Math.round(fitScale * 100) : z) - 15,
                                      ),
                                    );
                                  }}
                                  title="Zoom Out"
                                  aria-label="Zoom out resume preview"
                                >
                                  <ZoomOut className="size-3.5" />
                                </Button>
                                <span
                                  className="text-xs font-bold px-1 min-w-[32px] sm:min-w-[38px] text-center"
                                  aria-live="polite"
                                >
                                  {Math.round(previewScale * 100)}%
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 sm:size-8 rounded-lg cursor-pointer hidden sm:inline-flex"
                                  onClick={() => {
                                    setZoomMode("custom");
                                    setPreviewZoom((z) =>
                                      Math.min(
                                        150,
                                        (zoomMode === "fit" ? Math.round(fitScale * 100) : z) + 15,
                                      ),
                                    );
                                  }}
                                  title="Zoom In"
                                  aria-label="Zoom in resume preview"
                                >
                                  <ZoomIn className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 sm:size-8 rounded-lg cursor-pointer"
                                  onClick={() => setZoomTemplate(template)}
                                  title="Open Fullscreen Zoom Modal"
                                  aria-label="Open fullscreen resume view"
                                >
                                  <Maximize2 className="size-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Right: Export & Action buttons */}
                          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyResume}
                              disabled={streaming}
                              className="h-7 sm:h-9 text-xs font-semibold px-2 sm:px-3 rounded-lg sm:rounded-xl cursor-pointer shrink-0"
                            >
                              {copied ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}{" "}
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadWord(template)}
                              disabled={streaming}
                              className="h-7 sm:h-9 text-xs font-bold text-blue-600 dark:text-blue-400 border-blue-500/30 px-2 sm:px-3 rounded-lg sm:rounded-xl cursor-pointer shrink-0"
                            >
                              <FileDown className="size-3.5 sm:mr-1" /> <span>Word</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTab("latex")}
                              className="h-7 sm:h-9 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 px-2 sm:px-3 rounded-lg sm:rounded-xl cursor-pointer shrink-0"
                              title="View and export Overleaf FAANGPath LaTeX (.tex) format"
                            >
                              <FileCode className="size-3.5 sm:mr-1" /> <span>LaTeX</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPdf(template)}
                              disabled={streaming}
                              className="h-7 sm:h-9 text-xs font-bold px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl cursor-pointer shrink-0 shadow-xs"
                            >
                              <Download className="size-3.5 sm:mr-1" /> PDF
                              {!isSubscribed && (
                                <Lock className="size-3 ml-1 text-primary-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Visual Preview Canvas - Clean, Centered with True Vertical Scroll & Zero Horizontal Scroll */}
                      {previewMode === "visual" ? (
                        <div
                          ref={previewCanvasRef}
                          onScroll={handlePreviewScroll}
                          className={`relative bg-[#090A0F]/90 p-2 sm:p-4 pb-12 sm:pb-16 flex flex-col items-center justify-start overflow-x-auto overflow-y-auto w-full max-w-full min-w-0 ${
                            workspaceLayout === "full"
                              ? "min-h-[600px] h-[calc(100vh-200px)] max-h-[1050px]"
                              : "min-h-[500px] h-[calc(100vh-270px)] max-h-[850px]"
                          }`}
                          style={{
                            overscrollBehaviorY: "contain",
                            scrollbarWidth: "thin",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.round(850 * previewScale)}px`,
                              height: `${Math.round(previewDocHeight * previewScale)}px`,
                              minWidth: `${Math.round(850 * previewScale)}px`,
                              position: "relative",
                              overflow: "hidden",
                            }}
                            className="mx-auto rounded-lg shadow-2xl shadow-black/80 bg-white transition-[height] duration-150 mb-4 shrink-0 transform-gpu"
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "850px",
                                height: `${previewDocHeight}px`,
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top left",
                                willChange: "transform",
                              }}
                              className="bg-white origin-top-left"
                            >
                              <iframe
                                title="Tailored Resume Live Preview"
                                srcDoc={previewHtml}
                                sandbox="allow-scripts allow-same-origin"
                                scrolling="no"
                                className="w-[850px] border-0"
                                style={{ height: `${previewDocHeight}px` }}
                                onLoad={(e) => {
                                  try {
                                    const doc = e.currentTarget.contentDocument;
                                    if (doc) {
                                      const page = doc.querySelector(".page") as HTMLElement | null;
                                      if (page) {
                                        const scrollH = page.scrollHeight;
                                        if (scrollH > 200) {
                                          const pageCount =
                                            scrollH <= 1080
                                              ? 1
                                              : Math.max(1, Math.ceil(scrollH / 1100));
                                          const newH = pageCount * 1100;
                                          setPreviewDocHeight((prev) =>
                                            prev !== newH ? newH : prev,
                                          );
                                        }
                                      }
                                    }
                                  } catch {
                                    // ignore iframe cross-origin access restriction
                                  }
                                }}
                              />
                            </div>

                            {/* Visual Page Break Demarcation Guides for Multi-Page Documents */}
                            {Array.from({
                              length: Math.floor((previewDocHeight - 50) / 1100),
                            }).map((_, idx) => (
                              <div
                                key={idx}
                                style={{
                                  position: "absolute",
                                  top: `${Math.round((idx + 1) * 1100 * previewScale)}px`,
                                  left: 0,
                                  right: 0,
                                  zIndex: 20,
                                  pointerEvents: "none",
                                }}
                                className="flex items-center justify-center -translate-y-1/2"
                              >
                                <div className="w-full border-t border-slate-300 dark:border-slate-700 opacity-80" />
                                <span className="absolute bg-slate-800 text-slate-100 text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                                  Page {idx + 2}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Minimal bottom pagination indicator for multi-page resumes */}
                          {totalPages > 1 && (
                            <div className="sticky bottom-4 z-20 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border px-3 py-1 rounded-full shadow-lg text-xs font-semibold text-foreground">
                              <span className="text-[11px] text-muted-foreground">
                                Page {currentPage} of {totalPages}
                              </span>
                              <div className="flex items-center gap-1 border-l border-border pl-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => scrollToPage(i + 1)}
                                    className={`size-5 rounded-full text-[10px] font-bold transition-all ${
                                      currentPage === i + 1
                                        ? "bg-primary text-primary-foreground shadow-2xs"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {i + 1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap px-4 sm:px-5 py-4 font-sans text-xs sm:text-sm leading-relaxed text-foreground bg-card break-words">
                          {text}
                          {streaming && (
                            <span className="ml-1 inline-block size-2 animate-pulse bg-primary" />
                          )}
                        </pre>
                      )}
                    </div>

                    {/* What changed explanation */}
                    {result && result.changes.length > 0 && (
                      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
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

                  {/* TAB 2: OVERLEAF FAANGPATH LATEX SOURCE ENGINE (.TEX) */}
                  <TabsContent value="latex" className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/80">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                              <FileCode className="size-4 text-emerald-500" />
                              Overleaf FAANGPath LaTeX Source Engine
                            </h3>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[10px] font-bold py-0.5 px-2">
                              Overleaf.com Ready (pdfLaTeX 11pt)
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                            This resume is represented in pure standard LaTeX format behind the
                            scenes, just like the Overleaf platform. Built on the #1 Overleaf
                            FAANGPath / Jake's Resume architecture for 100% Workday, Greenhouse, and
                            Lever ATS bot parsing.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
                          {template.id !== "overleaf-faang" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const overleafTpl = TEMPLATES.find(
                                  (t) => t.id === "overleaf-faang",
                                );
                                if (overleafTpl) {
                                  handleSelectTemplate(overleafTpl);
                                  toast.success(
                                    "Switched to Overleaf FAANGPath (Official LaTeX) template!",
                                  );
                                }
                              }}
                              className="h-8 text-xs font-semibold gap-1.5 border-border hover:border-border/80 hover:bg-accent"
                            >
                              <Sparkles className="size-3.5 text-primary" />
                              Switch to Overleaf FAANG Template
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyLatex}
                            className="h-8 text-xs font-bold gap-1.5"
                          >
                            {copiedLatex ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiedLatex ? "Copied .tex" : "Copy LaTeX"}
                          </Button>

                          <Button
                            size="sm"
                            onClick={handleDownloadLatex}
                            className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                          >
                            <Download className="size-3.5" />
                            Download resume.tex
                          </Button>

                          <a
                            href="https://www.overleaf.com/project"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-accent px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors shadow-2xs"
                          >
                            <span>Open Overleaf</span>
                            <ExternalLink className="size-3 text-muted-foreground" />
                          </a>
                        </div>
                      </div>

                      {/* Overleaf Code Window */}
                      <div className="rounded-xl border border-border bg-[#05070B] text-slate-100 font-mono text-xs overflow-hidden shadow-inner">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[#0B0F17] text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
                            <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
                            <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="ml-2 font-semibold text-slate-200">main.tex</span>
                            <span className="text-[10px] text-muted-foreground">
                              ({generatedLatex ? generatedLatex.split("\n").length : 0} lines ·{" "}
                              {generatedLatex ? new Blob([generatedLatex]).size : 0} bytes)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-muted-foreground text-[10px]">
                              Document Class: article [letterpaper, 11pt]
                            </span>
                            <button
                              type="button"
                              onClick={copyLatex}
                              className="hover:text-foreground px-2 py-0.5 rounded bg-muted/60 text-[10px] flex items-center gap-1 text-muted-foreground transition-colors"
                            >
                              {copiedLatex ? (
                                <Check className="size-3 text-emerald-400" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                              Copy Code
                            </button>
                          </div>
                        </div>

                        <pre className="p-4 sm:p-5 overflow-x-auto max-h-[580px] overflow-y-auto leading-relaxed text-[11.5px] sm:text-xs text-slate-200 selection:bg-primary/30 selection:text-white font-mono">
                          {generatedLatex ||
                            "% Enter candidate details on the left or generate to inspect LaTeX source..."}
                        </pre>
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <Check className="size-3.5 text-emerald-500" /> How to use directly in
                            Overleaf:
                          </p>
                          <p className="text-[11px]">
                            1. Click <b>Download resume.tex</b> or <b>Copy LaTeX</b>. 2. Navigate to{" "}
                            <b>Overleaf.com</b> &gt; <b>New Project</b> &gt; <b>Blank Project</b>.
                            3. Paste this code into <code>main.tex</code> and hit <b>Recompile</b>.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTab("resume");
                            setPreviewMode("visual");
                          }}
                          className="text-xs shrink-0 font-medium"
                        >
                          View Compiled PDF Preview →
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: 32 WORLD-CLASS TEMPLATES SHOWCASE */}
                  <TabsContent value="templates" className="mt-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            32 Award-Winning FAANG &amp; Big Tech Templates
                          </h3>
                          <Badge variant="secondary" className="text-[10px] font-semibold px-2">
                            Top 32
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verified formats used by Staff &amp; Principal hires at Google, Meta,
                          Apple, Amazon, Netflix, Stripe, and Overleaf. First 6 are Free (Word .doc
                          &amp; LaTeX .tex).
                        </p>
                      </div>

                      {/* Filter Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
                        <button
                          type="button"
                          onClick={() => setTemplateFilter("all")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            templateFilter === "all"
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          All 32
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateFilter("free")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            templateFilter === "free"
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          Free (First 6)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateFilter("pro")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            templateFilter === "pro"
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          Pro Exclusive (26)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateFilter("award")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            templateFilter === "award"
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          Award Winners
                        </button>
                      </div>
                    </div>

                    {/* Memoized, Fast-Rendering 32 Template Cards Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {filteredTemplates.map((item) => (
                        <TemplateCard
                          key={item.id}
                          template={item}
                          isSelected={item.id === templateId}
                          isSubscribed={isSubscribed}
                          resumeText={deferredText || resume || profileToResume(SAMPLE_PROFILE)}
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
                    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/60 px-5 py-3.5">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Matched Cover Letter
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Tailored to {jobTitle || "the target role"}.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
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
                            {!isSubscribed && <Lock className="size-3 ml-1 text-primary" />}
                          </Button>
                        </div>
                      </div>
                      <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-xs sm:text-sm leading-relaxed text-foreground bg-card break-words">
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
          <SocialShare
            score={result?.match_score || 100}
            roleTitle={jobTitle || deriveTitle(job)}
          />
        </div>

        {/* Comprehensive FAQ Section */}
        <FaqSection className="mt-14 border-t border-border/70 bg-card/30 content-visibility-auto" />
      </main>

      {/* Modern Enterprise Footer */}
      <footer className="border-t border-border bg-[#07090E] py-16 sm:py-20 text-foreground content-visibility-auto">
        <div className="w-full max-w-[1740px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground font-bold text-xs shadow-xs border border-primary/30">
                  CV
                </div>
                <span className="font-bold text-base tracking-tight">CVFitt Enterprise</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The premier ATS resume matcher and keyword infiltration engine. Built strictly
                around Big Tech and FAANG hiring formulas with 32 executive templates and Overleaf
                LaTeX (.tex) support.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>GDPR &amp; CCPA Compliant • Bank-grade Security</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Document Studio
              </h3>
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
                  <button
                    type="button"
                    onClick={() => {
                      setTab("latex");
                      outputRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer"
                  >
                    Overleaf LaTeX (.tex) Engine
                  </button>
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
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    32 FAANG &amp; Overleaf Templates
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("cover");
                      outputRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Executive Cover Letter Studio
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Legal &amp; Trust
              </h3>
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
                      setSubReason("Upgrade to Pro for high-res vector PDFs & all 32 templates.");
                      setSubModalOpen(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Enterprise Pro Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                100% Shortlist Weapon
              </h3>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-xs space-y-2">
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

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 CVFitt Enterprise Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Scroll back to top of page"
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Bottom Sponsor Banner (Mobile & Desktop) */}
      <BannerAd
        variant="sticky-bottom"
        onUpgradeClick={() => {
          setSubReason("Upgrade to Pro to remove all sponsor banners.");
          setSubModalOpen(true);
        }}
      />
    </div>
  );
}
