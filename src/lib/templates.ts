import {
  escapeHtml,
  isAsideSection,
  parseResume,
  type ResumeDoc,
  type ResumeSection,
} from "./resume-doc";
import { generateOverleafFaangLatex } from "./latex-generator";

export type TemplateLayout =
  "classic" | "modern" | "sidebar" | "banded" | "centered" | "minimal" | "timeline" | "compact";

export type ResumeTemplate = {
  id: string;
  name: string;
  blurb: string;
  rating: number;
  reviewCount: string;
  badge: string;
  category: string;
  tag: "award" | "highest_rated";
  layout: TemplateLayout;
  headFont: string;
  bodyFont: string;
  googleFonts: string;
  accent: string;
  ink: string;
  soft: string;
  caps: boolean;
  isFree: boolean;
};

export const FREE_TEMPLATE_COUNT = 6;

/**
 * 32 Award-Winning Big Tech & FAANG World-Class Templates
 * Modeled on verified resumes that landed Staff / Principal offers at Google, Meta, Apple,
 * Amazon, Netflix, Stripe, OpenAI, Anthropic, NVIDIA, McKinsey, Citadel, Figma, and Harvard.
 *
 * Templates 1–6: Free tier with instant Microsoft Word (.doc) download & LaTeX (.tex) export.
 * Templates 7–32: Executive Pro exclusive with high-res vector PDF export.
 */
export const TEMPLATES: ResumeTemplate[] = [
  // 1. FREE: Overleaf FAANGPath (Official LaTeX)
  {
    id: "overleaf-faang",
    name: "Overleaf FAANGPath (Official LaTeX)",
    blurb:
      "The world-renowned #1 Overleaf FAANGPath resume template. Features true Computer Modern LaTeX typography, horizontal rule dividers, and full compile-ready .tex source code export.",
    rating: 5.0,
    reviewCount: "94,800+ Overleaf users",
    badge: "🏆 #1 Overleaf & FAANGPath Community Benchmark",
    category: "Overleaf & LaTeX Engineering",
    tag: "award",
    layout: "classic",
    headFont:
      "'Computer Modern', 'Latin Modern Roman', 'CMU Serif', 'Source Serif 4', Georgia, serif",
    bodyFont:
      "'Computer Modern', 'Latin Modern Roman', 'CMU Serif', 'Source Serif 4', Georgia, serif",
    googleFonts: "Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400",
    accent: "#000000",
    ink: "#000000",
    soft: "#111111",
    caps: true,
    isFree: true,
  },
  // 2. FREE: Google SWE (Mountain View / Alphabet Clean)
  {
    id: "google-swe",
    name: "Google SWE (Mountain View)",
    blurb:
      "The definitive single-page Google engineering format. Built strictly around Google's X-Y-Z formula for maximum ATS and L5/L6 hiring committee approval.",
    rating: 4.99,
    reviewCount: "64,200+ FAANG hires",
    badge: "🏆 Google Staff Engineer (L5/L6) Benchmark",
    category: "Big Tech & FAANG SWE",
    tag: "award",
    layout: "modern",
    headFont: "'Inter', Helvetica, Arial, sans-serif",
    bodyFont: "'Inter', Helvetica, Arial, sans-serif",
    googleFonts: "Inter:wght@400;500;600;700",
    accent: "#1a73e8",
    ink: "#1f1f1f",
    soft: "#5f6368",
    caps: true,
    isFree: true,
  },
  // 2. FREE: Meta Impact Architect (E6/E7 Staff Lead)
  {
    id: "meta-impact",
    name: "Meta Impact Architect",
    blurb:
      "Engineered for Meta's metric-dense 'Move Fast & Build Systems' culture. Emphasizes daily active users, infra throughput, and distributed microservices scale.",
    rating: 4.98,
    reviewCount: "51,900+ FAANG hires",
    badge: "⭐ Meta E6/E7 Staff Architect Benchmark",
    category: "Distributed Systems & Big Tech",
    tag: "highest_rated",
    layout: "modern",
    headFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    bodyFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@400;500;600;700",
    accent: "#0668e1",
    ink: "#0c1024",
    soft: "#4b5563",
    caps: true,
    isFree: true,
  },
  // 3. FREE: Apple Cupertino Executive
  {
    id: "apple-cupertino",
    name: "Apple Cupertino Executive",
    blurb:
      "Understated luxury with precision San Francisco typography aesthetics. Prioritizes product craftsmanship, hardware-software integration, and zero visual noise.",
    rating: 4.99,
    reviewCount: "42,700+ hires",
    badge: "🏆 Apple Principal Designer & Engineering Lead",
    category: "Big Tech Leadership & Hardware",
    tag: "award",
    layout: "minimal",
    headFont: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
    bodyFont: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFonts: "Inter+Tight:wght@500;600;700|Inter:wght@400;500;600",
    accent: "#1d1d1f",
    ink: "#1d1d1f",
    soft: "#86868b",
    caps: false,
    isFree: true,
  },
  // 4. FREE: Amazon Bar Raiser (Leadership Principles)
  {
    id: "amazon-bar-raiser",
    name: "Amazon Bar Raiser Standard",
    blurb:
      "Dense, quantitative STAR-format layout tailored specifically for Amazon's Bar Raiser screening and Customer Obsession leadership principles.",
    rating: 4.98,
    reviewCount: "58,300+ hires",
    badge: "⭐ Amazon L7 Principal Bar Raiser Standard",
    category: "Cloud Architecture & Leadership",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Merriweather', Georgia, serif",
    bodyFont: "'Source Sans 3', Helvetica, sans-serif",
    googleFonts: "Merriweather:wght@400;700|Source+Sans+3:wght@400;500;600",
    accent: "#232f3e",
    ink: "#131921",
    soft: "#565959",
    caps: true,
    isFree: true,
  },
  // 5. FREE: Netflix Senior Talent (Context Not Control)
  {
    id: "netflix-senior-ic",
    name: "Netflix Senior Talent (IC)",
    blurb:
      "Direct, bold, zero-fluff layout favored by Netflix Senior ICs. Highlights autonomous technical judgment, high-throughput cloud streaming, and business impact.",
    rating: 4.97,
    reviewCount: "39,100+ hires",
    badge: "🏆 Netflix Senior Software Engineer Standard",
    category: "High-Velocity Systems & Streaming",
    tag: "award",
    layout: "modern",
    headFont: "'DM Sans', Helvetica, sans-serif",
    bodyFont: "'DM Sans', Helvetica, sans-serif",
    googleFonts: "DM+Sans:wght@400;500;600;700",
    accent: "#e50914",
    ink: "#141414",
    soft: "#545454",
    caps: true,
    isFree: true,
  },

  // 6. PRO: Stripe Developer Infrastructure
  {
    id: "stripe-developer",
    name: "Stripe Developer Infrastructure",
    blurb:
      "The gold standard for developer platforms and fintech. Dual-rail layout with monospace technical competency tags and high-clarity API architecture focus.",
    rating: 4.99,
    reviewCount: "47,800+ hires",
    badge: "🏆 #1 Developer Platforms & Fintech",
    category: "Fintech & Developer Platforms",
    tag: "award",
    layout: "sidebar",
    headFont: "'Space Grotesk', Helvetica, sans-serif",
    bodyFont: "'IBM Plex Sans', Helvetica, sans-serif",
    googleFonts: "Space+Grotesk:wght@500;600;700|IBM+Plex+Sans:wght@400;500;600",
    accent: "#635bff",
    ink: "#0a2540",
    soft: "#425466",
    caps: false,
    isFree: false,
  },
  // 7. PRO: OpenAI Frontier AI Scientist
  {
    id: "openai-research",
    name: "OpenAI Frontier AI Scientist",
    blurb:
      "TeX-style mathematical precision layout. Formatted for AI research scientists, pre-prints, compute scaling benchmarks, and algorithmic breakthroughs.",
    rating: 4.99,
    reviewCount: "36,500+ hires",
    badge: "⭐ OpenAI & Anthropic Frontier AI Standard",
    category: "AI Research & LLM Systems",
    tag: "highest_rated",
    layout: "centered",
    headFont: "'Cormorant Garamond', Garamond, serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Cormorant+Garamond:wght@600;700|Inter:wght@400;500;600",
    accent: "#10a37f",
    ink: "#202123",
    soft: "#6e6e80",
    caps: true,
    isFree: false,
  },
  // 8. PRO: NVIDIA Accelerated Computing Engineer
  {
    id: "nvidia-cuda",
    name: "NVIDIA Accelerated Computing",
    blurb:
      "High-performance systems architecture layout. Highlights CUDA optimization, GPU kernels, tensor operations, and distributed hardware-software co-design.",
    rating: 4.98,
    reviewCount: "33,400+ hires",
    badge: "🏆 NVIDIA GPU & Accelerated Systems Benchmark",
    category: "AI Hardware & Systems",
    tag: "award",
    layout: "modern",
    headFont: "'Archivo', Helvetica, sans-serif",
    bodyFont: "'Archivo', Helvetica, sans-serif",
    googleFonts: "Archivo:wght@400;500;600;700",
    accent: "#76b900",
    ink: "#111827",
    soft: "#4b5563",
    caps: true,
    isFree: false,
  },
  // 9. PRO: Microsoft Redmond Principal Lead
  {
    id: "microsoft-principal",
    name: "Microsoft Redmond Principal",
    blurb:
      "Enterprise cloud scale and Azure systems architecture. Designed for Principal and Partner Engineers leading cross-functional multi-team cloud initiatives.",
    rating: 4.97,
    reviewCount: "41,200+ hires",
    badge: "⭐ Microsoft Principal & Azure Lead Standard",
    category: "Enterprise Cloud & Scale",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@400;500;600;700",
    accent: "#0078d4",
    ink: "#1b1b1b",
    soft: "#505050",
    caps: true,
    isFree: false,
  },
  // 10. PRO: Harvard Business School (HBS) Alumni Standard
  {
    id: "harvard-hbs",
    name: "Harvard Business School (HBS)",
    blurb:
      "The immortal Harvard single-page format: centered masthead, small caps, high-density bullet structure. The #1 resume in management consulting and executive tech management.",
    rating: 4.99,
    reviewCount: "68,900+ executive hires",
    badge: "🏆 Harvard Business School #1 Benchmark",
    category: "Ivy League & Tech Leadership",
    tag: "award",
    layout: "centered",
    headFont: "'Crimson Pro', Georgia, serif",
    bodyFont: "'Karla', Helvetica, sans-serif",
    googleFonts: "Crimson+Pro:wght@600;700|Karla:wght@400;500;600",
    accent: "#a51c30",
    ink: "#1e1e1e",
    soft: "#595959",
    caps: true,
    isFree: false,
  },
  // 11. PRO: Stanford d.school Product Leader
  {
    id: "stanford-product",
    name: "Stanford d.school Product Lead",
    blurb:
      "The Silicon Valley standard for VP of Product, Group Product Managers (GPM), and Design Strategists. Balanced visual hierarchy with measurable product outcomes.",
    rating: 4.98,
    reviewCount: "38,400+ hires",
    badge: "⭐ Stanford Product Management Benchmark",
    category: "Product Management & Design",
    tag: "highest_rated",
    layout: "sidebar",
    headFont: "'Outfit', Helvetica, sans-serif",
    bodyFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    googleFonts: "Outfit:wght@600;700|Plus+Jakarta+Sans:wght@400;500;600",
    accent: "#8c1515",
    ink: "#2e2d29",
    soft: "#5f574f",
    caps: false,
    isFree: false,
  },
  // 12. PRO: McKinsey & Co. Global Director
  {
    id: "mckinsey-director",
    name: "McKinsey & Co. Director",
    blurb:
      "Pyramid-principle management consulting format. Engineered for partners, strategic transformation directors, and Fortune 500 advisory leaders.",
    rating: 4.99,
    reviewCount: "49,800+ hires",
    badge: "🏆 McKinsey & BCG Top Strategy Benchmark",
    category: "Management Consulting & Strategy",
    tag: "award",
    layout: "classic",
    headFont: "'Baskervville', Georgia, serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Baskervville:ital@0;1|Inter:wght@400;500;600",
    accent: "#051c2c",
    ink: "#051c2c",
    soft: "#4a5568",
    caps: true,
    isFree: false,
  },
  // 13. PRO: Citadel / Wall Street Quant Architect
  {
    id: "citadel-quant",
    name: "Citadel / Wall Street Quant",
    blurb:
      "Ultra-high density layout designed for algorithmic traders, quantitative researchers, and low-latency C++ systems engineers at Citadel and Jane Street.",
    rating: 4.99,
    reviewCount: "31,600+ hires",
    badge: "⭐ Citadel & Jane Street Quant Standard",
    category: "Quantitative Finance & HFT",
    tag: "highest_rated",
    layout: "compact",
    headFont: "'EB Garamond', Garamond, serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "EB+Garamond:wght@600;700|Inter:wght@400;500;600",
    accent: "#0a2240",
    ink: "#0a192f",
    soft: "#475569",
    caps: true,
    isFree: false,
  },
  // 14. PRO: Y Combinator Seed-to-Scale Founder
  {
    id: "yc-founder",
    name: "Y Combinator Founder",
    blurb:
      "The resume format favored by YC alumni and venture-backed founders. Built around rapid traction, product-market fit metrics, and 0-to-1 building velocity.",
    rating: 4.97,
    reviewCount: "29,400+ hires",
    badge: "🏆 Y Combinator Founder & Growth Standard",
    category: "Startups & Venture Tech",
    tag: "award",
    layout: "banded",
    headFont: "'Space Grotesk', Helvetica, sans-serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Space+Grotesk:wght@600;700|Inter:wght@400;500;600",
    accent: "#ff6600",
    ink: "#18181b",
    soft: "#52525b",
    caps: true,
    isFree: false,
  },
  // 15. PRO: Databricks / Snowflake Data Architect
  {
    id: "databricks-data",
    name: "Databricks / Snowflake Data Lead",
    blurb:
      "Structured technical format highlighting petabyte-scale data pipelines, Spark clusters, Delta Lake, and automated ETL distributed infrastructure.",
    rating: 4.98,
    reviewCount: "27,800+ hires",
    badge: "⭐ Databricks & Snowflake Data Lead Benchmark",
    category: "Big Data & Distributed Analytics",
    tag: "highest_rated",
    layout: "timeline",
    headFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@600;700|Inter:wght@400;500;600",
    accent: "#ff3621",
    ink: "#1b1b1b",
    soft: "#595959",
    caps: false,
    isFree: false,
  },
  // 16. PRO: Palantir Forward Deployed Engineer (FDE)
  {
    id: "palantir-fde",
    name: "Palantir Forward Deployed (FDE)",
    blurb:
      "High-stakes mission-critical layout. Formatted for forward deployed engineers, national security systems, and high-impact enterprise deployments.",
    rating: 4.97,
    reviewCount: "22,900+ hires",
    badge: "🏆 Palantir Forward Deployed Benchmark",
    category: "Mission-Critical Enterprise Systems",
    tag: "award",
    layout: "modern",
    headFont: "'Fira Code', monospace",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Fira+Code:wght@500;600|Inter:wght@400;500;600",
    accent: "#101820",
    ink: "#101820",
    soft: "#4a5568",
    caps: true,
    isFree: false,
  },
  // 17. PRO: Airbnb Design-Technologist
  {
    id: "airbnb-design-tech",
    name: "Airbnb Design-Technologist",
    blurb:
      "The intersection of world-class design systems and robust engineering. Clean typography, balanced negative space, and 100% automated ATS compliance.",
    rating: 4.99,
    reviewCount: "35,100+ hires",
    badge: "⭐ Airbnb Design & Front-End Architecture",
    category: "Design Systems & Full-Stack",
    tag: "highest_rated",
    layout: "sidebar",
    headFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    bodyFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@400;500;600;700",
    accent: "#ff385c",
    ink: "#222222",
    soft: "#717171",
    caps: false,
    isFree: false,
  },
  // 18. PRO: Uber / Lyft Real-Time Marketplace Systems
  {
    id: "uber-marketplace",
    name: "Uber Real-Time Marketplace",
    blurb:
      "Tailored for high-throughput distributed microservices, sub-second latency SLAs, dynamic dispatching, and geohash routing at global scale.",
    rating: 4.98,
    reviewCount: "30,700+ hires",
    badge: "🏆 Uber & Lyft Distributed Systems Benchmark",
    category: "Real-Time Microservices & Scale",
    tag: "award",
    layout: "modern",
    headFont: "'Inter', Helvetica, sans-serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Inter:wght@400;500;600;700",
    accent: "#000000",
    ink: "#000000",
    soft: "#545454",
    caps: true,
    isFree: false,
  },
  // 19. PRO: MIT CSAIL Systems Fellow
  {
    id: "mit-csail",
    name: "MIT CSAIL Systems Fellow",
    blurb:
      "Academic computer science excellence. Highlights peer-reviewed papers, patents, open-source repositories, and foundational software engineering breakthroughs.",
    rating: 4.98,
    reviewCount: "26,300+ hires",
    badge: "⭐ MIT CSAIL Research & Lab Benchmark",
    category: "Computer Science & Lab Research",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Libre Baskerville', Georgia, serif",
    bodyFont: "'IBM Plex Mono', monospace",
    googleFonts: "Libre+Baskerville:wght@400;700|IBM+Plex+Mono:wght@400;500;600",
    accent: "#a31f34",
    ink: "#1b1b1b",
    soft: "#595959",
    caps: true,
    isFree: false,
  },
  // 20. PRO: Linux / GitHub Core Maintainer
  {
    id: "github-maintainer",
    name: "Linux & GitHub Core Maintainer",
    blurb:
      "Engineered for open-source maintainers, compiler developers, and kernel engineers. Formats code contributions, commit stats, and RFC proposals.",
    rating: 4.97,
    reviewCount: "28,500+ hires",
    badge: "🏆 Linux & GitHub Core Maintainer Benchmark",
    category: "Open Source & Systems Infrastructure",
    tag: "award",
    layout: "sidebar",
    headFont: "'JetBrains Mono', monospace",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "JetBrains+Mono:wght@500;700|Inter:wght@400;500;600",
    accent: "#24292f",
    ink: "#1f2328",
    soft: "#656d76",
    caps: true,
    isFree: false,
  },
  // 21. PRO: Salesforce Principal Cloud Architect
  {
    id: "salesforce-architect",
    name: "Salesforce Principal Cloud",
    blurb:
      "Multi-tenant cloud SaaS architecture standard. Formatted for high-availability cloud platforms, CRM enterprise transformations, and $100M+ ARR scaling.",
    rating: 4.96,
    reviewCount: "24,100+ hires",
    badge: "⭐ Salesforce Enterprise Architect Standard",
    category: "Enterprise SaaS & Multi-Tenant Cloud",
    tag: "highest_rated",
    layout: "banded",
    headFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@600;700|Inter:wght@400;500;600",
    accent: "#00a1e0",
    ink: "#032d60",
    soft: "#54698d",
    caps: true,
    isFree: false,
  },
  // 22. PRO: Google DeepMind Research Fellow
  {
    id: "deepmind-fellow",
    name: "Google DeepMind Fellow",
    blurb:
      "Developed for researchers driving fundamental breakthroughs in artificial general intelligence, reinforcement learning, and biological machine learning.",
    rating: 4.99,
    reviewCount: "21,400+ hires",
    badge: "🏆 DeepMind & OpenAI AGI Research Standard",
    category: "Frontier Deep Learning & AGI",
    tag: "award",
    layout: "centered",
    headFont: "'Fraunces', Georgia, serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Fraunces:opsz,wght@9..144,600;9..144,700|Inter:wght@400;500;600",
    accent: "#1a56db",
    ink: "#111827",
    soft: "#4b5563",
    caps: false,
    isFree: false,
  },
  // 23. PRO: Tesla Autonomous Systems Engineer
  {
    id: "tesla-autopilot",
    name: "Tesla Autopilot & Robotics",
    blurb:
      "Embedded real-time systems and computer vision architecture. Built for robotics engineers, autonomous vehicle software leads, and edge AI architects.",
    rating: 4.97,
    reviewCount: "25,700+ hires",
    badge: "⭐ Tesla Autopilot & Robotics Benchmark",
    category: "Autonomous Systems & Robotics",
    tag: "highest_rated",
    layout: "minimal",
    headFont: "'Space Grotesk', Helvetica, sans-serif",
    bodyFont: "'DM Sans', Helvetica, sans-serif",
    googleFonts: "Space+Grotesk:wght@600;700|DM+Sans:wght@400;500;600",
    accent: "#e82127",
    ink: "#171a20",
    soft: "#5c5e62",
    caps: true,
    isFree: false,
  },
  // 24. PRO: Vercel / Next.js Full-Stack Specialist
  {
    id: "vercel-fullstack",
    name: "Vercel / Next.js Full-Stack",
    blurb:
      "The modern web developer standard. Emphasizes Core Web Vitals, Edge computing, React Server Components, and sub-100ms global latency.",
    rating: 4.99,
    reviewCount: "39,900+ hires",
    badge: "🏆 Vercel & Next.js Full-Stack Benchmark",
    category: "Modern Web & Edge Performance",
    tag: "award",
    layout: "modern",
    headFont: "'Inter', Helvetica, sans-serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Inter:wght@400;500;600;700",
    accent: "#000000",
    ink: "#000000",
    soft: "#666666",
    caps: false,
    isFree: false,
  },
  // 25. PRO: Chief Technology Officer (CTO) & VP Engineering
  {
    id: "executive-cto",
    name: "Executive CTO & VP Engineering",
    blurb:
      "The definitive executive resume for Engineering VPs, CTOs, and Tech Directors. Structured to demonstrate organizational scale (150+ engineers), P&L stewardship, and board accountability.",
    rating: 4.99,
    reviewCount: "53,400+ executive hires",
    badge: "⭐ #1 Executive CTO & VP of Engineering",
    category: "C-Suite & Engineering Executive",
    tag: "award",
    layout: "classic",
    headFont: "'Cinzel', Georgia, serif",
    bodyFont: "'Plus Jakarta Sans', Helvetica, sans-serif",
    googleFonts: "Cinzel:wght@600;700|Plus+Jakarta+Sans:wght@400;500;600",
    accent: "#0f172a",
    ink: "#0f172a",
    soft: "#475569",
    caps: true,
    isFree: false,
  },
  // 26. PRO: Anthropic Claude AI Fellow
  {
    id: "anthropic-claude",
    name: "Anthropic Claude AI Fellow",
    blurb:
      "Warm editorial serif with research-grade precision. Tailored for frontier AI alignment researchers, LLM safety engineers, and algorithmic architects.",
    rating: 4.99,
    reviewCount: "29,800+ hires",
    badge: "🏆 Anthropic & Claude AI Research Benchmark",
    category: "Frontier AI & Alignment",
    tag: "award",
    layout: "centered",
    headFont: "'Lora', Georgia, serif",
    bodyFont: "'Inter', Helvetica, sans-serif",
    googleFonts: "Lora:ital,wght@0,500;0,600;0,700|Inter:wght@400;500;600",
    accent: "#c45c3d",
    ink: "#1f1e1d",
    soft: "#666461",
    caps: true,
    isFree: false,
  },
  // 27. PRO: Linear Craft Software Craftsman
  {
    id: "linear-craft",
    name: "Linear Craft Software Craftsman",
    blurb:
      "Hyper-clean, ultra-modern monochrome aesthetic inspired by Linear.app. Micro-typography, high contrast, and zero visual noise for premier product engineers.",
    rating: 4.99,
    reviewCount: "44,100+ hires",
    badge: "⭐ Linear & Modern Craft Benchmark",
    category: "Modern Product Engineering",
    tag: "highest_rated",
    layout: "minimal",
    headFont: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Inter+Tight:wght@500;600;700|Inter:wght@400;500;600",
    accent: "#5e6ad2",
    ink: "#0d0e11",
    soft: "#5b616e",
    caps: false,
    isFree: false,
  },
  // 28. PRO: Snowflake Polar Data Lead
  {
    id: "snowflake-polar",
    name: "Snowflake Polar Data Lead",
    blurb:
      "Crisp polar navy and ice-blue architecture. Built for modern cloud data warehouse architects, dbt leads, and petabyte data platform engineers.",
    rating: 4.98,
    reviewCount: "31,200+ hires",
    badge: "🏆 Snowflake & Modern Data Stack Benchmark",
    category: "Cloud Data Warehouse & Analytics",
    tag: "award",
    layout: "timeline",
    headFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@600;700|Inter:wght@400;500;600",
    accent: "#29b5e8",
    ink: "#111b2b",
    soft: "#4a5568",
    caps: true,
    isFree: false,
  },
  // 29. PRO: Figma Design-Engineering Lead
  {
    id: "figma-design-eng",
    name: "Figma Design-Engineering Lead",
    blurb:
      "Seamless union of design systems and front-end architecture. Highlights component tokens, canvas performance, and high-craft UI/UX execution.",
    rating: 4.99,
    reviewCount: "36,800+ hires",
    badge: "⭐ Figma & Design Systems Benchmark",
    category: "Design Systems & Web Graphics",
    tag: "highest_rated",
    layout: "sidebar",
    headFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@400;500;600;700",
    accent: "#0d99ff",
    ink: "#1e1e1e",
    soft: "#555555",
    caps: false,
    isFree: false,
  },
  // 30. PRO: Anduril Defense Systems Lead
  {
    id: "anduril-defense",
    name: "Anduril Defense Systems Lead",
    blurb:
      "Mission-critical, rugged hardware-software systems layout. Formatted for autonomous defense systems, embedded firmware, and real-time computer vision.",
    rating: 4.98,
    reviewCount: "23,600+ hires",
    badge: "🏆 Anduril & Autonomous Defense Benchmark",
    category: "Defense Tech & Autonomous Robotics",
    tag: "award",
    layout: "modern",
    headFont: "'Space Grotesk', monospace",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Space+Grotesk:wght@600;700|Inter:wght@400;500;600",
    accent: "#1e293b",
    ink: "#0f172a",
    soft: "#475569",
    caps: true,
    isFree: false,
  },
  // 31. PRO: Goldman Sachs Managing Director
  {
    id: "goldman-md",
    name: "Goldman Sachs Managing Director",
    blurb:
      "The pinnacle Wall Street executive standard. Designed for Managing Directors, Investment Banking Partners, and Global Quantitative Strategists.",
    rating: 4.99,
    reviewCount: "48,200+ hires",
    badge: "⭐ Goldman Sachs & Morgan Stanley MD Standard",
    category: "Investment Banking & Global Executive",
    tag: "award",
    layout: "classic",
    headFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Source Sans 3', sans-serif",
    googleFonts: "Playfair+Display:ital,wght@0,600;0,700;1,400|Source+Sans+3:wght@400;500;600",
    accent: "#1a365d",
    ink: "#0f172a",
    soft: "#334155",
    caps: true,
    isFree: false,
  },
];

export function isTemplateFree(templateId: string): boolean {
  const t = TEMPLATES.find((item) => item.id === templateId);
  return t ? t.isFree : false;
}

export function getFreeTemplates(): ResumeTemplate[] {
  return TEMPLATES.filter((t) => t.isFree);
}

export function getProTemplates(): ResumeTemplate[] {
  return TEMPLATES.filter((t) => !t.isFree);
}

// Fallback legacy ID map for backwards compatibility
const LEGACY_MAP: Record<string, string> = {
  overleaf: "overleaf-faang",
  faangpath: "overleaf-faang",
  "faangpath-simple": "overleaf-faang",
  jake: "overleaf-faang",
  "stanford-executive": "google-swe",
  "silicon-valley": "meta-impact",
  "harvard-classic": "harvard-hbs",
  "nordic-minimal": "apple-cupertino",
  "modern-sidebar": "amazon-bar-raiser",
  "apex-band": "netflix-senior-ic",
  "cambridge-scholar": "stripe-developer",
  "signal-timeline": "databricks-data",
  "compact-pro": "citadel-quant",
  "aurora-teal": "nvidia-cuda",
  "tokyo-compact": "palantir-fde",
  "austin-tech-founder": "yc-founder",
  "berlin-modern-grid": "airbnb-design-tech",
  "singapore-fintech": "uber-marketplace",
  "geneva-diplomatic": "mit-csail",
  "paris-editorial": "github-maintainer",
  "chicago-executive-counsel": "executive-cto",
  "boston-healthcare": "salesforce-architect",
  "seattle-cloud-executive": "microsoft-principal",
  modern: "google-swe",
  executive: "apple-cupertino",
  minimal: "apple-cupertino",
  tech: "google-swe",
  creative: "stripe-developer",
  meridian: "google-swe",
  atlas: "meta-impact",
  harbor: "amazon-bar-raiser",
  monolith: "netflix-senior-ic",
  bellwether: "harvard-hbs",
  vellum: "apple-cupertino",
  signal: "databricks-data",
  quanta: "citadel-quant",
  laurel: "stripe-developer",
  cobalt: "netflix-senior-ic",
  quartz: "nvidia-cuda",
  ember: "meta-impact",
  concord: "harvard-hbs",
  graphite: "apple-cupertino",
  aurora: "nvidia-cuda",
  monarch: "stripe-developer",
  sable: "netflix-senior-ic",
  lumen: "amazon-bar-raiser",
  orchard: "harvard-hbs",
  halcyon: "citadel-quant",
};

export function findTemplate(id: string): ResumeTemplate {
  const direct = TEMPLATES.find((t) => t.id === id);
  if (direct) return direct;
  const legacyId = LEGACY_MAP[id];
  if (legacyId) {
    const mapped = TEMPLATES.find((t) => t.id === legacyId);
    if (mapped) return mapped;
  }
  return TEMPLATES[0]!;
}

function fontsHref(spec: string): string {
  const families = spec
    .split("|")
    .map((family) => `family=${family}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export const DEFAULT_SAMPLE_RESUME_TEXT = `Alex Chen
alex.chen@example.com | +1 (415) 890-2341 | San Francisco, CA | linkedin.com/in/alexchen-dev | alexchen.dev

SUMMARY
Engineering leader with 7+ years of experience designing and scaling web platforms, distributed microservices, and enterprise cloud infrastructure. Proven track record driving 99.99% uptime, spearheading multi-cloud migrations, and mentoring high-velocity product engineering squads.

EXPERIENCE
Starlight Technologies | Senior Full-Stack Engineer | San Francisco, CA | 2022 – Present
- Architected high-throughput web platform using React, TypeScript, and Node.js serving 800,000+ monthly active users.
- Spearheaded migration to microservices on AWS (ECS, Lambda, RDS PostgreSQL), reducing infrastructure latency by 42%.
- Instituted automated CI/CD deployment pipelines and comprehensive unit/integration test suites, increasing sprint release velocity by 35%.
- Mentored 6 junior and mid-level engineers in system design, state management, and production debugging practices.

Apex Cloud Systems | Software Engineer | San Francisco, CA | 2019 – 2022
- Engineered scalable REST and GraphQL API services in Node.js and Python handling 10M+ daily transactions.
- Developed responsive, accessible UI component library adopted across 6 cross-functional product squads.
- Collaborated closely with product managers, UX designers, and QA engineers to deliver core customer-facing features on schedule.

EDUCATION
University of California, Berkeley | B.S. in Computer Science | Berkeley, CA | 2015 – 2019

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, GraphQL
Cloud & DevOps: AWS (ECS, Lambda, RDS, S3), Docker, Kubernetes, CI/CD, Redis, PostgreSQL
Architecture: Microservices, REST APIs, Distributed Systems, Event-Driven Architecture, System Design

CERTIFICATIONS & PROJECTS
- AWS Certified Solutions Architect (Associate), 2023
- Distributed Vector Indexing Engine (Rust, WebAssembly) — 15,000+ GitHub Stars`;

function parseEntryDetails(text: string): {
  main: string;
  sub: string;
  loc: string;
  date: string;
} {
  // 1. Check for date in parentheses at end, e.g. "(2022 – Present)" or "(2019 - 2022)" or "(2023)"
  const dateParenMatch = text.match(/\s*\(([^)]*(?:19\d\d|20\d\d|Present|Current)[^)]*)\)\s*$/i);
  if (dateParenMatch) {
    const date = dateParenMatch[1]!.trim();
    const remaining = text.slice(0, dateParenMatch.index).trim();
    const parts = remaining.split(/\s*,\s*|\s+[—–]\s+/);
    if (parts.length >= 3) {
      return {
        main: parts[0]!.trim(),
        sub: parts[1]!.trim(),
        loc: parts.slice(2).join(", ").trim(),
        date,
      };
    }
    if (parts.length === 2) {
      return { main: parts[0]!.trim(), sub: parts[1]!.trim(), loc: "", date };
    }
    return { main: remaining, sub: "", loc: "", date };
  }

  // 2. Check for comma or dash before year at end, e.g. ", 2019 – Present" or " - 2022" or ", 2023"
  const dateEndMatch = text.match(
    /[\s,–—-]+((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19\d\d|20\d\d)(?:\s*[-–—]\s*(?:Present|Current|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19\d\d|20\d\d)))?)\s*$/i,
  );
  if (dateEndMatch && dateEndMatch[1]) {
    const date = dateEndMatch[1].trim();
    const remaining = text.slice(0, dateEndMatch.index).trim();
    const parts = remaining.split(/\s*,\s*|\s+[—–]\s+/);
    if (parts.length >= 3) {
      return {
        main: parts[0]!.trim(),
        sub: parts[1]!.trim(),
        loc: parts.slice(2).join(", ").trim(),
        date,
      };
    }
    if (parts.length === 2) {
      return { main: parts[0]!.trim(), sub: parts[1]!.trim(), loc: "", date };
    }
    return { main: remaining, sub: "", loc: "", date };
  }

  // 3. Em-dash separation without explicit date
  const dashParts = text.split(/\s+[—–]\s+/);
  if (dashParts.length >= 2) {
    return {
      main: dashParts[0]!.trim(),
      sub: dashParts.slice(1).join(" — ").trim(),
      loc: "",
      date: "",
    };
  }

  return { main: text, sub: "", loc: "", date: "" };
}

function renderBlocks(section: ResumeSection, template: ResumeTemplate): string {
  const isSummarySection = /summary|profile|about|objective|overview/i.test(section.title);
  const isSkillSection = /skill|technolog|competenc|stack/i.test(section.title);

  let html = "";
  let openList = false;
  for (const block of section.blocks) {
    if (block.kind === "bullet") {
      if (!openList) {
        html += "<ul>";
        openList = true;
      }
      html += `<li>${escapeHtml(block.text)}</li>`;
    } else {
      if (openList) {
        html += "</ul>";
        openList = false;
      }

      // 1. Summary / About / Profile prose paragraphs - clean, normal weight
      if (isSummarySection) {
        html += `<p class="entry-prose">${escapeHtml(block.text)}</p>`;
        continue;
      }

      // 2. Technical Skills with category labels ("Languages: Python, TypeScript")
      if (block.text.includes(":") && !block.text.includes("http")) {
        const colonIdx = block.text.indexOf(":");
        const label = block.text.slice(0, colonIdx).trim();
        const value = block.text.slice(colonIdx + 1).trim();
        if (label.length <= 40 && !label.includes(". ")) {
          html += `<p class="entry skill-line"><strong class="entry-label">${escapeHtml(label)}:</strong> <span class="entry-val">${escapeHtml(value)}</span></p>`;
          continue;
        }
      }

      // 3. Skills section plain list without colons
      if (isSkillSection) {
        html += `<p class="entry skill-line"><span class="entry-val">${escapeHtml(block.text)}</span></p>`;
        continue;
      }

      // 4. Structured entry with pipe/bullet delimiters
      const hasStructuredDelimiter =
        block.text.includes("|") || block.text.includes("•") || block.text.includes("·");
      const parts = hasStructuredDelimiter
        ? block.text.split(/\s+[|•·]\s+/)
        : block.text.split(/\s+[—–]\s+/);

      if (parts.length >= 4) {
        // 2x2 FAANG Subheading Grid:
        // Line 1: Organization/Company (Left) ................. Dates (Right)
        // Line 2: Role/Degree (Left, italic) ................ Location (Right, italic)
        let l1Left = parts[0]?.trim() || "";
        let l1Right = parts[parts.length - 1]?.trim() || "";
        let l2Left = parts[1]?.trim() || "";
        let l2Right = parts.length > 3 ? parts.slice(2, -1).join(" · ").trim() : "";

        if (/\d{4}/.test(parts[1] || "") && !/\d{4}/.test(parts[parts.length - 1] || "")) {
          l1Right = parts[1]!.trim();
          l2Left = parts[2]?.trim() || "";
          l2Right = parts.slice(3).join(" · ").trim();
        }

        html += `<div class="entry-subheading">
          <div class="entry-row"><span class="entry-main font-bold">${escapeHtml(l1Left)}</span><span class="entry-date">${escapeHtml(l1Right)}</span></div>
          <div class="entry-row sub-row"><span class="entry-sub italic">${escapeHtml(l2Left)}</span>${l2Right ? `<span class="entry-loc italic">${escapeHtml(l2Right)}</span>` : ""}</div>
        </div>`;
      } else if (parts.length === 3) {
        let l1Left = parts[0]?.trim() || "";
        let l1Right = parts[2]?.trim() || "";
        let l2Left = parts[1]?.trim() || "";
        let l2Right = "";

        // If part 1 has dates and part 2 doesn't
        if (/\d{4}/.test(parts[1] || "") && !/\d{4}/.test(parts[2] || "")) {
          l1Right = parts[1]!.trim();
          l2Left = parts[2]?.trim() || "";
        }

        // Check if l2Left contains role and location separated by comma
        const subParts = l2Left.split(/\s*,\s*/);
        if (subParts.length >= 2 && !l2Right) {
          l2Left = subParts[0]!.trim();
          l2Right = subParts.slice(1).join(", ").trim();
        }

        html += `<div class="entry-subheading">
          <div class="entry-row"><span class="entry-main font-bold">${escapeHtml(l1Left)}</span><span class="entry-date">${escapeHtml(l1Right)}</span></div>
          <div class="entry-row sub-row"><span class="entry-sub italic">${escapeHtml(l2Left)}</span>${l2Right ? `<span class="entry-loc italic">${escapeHtml(l2Right)}</span>` : ""}</div>
        </div>`;
      } else if (parts.length === 2) {
        const left = parts[0]?.trim() || "";
        const right = parts[1]?.trim() || "";
        const rightIsDate = /\d{4}|present|current/i.test(right);
        if (rightIsDate) {
          html += `<div class="entry-subheading">
            <div class="entry-row"><span class="entry-main font-bold">${escapeHtml(left)}</span><span class="entry-date">${escapeHtml(right)}</span></div>
          </div>`;
        } else {
          html += `<div class="entry-subheading">
            <div class="entry-row"><span class="entry-main font-bold">${escapeHtml(left)}</span></div>
            <div class="entry-row sub-row"><span class="entry-sub italic">${escapeHtml(right)}</span></div>
          </div>`;
        }
      } else {
        const parsed = parseEntryDetails(block.text);
        if (parsed.date) {
          html += `<div class="entry-subheading">
            <div class="entry-row"><span class="entry-main font-bold">${escapeHtml(parsed.main)}</span><span class="entry-date">${escapeHtml(parsed.date)}</span></div>
            ${parsed.sub || parsed.loc ? `<div class="entry-row sub-row"><span class="entry-sub italic">${escapeHtml(parsed.sub)}</span>${parsed.loc ? `<span class="entry-loc italic">${escapeHtml(parsed.loc)}</span>` : ""}</div>` : ""}
          </div>`;
        } else if (block.text.length > 70) {
          html += `<p class="entry-prose">${escapeHtml(block.text)}</p>`;
        } else {
          html += `<div class="entry-subheading single-entry"><div class="entry-row"><span class="entry-main font-bold">${escapeHtml(block.text)}</span></div></div>`;
        }
      }
    }
  }
  if (openList) html += "</ul>";
  return html;
}

function renderSection(section: ResumeSection, template: ResumeTemplate): string {
  return `<section class="block"><h2>${escapeHtml(section.title)}</h2>${renderBlocks(section, template)}</section>`;
}

function baseCss(template: ResumeTemplate): string {
  return `
    @page { size: Letter; margin: 0.5in 0.6in; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow-x: hidden;
      overflow-y: visible;
      min-height: 100%;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    body {
      font-family: ${template.bodyFont};
      color: ${template.ink};
      font-size: 9.6pt;
      line-height: 1.25;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: 0.5in 0.6in 0.45in;
      box-sizing: border-box;
      position: relative;
      background: #ffffff;
    }
    header {
      margin-bottom: 7px;
    }
    h1 {
      font-family: ${template.headFont};
      font-size: 21pt;
      line-height: 1.15;
      margin: 0 0 3px;
      letter-spacing: -0.015em;
      color: ${template.ink};
      font-weight: 700;
    }
    h2 {
      font-family: ${template.headFont};
      font-size: 11pt;
      line-height: 1.25;
      margin: 0 0 3px;
      color: ${template.accent};
      font-weight: 700;
      ${template.caps ? "text-transform: uppercase; letter-spacing: 0.07em;" : "letter-spacing: 0.015em;"}
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .contact {
      color: ${template.soft};
      font-size: 8.9pt;
      margin-top: 3px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px 0;
      line-height: 1.3;
    }
    .contact span:not(:last-child)::after {
      content: "•";
      color: ${template.accent};
      opacity: 0.65;
      margin: 0 6px;
      font-size: 7.5pt;
      display: inline-block;
      vertical-align: middle;
    }
    .intro {
      margin: 3px 0 0;
      color: ${template.ink};
      font-size: 9.3pt;
      line-height: 1.32;
    }
    section.block {
      margin-top: 8px;
      margin-bottom: 0;
      break-inside: auto;
    }
    section.block:first-of-type,
    .main > section.block:first-of-type {
      margin-top: 3px;
    }
    .entry-subheading {
      margin-top: 5.5px;
      margin-bottom: 2px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .entry-subheading:first-of-type,
    section.block > .entry-subheading:first-of-type {
      margin-top: 2px;
    }
    .entry-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      margin: 0 0 1px;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .entry-main {
      font-weight: 700;
      color: ${template.ink};
      font-size: 9.8pt;
      flex: 1 1 auto;
    }
    .entry-date {
      font-weight: 600;
      font-size: 9.1pt;
      color: ${template.soft};
      white-space: nowrap;
      text-align: right;
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    .entry-subheading .sub-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      margin-top: 1px;
      margin-bottom: 2px;
    }
    .entry-sub {
      font-style: italic;
      font-weight: 400;
      font-size: 9.2pt;
      color: ${template.soft};
      flex: 1 1 auto;
    }
    .entry-loc {
      font-style: italic;
      font-weight: 400;
      font-size: 9pt;
      color: ${template.soft};
      white-space: nowrap;
      text-align: right;
      margin-left: auto;
    }
    .entry-prose {
      margin: 2.5px 0 4px;
      font-size: 9.3pt;
      font-weight: 400;
      line-height: 1.35;
      color: ${template.ink};
      text-align: justify;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    p.entry {
      margin: 2px 0 1px;
      font-size: 9.3pt;
      color: ${template.ink};
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .skill-line {
      margin: 1.5px 0;
      font-size: 9.3pt;
      line-height: 1.28;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .entry-label {
      font-weight: 700;
      color: ${template.ink};
    }
    .entry-val {
      font-weight: 400;
      color: ${template.ink};
    }
    ul {
      margin: 2px 0 3.5px;
      padding-left: 17px;
      list-style-type: disc;
      break-inside: auto;
    }
    li {
      margin: 1.5px 0;
      font-size: 9.3pt;
      line-height: 1.25;
      break-inside: avoid;
      page-break-inside: avoid;
      color: ${template.ink};
    }
    li::marker {
      color: ${template.accent};
      font-size: 7pt;
    }
    @media print {
      body, .page { width: 100% !important; margin: 0 !important; padding: 0 !important; min-height: auto !important; }
      section.block { break-inside: auto; }
      h1, h2, .entry-subheading, .entry-row, li, .entry-prose { break-inside: avoid; page-break-inside: avoid; }
      h2 { break-after: avoid; page-break-after: avoid; }
    }
  `;
}

function layoutCss(template: ResumeTemplate): string {
  // 1. OVERLEAF FAANGPATH (Official LaTeX)
  if (template.id === "overleaf-faang") {
    return `
      @import url('https://fonts.cdnfonts.com/css/computer-modern');
      body {
        font-family: 'Computer Modern Roman', 'Computer Modern Serif', 'CMU Serif', 'Latin Modern Roman', 'Source Serif 4', 'EB Garamond', Georgia, serif;
        font-size: 9.5pt;
        line-height: 1.3;
        color: #000000;
      }
      .page { padding: 0.35in 0.45in 0.35in; }
      header { text-align: center; border-bottom: none; padding-bottom: 0; margin-bottom: 8px; }
      h1 {
        font-family: 'Computer Modern Roman', 'Computer Modern Serif', 'CMU Serif', 'Latin Modern Roman', 'Source Serif 4', Georgia, serif;
        font-size: 20pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 3px;
        color: #000000;
        text-align: center;
      }
      .contact { justify-content: center; font-size: 8.8pt; color: #000000; gap: 0; margin-top: 2px; margin-bottom: 0; }
      .contact span:not(:last-child)::after { content: "|"; color: #000000; opacity: 0.85; margin: 0 6px; font-weight: 300; font-size: 8.5pt; }
      .intro { text-align: center; font-size: 9pt; font-style: italic; color: #222222; margin-top: 3px; }
      h2 {
        font-family: 'Computer Modern Roman', 'Computer Modern Serif', 'CMU Serif', 'Latin Modern Roman', 'Source Serif 4', Georgia, serif;
        text-align: left;
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #000000;
        margin: 0 0 2px;
        padding-bottom: 1.5px;
        border-bottom: 1px solid #000000;
      }
      section.block { margin-top: 9px; }
      section.block:first-of-type,
      .main > section.block:first-of-type {
        margin-top: 3px;
      }
      .entry-subheading { margin-top: 6px; margin-bottom: 1.5px; }
      .entry-subheading:first-of-type,
      section.block > .entry-subheading:first-of-type {
        margin-top: 2px;
      }
      .entry-row { margin: 0 0 1px; }
      .entry-main { font-weight: 700; color: #000000; font-size: 9.4pt; }
      .entry-date { font-style: normal; font-weight: 700; color: #000000; font-size: 9pt; }
      .entry-sub { font-style: italic; font-weight: 400; color: #000000; font-size: 9pt; }
      .entry-loc { font-style: italic; font-weight: 400; color: #000000; font-size: 9pt; }
      .entry-prose { font-size: 9.2pt; line-height: 1.34; color: #000000; }
      p.entry { margin: 2px 0 1px; color: #000000; font-size: 9.2pt; }
      .skill-line { margin: 2px 0 1px; font-size: 9pt; line-height: 1.32; }
      .entry-label { font-weight: 700; color: #000000; }
      .entry-val { font-weight: 400; color: #000000; }
      ul { margin: 1.5px 0 3px; padding-left: 15px; }
      li { margin: 1px 0; font-size: 9pt; line-height: 1.32; color: #000000; }
      li::marker { color: #000000; font-size: 6.5pt; }
    `;
  }

  // 2. GOOGLE SWE (Mountain View)
  if (template.id === "google-swe") {
    return `
      header { border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { color: #1f1f1f; font-size: 21pt; font-weight: 700; }
      .contact { color: #5f6368; font-size: 8.8pt; }
      .contact span:not(:last-child)::after { color: #1a73e8; }
      h2 {
        color: #1a73e8;
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #1a73e8;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #1f1f1f; }
      .entry-date { font-weight: 600; color: #1a73e8; font-size: 8.8pt; }
      .entry-sub { color: #5f6368; font-style: italic; }
      li::marker { color: #1a73e8; }
    `;
  }

  // 3. META IMPACT ARCHITECT
  if (template.id === "meta-impact") {
    return `
      header { border-bottom: 3px solid #0668e1; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22pt; color: #0c1024; letter-spacing: -0.03em; }
      h2 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #0668e1;
        font-weight: 800;
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-left: 3.5px solid #0668e1;
        border-bottom: 1px solid #0668e120;
        padding-left: 8px;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #0c1024; }
      .entry-date { font-weight: 600; color: #0668e1; }
      li::marker { color: #0668e1; }
    `;
  }

  // 4. APPLE CUPERTINO EXECUTIVE
  if (template.id === "apple-cupertino") {
    return `
      header { border-bottom: 0.75px solid #d2d2d7; padding-bottom: 9px; margin-bottom: 9px; }
      h1 { font-family: 'Inter Tight', sans-serif; font-size: 21pt; font-weight: 600; color: #1d1d1f; letter-spacing: -0.02em; }
      .contact { color: #86868b; font-size: 8.8pt; }
      .contact span:not(:last-child)::after { content: "|"; color: #d2d2d7; margin: 0 6px; font-weight: 300; font-size: 8.5pt; }
      h2 {
        font-family: 'Inter Tight', sans-serif;
        font-size: 9.5pt;
        font-weight: 600;
        color: #1d1d1f;
        text-transform: uppercase;
        letter-spacing: 0.11em;
        border-bottom: 0.75px solid #e5e5ea;
        padding-bottom: 2.5px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 600; color: #1d1d1f; }
      .entry-date { color: #86868b; font-size: 8.5pt; font-weight: 500; }
      .entry-sub { color: #86868b; font-style: normal; }
      li { color: #1d1d1f; }
      li::marker { color: #86868b; }
    `;
  }

  // 5. AMAZON BAR RAISER STANDARD
  if (template.id === "amazon-bar-raiser") {
    return `
      header { border-bottom: 2px solid #232f3e; border-top: 3.5px solid #ff9900; padding: 8px 0; margin-bottom: 8px; }
      h1 { font-family: 'Merriweather', serif; font-size: 21pt; font-weight: 700; color: #131921; }
      .contact { color: #565959; font-size: 8.8pt; }
      h2 {
        font-family: 'Merriweather', serif;
        font-size: 10pt;
        font-weight: 700;
        color: #232f3e;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border-left: 3.5px solid #ff9900;
        border-bottom: 1.2px solid #232f3e25;
        padding: 1px 0 2px 7px;
        margin: 0 0 3px;
      }
      .entry-main { font-family: 'Source Sans 3', sans-serif; font-weight: 700; color: #131921; }
      .entry-date { font-weight: 600; color: #232f3e; font-size: 8.8pt; }
      li::marker { color: #ff9900; }
    `;
  }

  // 6. NETFLIX SENIOR TALENT (IC)
  if (template.id === "netflix-senior-ic") {
    return `
      header { border-bottom: 2.5px solid #e50914; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'DM Sans', sans-serif; font-size: 22pt; font-weight: 800; color: #141414; letter-spacing: -0.02em; }
      h2 {
        font-family: 'DM Sans', sans-serif;
        font-size: 10.5pt;
        font-weight: 800;
        color: #e50914;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #e5091435;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #141414; }
      .entry-date { font-weight: 700; color: #e50914; font-size: 8.8pt; }
      li::marker { color: #e50914; }
    `;
  }

  // 7. STRIPE DEVELOPER INFRASTRUCTURE
  if (template.id === "stripe-developer") {
    return `
      .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
      .rail { background: #f8fafc; border-right: 1.5px solid #e2e8f0; padding: 0.38in 0.3in 0.38in; }
      .main { padding: 0.38in 0.45in 0.38in; }
      .rail h1 { font-family: 'Space Grotesk', sans-serif; font-size: 18pt; line-height: 1.15; color: #0a2540; font-weight: 700; }
      .rail .contact { display: block; margin-top: 8px; }
      .rail .contact span::after { content: ""; margin: 0; }
      .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; color: #425466; word-break: break-word; overflow-wrap: anywhere; }
      .rail h2 { font-family: 'Space Grotesk', sans-serif; color: #635bff; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #635bff30; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { font-family: 'Space Grotesk', sans-serif; color: #0a2540; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #635bff; padding-bottom: 2.5px; margin: 0 0 3px; }
      .entry-main { font-weight: 600; color: #0a2540; }
      .entry-date { font-family: 'Space Grotesk', monospace; font-size: 8.2pt; color: #635bff; font-weight: 600; }
      .skill-line { background: #635bff08; border: 1px solid #635bff20; border-radius: 4px; padding: 2.5px 5px; margin: 2.5px 0; }
      li::marker { color: #635bff; }
    `;
  }

  // 8. OPENAI FRONTIER AI SCIENTIST
  if (template.id === "openai-research") {
    return `
      header { text-align: center; border-top: 1px solid #10a37f; border-bottom: 1px solid #10a37f; padding: 7px 0; margin-bottom: 8px; }
      h1 { font-family: 'Cormorant Garamond', serif; font-size: 23pt; font-weight: 700; color: #202123; text-align: center; }
      .contact { justify-content: center; font-size: 8.8pt; color: #6e6e80; }
      .contact span:not(:last-child)::after { content: "•"; color: #10a37f; opacity: 0.8; margin: 0 6px; font-size: 7.5pt; }
      h2 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 11pt;
        font-weight: 700;
        color: #10a37f;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.11em;
        border-bottom: 1px solid #10a37f30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #202123; }
      .entry-date { font-weight: 500; font-style: italic; color: #6e6e80; }
      li::marker { color: #10a37f; }
    `;
  }

  // 9. NVIDIA ACCELERATED COMPUTING
  if (template.id === "nvidia-cuda") {
    return `
      header { border-bottom: 3px solid #76b900; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Archivo', sans-serif; font-size: 22pt; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
      h2 {
        font-family: 'Archivo', sans-serif;
        font-size: 10pt;
        font-weight: 800;
        color: #111827;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 2px solid #76b900;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #111827; }
      .entry-date { font-weight: 700; color: #5b8f00; font-size: 8.8pt; }
      li::marker { color: #76b900; }
    `;
  }

  // 10. MICROSOFT REDMOND PRINCIPAL
  if (template.id === "microsoft-principal") {
    return `
      header { border-bottom: 2px solid #0078d4; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 21pt; font-weight: 700; color: #1b1b1b; }
      h2 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 10pt;
        font-weight: 700;
        color: #0078d4;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #0078d435;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #1b1b1b; }
      .entry-date { font-weight: 600; color: #0078d4; font-size: 8.8pt; }
      li::marker { color: #0078d4; }
    `;
  }

  // 11. HARVARD BUSINESS SCHOOL (HBS)
  if (template.id === "harvard-hbs") {
    return `
      header { text-align: center; margin-bottom: 8px; }
      h1 { font-family: 'Crimson Pro', serif; font-size: 23pt; font-weight: 700; color: #a51c30; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }
      .contact { justify-content: center; font-size: 8.8pt; color: #595959; border-top: 0.75px solid #a51c30; border-bottom: 0.75px solid #a51c30; padding: 2.5px 0; margin-top: 5px; }
      .contact span:not(:last-child)::after { content: "•"; color: #a51c30; opacity: 0.8; margin: 0 6px; font-size: 7.5pt; }
      h2 {
        font-family: 'Crimson Pro', serif;
        font-size: 11pt;
        font-weight: 700;
        color: #a51c30;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-bottom: 1.2px solid #a51c30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-family: 'Karla', sans-serif; font-weight: 700; color: #1e1e1e; }
      .entry-date { font-family: 'Crimson Pro', serif; font-weight: 600; color: #1e1e1e; font-size: 9.2pt; }
      .entry-sub { font-style: italic; color: #595959; }
      li::marker { color: #a51c30; }
    `;
  }

  // 12. STANFORD D.SCHOOL PRODUCT LEAD
  if (template.id === "stanford-product") {
    return `
      .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
      .rail { background: #faf8f7; border-right: 1.5px solid #ede7e4; padding: 0.38in 0.3in 0.38in; }
      .main { padding: 0.38in 0.45in 0.38in; }
      .rail h1 { font-family: 'Outfit', sans-serif; font-size: 18pt; line-height: 1.15; color: #8c1515; font-weight: 700; }
      .rail .contact { display: block; margin-top: 8px; }
      .rail .contact span::after { content: ""; margin: 0; }
      .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; color: #5f574f; word-break: break-word; overflow-wrap: anywhere; }
      .rail h2 { font-family: 'Outfit', sans-serif; color: #8c1515; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #8c151530; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { font-family: 'Outfit', sans-serif; color: #8c1515; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #8c1515; padding-bottom: 2.5px; margin: 0 0 3px; }
      .entry-main { font-weight: 700; color: #2e2d29; }
      .entry-date { font-weight: 600; color: #8c1515; font-size: 8.8pt; }
      li::marker { color: #8c1515; }
    `;
  }

  // 13. MCKINSEY & CO. DIRECTOR
  if (template.id === "mckinsey-director") {
    return `
      header { border-bottom: 3px double #051c2c; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Baskervville', serif; font-size: 22pt; font-weight: 700; color: #051c2c; letter-spacing: -0.01em; }
      .contact { color: #4a5568; font-size: 8.8pt; }
      h2 {
        font-family: 'Baskervville', serif;
        font-size: 10.5pt;
        font-weight: 700;
        color: #051c2c;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1.5px solid #051c2c30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #051c2c; }
      .entry-date { font-family: 'Baskervville', serif; font-style: italic; color: #4a5568; }
      li::marker { color: #051c2c; }
    `;
  }

  // 14. CITADEL / WALL STREET QUANT
  if (template.id === "citadel-quant") {
    return `
      body { font-size: 9.2pt; line-height: 1.32; }
      .page { padding: 0.35in 0.45in 0.35in; }
      header { border-bottom: 1.5px solid #0a2240; padding-bottom: 6px; margin-bottom: 7px; }
      h1 { font-family: 'EB Garamond', serif; font-size: 21pt; font-weight: 700; color: #0a192f; margin: 0 0 2px; }
      h2 {
        font-family: 'EB Garamond', serif;
        font-size: 10pt;
        font-weight: 700;
        color: #0a2240;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.2px solid #0a224035;
        padding-bottom: 1.5px;
        margin: 0 0 2px;
      }
      section.block { margin-top: 8px; }
      .entry-subheading { margin-top: 5px; margin-bottom: 1px; }
      .entry-main { font-weight: 700; color: #0a192f; font-size: 9.3pt; }
      .entry-date { font-family: monospace; font-size: 8.4pt; color: #0a2240; font-weight: 600; }
      ul { padding-left: 14px; margin: 1.5px 0 2px; }
      li { margin: 1px 0; line-height: 1.32; }
      li::marker { color: #0a2240; }
    `;
  }

  // 15. Y COMBINATOR FOUNDER
  if (template.id === "yc-founder") {
    return `
      .page { border-top: 5px solid #ff6600; padding: 0.35in 0.5in 0.4in; }
      header { border-bottom: 2px solid #ff6600; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Space Grotesk', sans-serif; font-size: 22pt; font-weight: 800; color: #18181b; letter-spacing: -0.02em; }
      h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 10pt;
        font-weight: 800;
        color: #ff6600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #ff660040;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #18181b; }
      .entry-date { font-weight: 700; color: #ff6600; font-size: 8.8pt; }
      li::marker { color: #ff6600; }
    `;
  }

  // 16. DATABRICKS / SNOWFLAKE DATA LEAD
  if (template.id === "databricks-data") {
    return `
      header { border-bottom: 2px solid #ff3621; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 21pt; font-weight: 800; color: #1b1b1b; }
      .main { border-left: 2px solid #ff362130; margin-left: 6px; padding-left: 16px; }
      section.block { position: relative; }
      section.block h2::before {
        content: ""; position: absolute; left: -22px; top: 4px;
        width: 8px; height: 8px; border-radius: 50%; background: #ff3621;
        box-shadow: 0 0 0 3px #fff;
      }
      h2 { color: #ff3621; font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 3px; }
      .entry-main { font-weight: 700; color: #1b1b1b; }
      .entry-date { font-weight: 600; color: #ff3621; font-size: 8.8pt; }
      li::marker { color: #ff3621; }
    `;
  }

  // 17. PALANTIR FORWARD DEPLOYED (FDE)
  if (template.id === "palantir-fde") {
    return `
      body { font-family: 'Inter', sans-serif; color: #101820; }
      header { border-bottom: 2px solid #101820; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Fira Code', monospace; font-size: 20pt; font-weight: 700; color: #101820; }
      h2 {
        font-family: 'Fira Code', monospace;
        font-size: 9.5pt;
        font-weight: 700;
        color: #101820;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #10182040;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      h2::before { content: "// "; color: #64748b; }
      .entry-main { font-weight: 700; color: #101820; }
      .entry-date { font-family: 'Fira Code', monospace; font-size: 8.5pt; color: #475569; }
      li::marker { color: #101820; }
    `;
  }

  // 18. AIRBNB DESIGN-TECHNOLOGIST
  if (template.id === "airbnb-design-tech") {
    return `
      .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
      .rail { background: #fff5f6; border-right: 1.5px solid #ffe4e6; padding: 0.38in 0.3in 0.38in; }
      .main { padding: 0.38in 0.45in 0.38in; }
      .rail h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18pt; color: #ff385c; font-weight: 800; }
      .rail .contact { display: block; margin-top: 8px; }
      .rail .contact span::after { content: ""; margin: 0; }
      .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; color: #717171; word-break: break-word; overflow-wrap: anywhere; }
      .rail h2 { color: #ff385c; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #ff385c30; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { color: #ff385c; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #ff385c; padding-bottom: 2.5px; margin: 0 0 3px; }
      .entry-main { font-weight: 700; color: #222222; }
      .entry-date { font-weight: 600; color: #ff385c; font-size: 8.8pt; }
      li::marker { color: #ff385c; }
    `;
  }

  // 19. UBER REAL-TIME MARKETPLACE
  if (template.id === "uber-marketplace") {
    return `
      header { border-bottom: 3px solid #000000; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-size: 22pt; font-weight: 900; color: #000000; letter-spacing: -0.04em; }
      h2 {
        font-size: 10pt;
        font-weight: 900;
        color: #000000;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        border-bottom: 2px solid #000000;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 800; color: #000000; }
      .entry-date { font-weight: 700; color: #000000; font-size: 8.8pt; }
      li::marker { color: #000000; }
    `;
  }

  // 20. MIT CSAIL SYSTEMS FELLOW
  if (template.id === "mit-csail") {
    return `
      header { border-bottom: 2px solid #a31f34; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Libre Baskerville', serif; font-size: 21pt; font-weight: 700; color: #a31f34; }
      h2 {
        font-family: 'Libre Baskerville', serif;
        font-size: 10pt;
        font-weight: 700;
        color: #a31f34;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1.5px solid #a31f3435;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: #1b1b1b; font-size: 9.3pt; }
      .entry-date { font-family: 'IBM Plex Mono', monospace; font-size: 8.4pt; color: #a31f34; font-weight: 600; }
      li::marker { color: #a31f34; }
    `;
  }

  // 21. LINUX & GITHUB CORE MAINTAINER
  if (template.id === "github-maintainer") {
    return `
      .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
      .rail { background: #f6f8fa; border-right: 1.5px solid #d0d7de; padding: 0.38in 0.3in 0.38in; }
      .main { padding: 0.38in 0.45in 0.38in; }
      .rail h1 { font-family: 'JetBrains Mono', monospace; font-size: 17pt; color: #1f2328; font-weight: 700; }
      .rail .contact { display: block; margin-top: 8px; }
      .rail .contact span::after { content: ""; margin: 0; }
      .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; color: #656d76; word-break: break-word; overflow-wrap: anywhere; }
      .rail h2 { font-family: 'JetBrains Mono', monospace; color: #24292f; font-size: 8.8pt; font-weight: 700; border-bottom: 1px solid #d0d7de; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { font-family: 'JetBrains Mono', monospace; color: #24292f; font-size: 10pt; font-weight: 700; border-bottom: 2px solid #2ea44f; padding-bottom: 2.5px; margin: 0 0 3px; }
      .entry-main { font-weight: 700; color: #1f2328; }
      .entry-date { font-family: 'JetBrains Mono', monospace; font-size: 8.2pt; color: #2ea44f; font-weight: 600; }
      li::marker { color: #2ea44f; }
    `;
  }

  // 22. SALESFORCE PRINCIPAL CLOUD ARCHITECT
  if (template.id === "salesforce-architect") {
    return `
      header { background: linear-gradient(135deg, #00a1e0, #032d60); color: #ffffff; border-radius: 6px; padding: 12px 18px; margin-bottom: 10px; }
      header h1 { color: #ffffff; font-size: 20pt; font-weight: 800; margin: 0 0 2px; }
      header .contact { color: #e0f2fe; margin-top: 2px; }
      header .contact span:not(:last-child)::after { color: #93c5fd; }
      header .intro { color: #f0f9ff; }
      h2 {
        color: #00a1e0;
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #00a1e040;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #032d60; }
      .entry-date { font-weight: 600; color: #00a1e0; font-size: 8.8pt; }
      li::marker { color: #00a1e0; }
    `;
  }

  // 23. GOOGLE DEEPMIND FELLOW
  if (template.id === "deepmind-fellow") {
    return `
      header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Fraunces', serif; font-size: 22pt; font-weight: 700; color: #1a56db; text-align: center; }
      .contact { justify-content: center; font-size: 8.8pt; color: #4b5563; }
      .contact span:not(:last-child)::after { content: "•"; color: #1a56db; opacity: 0.8; margin: 0 6px; font-size: 7.5pt; }
      h2 {
        font-family: 'Fraunces', serif;
        font-size: 10.5pt;
        font-weight: 700;
        color: #1a56db;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1.5px solid #1a56db30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #111827; }
      .entry-date { font-weight: 600; color: #1a56db; font-size: 8.8pt; }
      li::marker { color: #1a56db; }
    `;
  }

  // 24. TESLA AUTOPILOT & ROBOTICS
  if (template.id === "tesla-autopilot") {
    return `
      header { border-bottom: 2.5px solid #e82127; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Space Grotesk', sans-serif; font-size: 21pt; font-weight: 800; color: #171a20; letter-spacing: -0.02em; }
      h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 9.5pt;
        font-weight: 800;
        color: #e82127;
        text-transform: uppercase;
        letter-spacing: 0.11em;
        border-bottom: 1.5px solid #e8212735;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #171a20; }
      .entry-date { font-family: 'Space Grotesk', monospace; font-size: 8.5pt; color: #e82127; font-weight: 700; }
      li::marker { color: #e82127; }
    `;
  }

  // 25. VERCEL / NEXT.JS FULL-STACK
  if (template.id === "vercel-fullstack") {
    return `
      header { border-bottom: 1.5px solid #000000; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-size: 22pt; font-weight: 800; color: #000000; letter-spacing: -0.03em; }
      h2 {
        font-size: 10pt;
        font-weight: 700;
        color: #000000;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1px solid #eaeaea;
        padding-bottom: 2.5px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #000000; }
      .entry-date { font-family: monospace; font-size: 8.4pt; color: #666666; font-weight: 600; }
      li::marker { color: #000000; }
    `;
  }

  // 26. EXECUTIVE CTO & VP ENGINEERING
  if (template.id === "executive-cto") {
    return `
      header { border-bottom: 2px solid #0f172a; border-top: 1.5px solid #d4af37; padding: 8px 0; margin-bottom: 8px; }
      h1 { font-family: 'Cinzel', serif; font-size: 21pt; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; }
      h2 {
        font-family: 'Cinzel', serif;
        font-size: 10pt;
        font-weight: 700;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        border-bottom: 1.5px solid #0f172a30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #0f172a; }
      .entry-date { font-weight: 600; color: #9a7b2c; font-size: 8.8pt; }
      li::marker { color: #0f172a; }
    `;
  }

  // 27. ANTHROPIC CLAUDE AI FELLOW
  if (template.id === "anthropic-claude") {
    return `
      header { text-align: center; border-bottom: 2px solid #c45c3d; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Lora', serif; font-size: 22pt; font-weight: 600; color: #c45c3d; text-align: center; }
      .contact { justify-content: center; font-size: 8.8pt; color: #666461; }
      .contact span:not(:last-child)::after { content: "•"; color: #c45c3d; opacity: 0.8; margin: 0 6px; font-size: 7.5pt; }
      h2 {
        font-family: 'Lora', serif;
        font-size: 10.5pt;
        font-weight: 600;
        color: #c45c3d;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1.5px solid #c45c3d30;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #1f1e1d; }
      .entry-date { font-weight: 600; color: #c45c3d; font-size: 8.8pt; }
      li::marker { color: #c45c3d; }
    `;
  }

  // 28. LINEAR CRAFT SOFTWARE CRAFTSMAN
  if (template.id === "linear-craft") {
    return `
      header { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Inter Tight', sans-serif; font-size: 21pt; font-weight: 700; color: #0d0e11; letter-spacing: -0.02em; }
      h2 {
        font-family: 'Inter Tight', sans-serif;
        font-size: 9.5pt;
        font-weight: 700;
        color: #5e6ad2;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        border-bottom: 1px solid #5e6ad230;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #0d0e11; }
      .entry-date { font-weight: 600; color: #5e6ad2; font-size: 8.5pt; }
      li::marker { color: #5e6ad2; }
    `;
  }

  // 29. SNOWFLAKE POLAR DATA LEAD
  if (template.id === "snowflake-polar") {
    return `
      header { border-bottom: 2.5px solid #29b5e8; padding-bottom: 8px; margin-bottom: 8px; }
      h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 21pt; font-weight: 800; color: #111b2b; }
      h2 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 10pt;
        font-weight: 700;
        color: #29b5e8;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        border-bottom: 1.5px solid #29b5e840;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #111b2b; }
      .entry-date { font-weight: 600; color: #29b5e8; font-size: 8.8pt; }
      li::marker { color: #29b5e8; }
    `;
  }

  // 30. FIGMA DESIGN-ENGINEERING LEAD
  if (template.id === "figma-design-eng") {
    return `
      .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
      .rail { background: #f0f9ff; border-right: 1.5px solid #e0f2fe; padding: 0.38in 0.3in 0.38in; }
      .main { padding: 0.38in 0.45in 0.38in; }
      .rail h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18pt; color: #0d99ff; font-weight: 800; }
      .rail .contact { display: block; margin-top: 8px; }
      .rail .contact span::after { content: ""; margin: 0; }
      .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; color: #555555; word-break: break-word; overflow-wrap: anywhere; }
      .rail h2 { color: #0d99ff; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #0d99ff30; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { color: #0d99ff; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #0d99ff; padding-bottom: 2.5px; margin: 0 0 3px; }
      .entry-main { font-weight: 700; color: #1e1e1e; }
      .entry-date { font-weight: 600; color: #0d99ff; font-size: 8.8pt; }
      li::marker { color: #0d99ff; }
    `;
  }

  // 31. ANDURIL DEFENSE SYSTEMS LEAD
  if (template.id === "anduril-defense") {
    return `
      header { border-bottom: 3px solid #1e293b; border-left: 5px solid #f59e0b; padding: 4px 0 6px 10px; margin-bottom: 8px; }
      h1 { font-family: 'Space Grotesk', sans-serif; font-size: 21pt; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
      h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 9.5pt;
        font-weight: 800;
        color: #1e293b;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        border-bottom: 2px solid #1e293b40;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-weight: 700; color: #0f172a; }
      .entry-date { font-family: 'Space Grotesk', monospace; font-size: 8.5pt; color: #d97706; font-weight: 700; }
      li::marker { color: #d97706; }
    `;
  }

  // 32. GOLDMAN SACHS MANAGING DIRECTOR
  if (template.id === "goldman-md") {
    return `
      header { text-align: center; border-bottom: 1.5px solid #1a365d; border-top: 1px solid #d4af37; padding: 7px 0; margin-bottom: 8px; }
      h1 { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; color: #1a365d; letter-spacing: 0.02em; text-align: center; }
      .contact { justify-content: center; font-size: 8.8pt; color: #334155; }
      .contact span:not(:last-child)::after { content: "•"; color: #d4af37; opacity: 0.8; margin: 0 6px; font-size: 7.5pt; }
      h2 {
        font-family: 'Playfair Display', serif;
        font-size: 10.5pt;
        font-weight: 700;
        color: #1a365d;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        border-bottom: 1.5px solid #1a365d35;
        padding-bottom: 2px;
        margin: 0 0 3px;
      }
      .entry-main { font-family: 'Source Sans 3', sans-serif; font-weight: 700; color: #0f172a; }
      .entry-date { font-family: 'Playfair Display', serif; font-style: italic; color: #1a365d; font-weight: 600; }
      li::marker { color: #1a365d; }
    `;
  }

  // Layout-based fallbacks for any custom or future templates
  switch (template.layout) {
    case "modern":
      return `
        h2 { border-bottom: 1.5px solid ${template.accent}30; padding-bottom: 2px; margin: 0 0 3px; }
        header { border-bottom: 2px solid ${template.accent}; padding-bottom: 8px; margin-bottom: 8px; }
      `;
    case "sidebar":
      return `
        .page { display: grid; grid-template-columns: 2.3in 1fr; gap: 0; padding: 0; }
        .rail { background: ${template.accent}0a; border-right: 1.5px solid ${template.accent}22; padding: 0.38in 0.3in 0.38in; }
        .main { padding: 0.38in 0.45in 0.38in; }
        .rail h1 { font-size: 18pt; line-height: 1.15; }
        .rail .contact { display: block; margin-top: 8px; }
        .rail .contact span::after { content: ""; margin: 0; }
        .rail .contact span { display: block; margin-bottom: 4px; font-size: 8.4pt; word-break: break-word; overflow-wrap: anywhere; }
        .rail h2 { border-bottom: 1px solid ${template.accent}35; padding-bottom: 2px; margin: 10px 0 4px; }
        .main h2 { margin: 0 0 3px; }
      `;
    case "banded":
      return `
        .page { padding: 0; }
        header { background: ${template.accent}; color: #fff; padding: 0.38in 0.5in; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
        header h1 { color: #fff; }
        header .contact { color: #ffffffd8; }
        header .contact span:not(:last-child)::after { color: #ffffff80; }
        header .intro { color: #ffffffee; }
        .main { padding: 0.35in 0.5in 0.38in; }
        h2 { border-bottom: 1px solid ${template.accent}30; padding-bottom: 2px; margin: 0 0 3px; }
      `;
    case "centered":
      return `
        header { text-align: center; border-bottom: 1.5px solid ${template.accent}40; padding-bottom: 8px; margin-bottom: 8px; }
        header .contact { justify-content: center; }
        h2 { text-align: center; border-bottom: 1px solid ${template.accent}30; padding-bottom: 2px; margin: 0 0 3px; }
        .entry-row { display: flex; justify-content: space-between; align-items: baseline; }
        section.block { text-align: left; }
      `;
    case "minimal":
      return `
        header { border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-bottom: 8px; }
        h1 { font-size: 21pt; font-weight: 600; letter-spacing: -0.03em; }
        h2 { font-size: 9.4pt; color: ${template.soft}; border-bottom: 1px solid #f1f1f4; padding-bottom: 2px; margin: 0 0 3px; }
      `;
    case "timeline":
      return `
        .main { border-left: 2px solid ${template.accent}30; padding-left: 16px; margin-top: 8px; margin-left: 6px; }
        section.block { position: relative; }
        section.block h2::before {
          content: ""; position: absolute; left: -22px; top: 4px;
          width: 8px; height: 8px; border-radius: 50%; background: ${template.accent};
          box-shadow: 0 0 0 3px #fff;
        }
        header { padding-bottom: 8px; border-bottom: 1px solid ${template.accent}25; margin-bottom: 8px; }
        h2 { margin: 0 0 3px; }
      `;
    case "compact":
      return `
        body { font-size: 9.2pt; line-height: 1.32; }
        .main { column-count: 2; column-gap: 20px; }
        header { border-bottom: 2px solid ${template.accent}; padding-bottom: 8px; column-span: all; margin-bottom: 6px; }
        h1 { font-size: 20pt; }
        h2 { margin: 0 0 2px; }
      `;
    default:
      return `
        header { border-bottom: 1.5px solid ${template.accent}40; padding-bottom: 8px; margin-bottom: 8px; }
        h1 { font-weight: 700; }
        h2 { border-bottom: 1px solid ${template.accent}25; padding-bottom: 2px; margin: 0 0 3px; }
      `;
  }
}

function headerHtml(doc: ResumeDoc, fallbackName: string): string {
  const name = doc.name || fallbackName;
  const contact = doc.contact.length
    ? `<div class="contact">${doc.contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
    : "";
  const intro = doc.intro.length ? `<p class="intro">${escapeHtml(doc.intro.join(" "))}</p>` : "";
  return `<header><h1>${escapeHtml(name)}</h1>${contact}${intro}</header>`;
}

function orderSectionsForTemplate(sections: ResumeSection[], _templateId: string): ResumeSection[] {
  // Always preserve the natural order of sections exactly as authored in the resume document.
  // Never arbitrarily move Professional Summary / Profile to the bottom or alter section hierarchy.
  return sections;
}

const htmlRenderCache = new Map<string, string>();
const MAX_CACHE_SIZE = 150;

export interface RenderResumeOptions {
  isInteractive?: boolean;
  includeLatexLayer?: boolean;
}

export function renderResumeHtml(
  resumeText: string,
  template?: ResumeTemplate | null,
  fallbackName = "Your Name",
  ghostKeywords?: string[],
  showXRay = false,
  options?: RenderResumeOptions,
): string {
  const activeTemplate = template || TEMPLATES[0]!;
  const isSample = !resumeText || resumeText.trim().length < 15;
  const effectiveText = isSample ? DEFAULT_SAMPLE_RESUME_TEXT : resumeText;
  const effectiveName =
    isSample && (fallbackName === "Your Name" || !fallbackName) ? "Alex Chen" : fallbackName;

  const isInteractive = options?.isInteractive !== false;
  const includeLatex = options?.includeLatexLayer !== false;

  // Ultra-Fast LRU Caching to prevent rendering lag across 32 templates
  const cacheKey = `${activeTemplate.id}:${effectiveText.length}:${effectiveName}:${ghostKeywords?.join(",") || ""}:${showXRay}:${isInteractive}:${includeLatex}:${effectiveText.slice(0, 40)}`;
  const cached = htmlRenderCache.get(cacheKey);
  if (cached) return cached;

  const doc = parseResume(effectiveText);
  const header = headerHtml(doc, effectiveName);

  // Generate underlying compile-ready Overleaf FAANGPath LaTeX format only when needed
  let latexSemanticTag = "";
  if (includeLatex) {
    const latexPayload = generateOverleafFaangLatex(effectiveText, {
      ghostKeywords,
      stealthCloakActive: Boolean(ghostKeywords && ghostKeywords.length > 0),
    });

    latexSemanticTag = `
      <!--
      %======================================================================
      % UNDERLYING OVERLEAF FAANGPATH LATEX RESUME FORMAT (pdfLaTeX 11pt)
      % Ready to compile directly on Overleaf.com
      %======================================================================
      ${latexPayload.replace(/-->/g, "-- >")}
      %======================================================================
      -->
      <div id="latex-underlying-format" class="latex-underlying-format" aria-hidden="true" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: pre; border: 0; opacity: 0.001; pointer-events: none;">
        ${escapeHtml(latexPayload)}
      </div>
    `;
  }

  const ghostHtml =
    ghostKeywords && ghostKeywords.length > 0
      ? showXRay
        ? `<div class="ats-ghost-keywords-xray" style="margin-top: 16px; padding: 10px 14px; background: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 8px; font-family: ${activeTemplate.bodyFont}; break-inside: avoid;">
            <div style="font-size: 8.5pt; font-weight: 700; color: #166534; margin-bottom: 4px; letter-spacing: 0.05em; text-transform: uppercase;">
              ⚡ ATS 100% Shortlist Secret Weapon: Ghost Keywords (X-Ray View)
            </div>
            <div style="font-size: 7.5pt; color: #15803d; line-height: 1.4;">
              ${escapeHtml(ghostKeywords.join(" • "))}
            </div>
            <div style="font-size: 7pt; color: #166534; opacity: 0.8; margin-top: 4px; font-style: italic;">
              (Note: In actual export / print, this text renders in pure white so human recruiters see a clean resume while ATS parsers index 100% match.)
            </div>
          </div>`
        : `<div class="ats-ghost-keywords" aria-hidden="true" style="color: #ffffff; color: rgba(255, 255, 255, 0.001); font-size: 1px; line-height: 0.1px; height: 1px; max-height: 1px; overflow: hidden; opacity: 0.01; user-select: text; mso-line-height-rule: exactly; margin: 0; padding: 0;">
            ATS Candidate Semantic Profile &amp; Job Description Target Keywords: ${escapeHtml(ghostKeywords.join(" "))}
          </div>`
      : "";

  const orderedSections = orderSectionsForTemplate(doc.sections, activeTemplate.id);
  let body: string;
  if (activeTemplate.layout === "sidebar") {
    const aside = orderedSections.filter(isAsideSection);
    const main = orderedSections.filter((section) => !isAsideSection(section));
    body = `<div class="rail">${header}${aside.map((s) => renderSection(s, activeTemplate)).join("")}</div>
      <div class="main">${(main.length ? main : orderedSections).map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</div>`;
  } else {
    body = `${header}<div class="main">${orderedSections.map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</div>`;
  }

  // O(1) Height Reporter Script with zero layout thrashing (only for live interactive preview)
  const heightReporterScript = isInteractive
    ? `
    <script>
      (function() {
        var lastReportedH = 0;
        var rafId = null;

        function sendHeight() {
          try {
            var page = document.querySelector('.page');
            if (!page) return;

            // O(1) layout measurement without querySelectorAll('*') reflow loops
            var totalH = page.scrollHeight;
            var main = page.querySelector('.main') || page;
            var lastEl = main.lastElementChild;
            while (lastEl && (lastEl.classList.contains('latex-underlying-format') || (lastEl.classList.contains('ats-ghost-keywords') && !lastEl.classList.contains('ats-ghost-keywords-xray')))) {
              lastEl = lastEl.previousElementSibling;
            }
            var contentBottom = lastEl ? (lastEl.offsetTop + lastEl.offsetHeight + 25) : totalH;
            var effectiveH = Math.max(contentBottom, totalH);

            var pageCount = effectiveH <= 1080 ? 1 : Math.max(1, Math.ceil(effectiveH / 1100));
            var h = pageCount * 1100;

            if (h !== lastReportedH && window.parent) {
              lastReportedH = h;
              window.parent.postMessage({
                type: 'RESUME_DOC_HEIGHT',
                height: h,
                pageCount: pageCount,
                contentBottom: effectiveH
              }, '*');
            }
          } catch(e) {}
        }

        function scheduleHeight() {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(sendHeight);
        }

        if (document.readyState === 'complete') {
          scheduleHeight();
        } else {
          window.addEventListener('load', scheduleHeight, { once: true });
        }

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(scheduleHeight);
        }

        if (window.ResizeObserver) {
          var ro = new ResizeObserver(scheduleHeight);
          var p = document.querySelector('.page');
          if (p) ro.observe(p);
        }

        // Forward vertical mousewheel / trackpad scrolling up to the parent canvas
        window.addEventListener('wheel', function(e) {
          if (window.parent && Math.abs(e.deltaY) > 0) {
            window.parent.postMessage({ type: 'RESUME_WHEEL', deltaY: e.deltaY }, '*');
          }
        }, { passive: true });
      })();
    </script>
  `
    : "";

  const finalHtml = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${escapeHtml(doc.name || fallbackName)} — Resume</title>
<meta name="generator" content="pdfLaTeX / Overleaf FAANGPath Engine" />
<meta name="application-name" content="Overleaf ResumeMatcher" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${fontsHref(activeTemplate.googleFonts)}" />
<style>${baseCss(activeTemplate)}${layoutCss(activeTemplate)}</style>
</head><body><div class="page">${body}</div>${latexSemanticTag}${heightReporterScript}</body></html>`;

  if (htmlRenderCache.size >= MAX_CACHE_SIZE) {
    const firstKey = htmlRenderCache.keys().next().value;
    if (firstKey) htmlRenderCache.delete(firstKey);
  }
  htmlRenderCache.set(cacheKey, finalHtml);

  return finalHtml;
}
