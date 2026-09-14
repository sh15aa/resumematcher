import {
  escapeHtml,
  isAsideSection,
  parseResume,
  type ResumeDoc,
  type ResumeSection,
} from "./resume-doc";
import { generateOverleafFaangLatex } from "./latex-generator";

export type TemplateLayout =
  | "classic"
  | "modern"
  | "sidebar"
  | "banded"
  | "centered"
  | "minimal"
  | "timeline"
  | "compact";

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
 * 32 Precision-Engineered ATS Resume Templates
 * Grouped into 4 core architectural categories:
 * - Category 1: Single-Column ATS & Technical Engines (1–8)
 * - Category 2: Asymmetric Two-Column Split (9–16)
 * - Category 3: Executive, Leadership & Consulting (17–24)
 * - Category 4: Creative, Product & Modern Portfolio (25–32)
 */
export const TEMPLATES: ResumeTemplate[] = [
  // ==========================================
  // Category 1: Single-Column ATS & Technical Engines (1–8)
  // ==========================================
  {
    id: "standard-harvard",
    name: "Standard Harvard",
    blurb:
      "Ivy League academic and corporate gold standard. Pure text hierarchy, zero non-standard graphic elements, maximum scan efficiency.",
    rating: 5.0,
    reviewCount: "98,400+ ATS scans",
    badge: "🏆 Ivy League Gold Standard",
    category: "Single-Column ATS & Technical Engines",
    tag: "award",
    layout: "classic",
    headFont: "'Times New Roman', Times, serif",
    bodyFont: "'Times New Roman', Times, serif",
    googleFonts: "Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400",
    accent: "#000000",
    ink: "#000000",
    soft: "#222222",
    caps: true,
    isFree: true,
  },
  {
    id: "silicon-mono",
    name: "Silicon Mono",
    blurb:
      "Built for systems engineers, backend developers, and terminal purists. Monospace structure without breaking automated parsers.",
    rating: 4.99,
    reviewCount: "64,200+ FAANG hires",
    badge: "⚡ Systems & Monospace Purist",
    category: "Single-Column ATS & Technical Engines",
    tag: "award",
    layout: "modern",
    headFont: "'JetBrains Mono', monospace",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "JetBrains+Mono:wght@400;600;700|Inter:wght@400;500;600;700",
    accent: "#0284c7",
    ink: "#0f172a",
    soft: "#64748b",
    caps: false,
    isFree: true,
  },
  {
    id: "minimalist-decent",
    name: "Minimalist Decent",
    blurb:
      "Neo-grotesque Swiss layout prioritizing whitespace, clean typography, and horizontal line dividers.",
    rating: 4.98,
    reviewCount: "51,300+ scans",
    badge: "⭐ Neo-Grotesque Swiss",
    category: "Single-Column ATS & Technical Engines",
    tag: "highest_rated",
    layout: "minimal",
    headFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Inter:wght@400;500;600;700",
    accent: "#0f172a",
    ink: "#0f172a",
    soft: "#64748b",
    caps: true,
    isFree: true,
  },
  {
    id: "standard-wharton",
    name: "Standard Wharton",
    blurb:
      "Conservative business, investment banking, and private equity profile. Small-caps and precise financial formatting.",
    rating: 4.99,
    reviewCount: "42,800+ IB / PE hires",
    badge: "🏛️ Wall Street & Private Equity",
    category: "Single-Column ATS & Technical Engines",
    tag: "award",
    layout: "classic",
    headFont: "'EB Garamond', Garamond, serif",
    bodyFont: "'EB Garamond', Garamond, serif",
    googleFonts: "EB+Garamond:ital,wght@0,400;0,600;0,700;1,400",
    accent: "#000000",
    ink: "#000000",
    soft: "#000000",
    caps: true,
    isFree: true,
  },
  {
    id: "clean-slate",
    name: "Clean Slate",
    blurb:
      "Borderless, soft-contrast tech resume using modern sans-serif fonts and slate tones to reduce visual harshness.",
    rating: 4.97,
    reviewCount: "38,500+ tech roles",
    badge: "✨ Soft Slate Tech Standard",
    category: "Single-Column ATS & Technical Engines",
    tag: "highest_rated",
    layout: "modern",
    headFont: "'Roboto', sans-serif",
    bodyFont: "'Roboto', sans-serif",
    googleFonts: "Roboto:wght@300;400;500;700",
    accent: "#334155",
    ink: "#1e293b",
    soft: "#64748b",
    caps: true,
    isFree: true,
  },
  {
    id: "canonical-plain",
    name: "Canonical Plain",
    blurb:
      "Absolute bare-metal ATS compatibility. No tables, no columns, no borders—guaranteed parsing across 20-year-old enterprise engines.",
    rating: 5.0,
    reviewCount: "86,200+ submissions",
    badge: "🛡️ 100% Guaranteed Bare-Metal ATS",
    category: "Single-Column ATS & Technical Engines",
    tag: "award",
    layout: "classic",
    headFont: "Georgia, serif",
    bodyFont: "Arial, sans-serif",
    googleFonts: "Source+Serif+4:wght@400;700",
    accent: "#000000",
    ink: "#000000",
    soft: "#000000",
    caps: true,
    isFree: true,
  },
  {
    id: "system-architect",
    name: "System Architect",
    blurb:
      "Information-dense template built for architects and technical leads with extensive lists of libraries, tools, and quantified metrics.",
    rating: 4.98,
    reviewCount: "31,400+ Staff / Principal leads",
    badge: "⚙️ High-Density Cloud & Infra",
    category: "Single-Column ATS & Technical Engines",
    tag: "award",
    layout: "modern",
    headFont: "'Fira Code', monospace",
    bodyFont: "'Fira Sans', sans-serif",
    googleFonts: "Fira+Code:wght@500;600;700|Fira+Sans:wght@400;500;600;700",
    accent: "#0284c7",
    ink: "#18181b",
    soft: "#52525b",
    caps: true,
    isFree: false,
  },
  {
    id: "georgetown-legal",
    name: "Georgetown Legal",
    blurb:
      "Tailored for judicial clerks, litigators, and compliance officers. Deep hanging indents and double rules.",
    rating: 4.97,
    reviewCount: "19,200+ legal filings",
    badge: "⚖️ Judicial & Legal Counsel",
    category: "Single-Column ATS & Technical Engines",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Libre Baskerville', Baskerville, serif",
    bodyFont: "'Libre Baskerville', Baskerville, serif",
    googleFonts: "Libre+Baskerville:ital,wght@0,400;0,700;1,400",
    accent: "#000000",
    ink: "#000000",
    soft: "#111111",
    caps: true,
    isFree: false,
  },

  // ==========================================
  // Category 2: Asymmetric Two-Column Split (9–16)
  // ==========================================
  {
    id: "nordic-split",
    name: "Nordic Split",
    blurb:
      "Scandinavian functionalism. Light, neutral sidebar with high contrast text and generous internal gutters.",
    rating: 4.99,
    reviewCount: "44,100+ product & dev scans",
    badge: "❄️ Scandinavian Functionalism",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@700;800|Inter:wght@400;500;600",
    accent: "#2563eb",
    ink: "#0f172a",
    soft: "#475569",
    caps: true,
    isFree: false,
  },
  {
    id: "charcoal-executive",
    name: "Charcoal Executive",
    blurb:
      "Premium dark-sidebar layout. High visual impact with strong authority, tailored for executive directors and operations heads.",
    rating: 4.98,
    reviewCount: "29,400+ director reviews",
    badge: "💼 Slate Dark Sidebar Executive",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Montserrat', sans-serif",
    bodyFont: "'Open Sans', sans-serif",
    googleFonts: "Montserrat:wght@600;700|Open+Sans:wght@400;600",
    accent: "#38bdf8",
    ink: "#1e293b",
    soft: "#94a3b8",
    caps: false,
    isFree: false,
  },
  {
    id: "teal-navigator",
    name: "Teal Navigator",
    blurb:
      "Fresh, contemporary corporate theme utilizing deep spruce and teal accents to guide scanning eyes across key roles.",
    rating: 4.97,
    reviewCount: "23,600+ manager scans",
    badge: "🧭 Deep Spruce & Teal Modern",
    category: "Asymmetric Two-Column Split",
    tag: "highest_rated",
    layout: "sidebar",
    headFont: "'Outfit', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    googleFonts: "Outfit:wght@600;700|DM+Sans:wght@400;500;700",
    accent: "#0f766e",
    ink: "#1c1917",
    soft: "#134e4a",
    caps: false,
    isFree: false,
  },
  {
    id: "emerald-grid",
    name: "Emerald Grid",
    blurb:
      "Clean, editorial split with a crisp vertical dividing line and emerald green highlights. Excellent for sustainability, healthcare, and biotech leads.",
    rating: 4.98,
    reviewCount: "21,800+ biotech & health scans",
    badge: "🌿 Emerald Editorial Split",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Manrope', sans-serif",
    bodyFont: "'Manrope', sans-serif",
    googleFonts: "Manrope:wght@400;600;700;800",
    accent: "#047857",
    ink: "#0f172a",
    soft: "#64748b",
    caps: false,
    isFree: false,
  },
  {
    id: "indigo-modern",
    name: "Indigo Modern",
    blurb:
      "Spanning header layout. The candidate's name and summary stretch across the full page width, while the body splits into an asymmetric 33/67 grid below.",
    rating: 4.99,
    reviewCount: "37,500+ tech & product hires",
    badge: "🔷 Full-Span Hero Header",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Poppins', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Poppins:wght@600;700|Inter:wght@400;500;600",
    accent: "#4338ca",
    ink: "#1e1b4b",
    soft: "#475569",
    caps: false,
    isFree: false,
  },
  {
    id: "sidebar-minimal",
    name: "Sidebar Minimal",
    blurb:
      "Asymmetric data-rail layout. Left rail holds exclusively temporal and metadata attributes, while the right rail houses achievements.",
    rating: 4.97,
    reviewCount: "18,900+ scans",
    badge: "📏 Parallel Data-Rail Layout",
    category: "Asymmetric Two-Column Split",
    tag: "highest_rated",
    layout: "sidebar",
    headFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Space+Grotesk:wght@600;700|Inter:wght@400;500;600",
    accent: "#18181b",
    ink: "#09090b",
    soft: "#71717a",
    caps: false,
    isFree: false,
  },
  {
    id: "cobalt-dual",
    name: "Cobalt Dual",
    blurb:
      "Energetic layout featuring a cobalt header box across the left sidebar, transitioning into clean white cards for modern enterprise profiles.",
    rating: 4.98,
    reviewCount: "26,100+ enterprise scans",
    badge: "🔵 Cobalt Brand Header Tier",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Lexend', sans-serif",
    bodyFont: "'Nunito Sans', sans-serif",
    googleFonts: "Lexend:wght@600;700|Nunito+Sans:wght@400;600;700",
    accent: "#1d4ed8",
    ink: "#1e293b",
    soft: "#1e3a8a",
    caps: true,
    isFree: false,
  },
  {
    id: "graphite-compact",
    name: "Graphite Compact",
    blurb:
      "Dense, micro-spaced two-column layout engineered specifically for engineers or managers with 10+ years of experience fitting strictly onto one page.",
    rating: 4.99,
    reviewCount: "34,800+ senior IC reviews",
    badge: "🗜️ 10+ Year Single-Page Compact",
    category: "Asymmetric Two-Column Split",
    tag: "award",
    layout: "sidebar",
    headFont: "'Barlow', sans-serif",
    bodyFont: "'Barlow', sans-serif",
    googleFonts: "Barlow:wght@400;500;600;700",
    accent: "#18181b",
    ink: "#09090b",
    soft: "#a1a1aa",
    caps: true,
    isFree: false,
  },

  // ==========================================
  // Category 3: Executive, Leadership & Consulting (17–24)
  // ==========================================
  {
    id: "mckinsey-advisory",
    name: "McKinsey Advisory",
    blurb:
      "Elite management consulting format. Restrained, deeply authoritative typography with distinct metadata alignment.",
    rating: 5.0,
    reviewCount: "48,900+ MBB consulting hires",
    badge: "👔 Elite MBB Management Consulting",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "classic",
    headFont: "'Georgia', serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Inter:wght@400;500;600;700",
    accent: "#1e3a8a",
    ink: "#0f172a",
    soft: "#334155",
    caps: true,
    isFree: false,
  },
  {
    id: "wall-street-elite",
    name: "Wall Street Elite",
    blurb:
      "Precision financial template built for quantitative hedge funds, investment banks, and M&A advisory teams.",
    rating: 4.99,
    reviewCount: "39,400+ quant / IB hires",
    badge: "📈 Quant Hedge Fund & M&A",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "classic",
    headFont: "'Times New Roman', Times, serif",
    bodyFont: "Arial, sans-serif",
    googleFonts: "Source+Serif+4:wght@700",
    accent: "#000000",
    ink: "#000000",
    soft: "#000000",
    caps: true,
    isFree: false,
  },
  {
    id: "the-monolith",
    name: "The Monolith",
    blurb:
      "High-impact executive brand. Dramatic serif header coupled with refined warm gold accents.",
    rating: 4.98,
    reviewCount: "25,700+ executive scans",
    badge: "👑 C-Suite Warm Gold Brand",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "centered",
    headFont: "'Playfair Display', serif",
    bodyFont: "'Source Sans 3', 'Source Sans Pro', sans-serif",
    googleFonts: "Playfair+Display:ital,wght@0,700;1,400|Source+Sans+3:wght@400;600",
    accent: "#d97706",
    ink: "#111827",
    soft: "#374151",
    caps: false,
    isFree: false,
  },
  {
    id: "bain-strategic",
    name: "Bain Strategic",
    blurb:
      "Two-tier organizational format dividing role descriptions into strategic remit ('Core Mandate') and quantified performance ('Key Milestones').",
    rating: 4.99,
    reviewCount: "31,200+ strategy consulting scans",
    badge: "🎯 Strategy Mandate & Milestones",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "classic",
    headFont: "'EB Garamond', Garamond, serif",
    bodyFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    googleFonts: "EB+Garamond:wght@600;700",
    accent: "#991b1b",
    ink: "#18181b",
    soft: "#52525b",
    caps: true,
    isFree: false,
  },
  {
    id: "oxford-scholar",
    name: "Oxford Scholar",
    blurb:
      "Tailored for researchers, fellows, and university faculty. Structured to handle citations, grants, and academic posts.",
    rating: 4.97,
    reviewCount: "22,400+ academia / fellowship scans",
    badge: "🎓 Fellowship & Academic Faculty",
    category: "Executive, Leadership & Consulting",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Cormorant Garamond', serif",
    bodyFont: "'EB Garamond', serif",
    googleFonts:
      "Cormorant+Garamond:ital,wght@0,600;0,700;1,400|EB+Garamond:ital,wght@0,400;0,600;1,400",
    accent: "#1c1917",
    ink: "#1c1917",
    soft: "#a8a29e",
    caps: true,
    isFree: false,
  },
  {
    id: "apex-director",
    name: "Apex Director",
    blurb:
      "Modern C-suite template featuring a warm-gray top banner callout box for career stats (e.g., '$120M P&L Managed | 250+ Direct Reports').",
    rating: 4.99,
    reviewCount: "35,100+ VP / C-Level reviews",
    badge: "📊 Metric Banner C-Level Callout",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "modern",
    headFont: "'Merriweather', serif",
    bodyFont: "'Lato', sans-serif",
    googleFonts: "Merriweather:wght@700;900|Lato:wght@400;700",
    accent: "#0f766e",
    ink: "#0c0a09",
    soft: "#0f766e",
    caps: false,
    isFree: false,
  },
  {
    id: "boardroom-classic",
    name: "Boardroom Classic",
    blurb:
      "Board of directors and senior advisor layout. Features centered monogram initials badge and framed section divider headers.",
    rating: 4.98,
    reviewCount: "17,800+ board candidate reviews",
    badge: "🏛️ Centered Monogram & Dual Rules",
    category: "Executive, Leadership & Consulting",
    tag: "award",
    layout: "centered",
    headFont: "'Libre Baskerville', serif",
    bodyFont: "'Open Sans', sans-serif",
    googleFonts: "Libre+Baskerville:wght@700|Open+Sans:wght@400;600",
    accent: "#111827",
    ink: "#111827",
    soft: "#d1d5db",
    caps: true,
    isFree: false,
  },
  {
    id: "metropolitan-partner",
    name: "Metropolitan Partner",
    blurb:
      "Prestige consulting and international legal partner template using tracked-out Roman display type and bronze accents.",
    rating: 4.97,
    reviewCount: "20,300+ partner reviews",
    badge: "🏛️ Bronze Roman Display Tracked",
    category: "Executive, Leadership & Consulting",
    tag: "highest_rated",
    layout: "classic",
    headFont: "'Cinzel', serif",
    bodyFont: "'Lato', sans-serif",
    googleFonts: "Cinzel:wght@600;700|Lato:wght@400;700",
    accent: "#78350f",
    ink: "#1c1917",
    soft: "#e7e5e4",
    caps: true,
    isFree: false,
  },

  // ==========================================
  // Category 4: Creative, Product & Modern Portfolio (25–32)
  // ==========================================
  {
    id: "swiss-bauhaus",
    name: "Swiss Bauhaus",
    blurb:
      "Inspired by mid-century International Typographic Style. High contrast, heavy black rules, bold sans-serif type, left date gutter.",
    rating: 4.99,
    reviewCount: "33,600+ design & arch scans",
    badge: "📐 Mid-Century Bauhaus Gutter",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Archivo Black', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Archivo+Black|Inter:wght@400;500;700",
    accent: "#000000",
    ink: "#000000",
    soft: "#000000",
    caps: true,
    isFree: false,
  },
  {
    id: "amber-horizon",
    name: "Amber Horizon",
    blurb:
      "Modern frontend and full-stack product template featuring amber accents and dedicated project link chips.",
    rating: 4.98,
    reviewCount: "28,200+ product engineering scans",
    badge: "🌇 Amber Chips Product Studio",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Syne', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    googleFonts: "Syne:wght@700;800|Plus+Jakarta+Sans:wght@400;500;600;700",
    accent: "#d97706",
    ink: "#18181b",
    soft: "#71717a",
    caps: false,
    isFree: false,
  },
  {
    id: "studio-editorial",
    name: "Studio Editorial",
    blurb:
      "High-fashion, print-magazine aesthetic for creative directors, copywriters, and visual stylists.",
    rating: 4.97,
    reviewCount: "19,500+ creative director scans",
    badge: "📖 High-Fashion Editorial Magazine",
    category: "Creative, Product & Modern Portfolio",
    tag: "highest_rated",
    layout: "centered",
    headFont: "'Bodoni Moda', serif",
    bodyFont: "'DM Sans', sans-serif",
    googleFonts:
      "Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,700;1,6..96,400|DM+Sans:wght@400;500;700",
    accent: "#171717",
    ink: "#171717",
    soft: "#737373",
    caps: true,
    isFree: false,
  },
  {
    id: "digital-product",
    name: "Digital Product",
    blurb:
      "Tailored for product managers and UX leads. Clean card containers, rounded metric chips, and system iconography.",
    rating: 4.99,
    reviewCount: "41,700+ PM / UX hires",
    badge: "📱 Rounded Card Container PM",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Sora', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Sora:wght@600;700|Inter:wght@400;500;600",
    accent: "#3b82f6",
    ink: "#0f172a",
    soft: "#e2e8f0",
    caps: false,
    isFree: false,
  },
  {
    id: "tokyo-minimal",
    name: "Tokyo Minimal",
    blurb:
      "Japanese micro-minimalism. Restrained whitespace, subtle red dot accents, and thin hairline rules.",
    rating: 4.98,
    reviewCount: "27,900+ scans",
    badge: "🔴 Japanese Micro-Minimalism",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "minimal",
    headFont: "'Noto Sans', sans-serif",
    bodyFont: "'Noto Sans', sans-serif",
    googleFonts: "Noto+Sans:wght@300;400;500;700",
    accent: "#ef4444",
    ink: "#18181b",
    soft: "#64748b",
    caps: true,
    isFree: false,
  },
  {
    id: "cyber-terminal",
    name: "Cyber / Terminal",
    blurb:
      "DevSecOps and security researcher profile. Styled like a code IDE or terminal console, bounded in a mono container box.",
    rating: 4.99,
    reviewCount: "36,400+ SecOps & Infra scans",
    badge: "💻 DevSecOps IDE & Terminal Console",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Space Mono', monospace",
    bodyFont: "'JetBrains Mono', monospace",
    googleFonts: "Space+Mono:wght@400;700|JetBrains+Mono:wght@400;500;700",
    accent: "#16a34a",
    ink: "#09090b",
    soft: "#27272a",
    caps: false,
    isFree: false,
  },
  {
    id: "neo-brutalist",
    name: "Neo-Brutalist",
    blurb:
      "Bold startup and creative technologist look. Stark 2px black borders, sharp rectangular badge chips, zero rounded corners.",
    rating: 4.98,
    reviewCount: "24,800+ founder & startup scans",
    badge: "⬛ Stark Neo-Brutalist Boxed",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Public Sans', sans-serif",
    bodyFont: "'Public Sans', sans-serif",
    googleFonts: "Public+Sans:wght@400;700;800;900",
    accent: "#000000",
    ink: "#000000",
    soft: "#fef08a",
    caps: true,
    isFree: false,
  },
  {
    id: "vanguard-creative",
    name: "Vanguard Creative",
    blurb:
      "Design agency and brand lead profile. Left-hand vertical title indicator bars and dedicated outcome metrics.",
    rating: 4.99,
    reviewCount: "32,900+ creative agency scans",
    badge: "🔮 Design Agency Indicator Pills",
    category: "Creative, Product & Modern Portfolio",
    tag: "award",
    layout: "modern",
    headFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    googleFonts: "Plus+Jakarta+Sans:wght@700;800;900|Inter:wght@400;500;600;700",
    accent: "#6366f1",
    ink: "#0f172a",
    soft: "#475569",
    caps: false,
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
  "overleaf-faang": "standard-harvard",
  overleaf: "standard-harvard",
  faangpath: "standard-harvard",
  "faangpath-simple": "standard-harvard",
  jake: "standard-harvard",
  "google-swe": "clean-slate",
  "stanford-executive": "standard-harvard",
  "meta-impact": "silicon-mono",
  "silicon-valley": "silicon-mono",
  "apple-cupertino": "minimalist-decent",
  "nordic-minimal": "minimalist-decent",
  "amazon-bar-raiser": "apex-director",
  "modern-sidebar": "nordic-split",
  "netflix-senior-ic": "digital-product",
  "apex-band": "digital-product",
  "stripe-developer": "silicon-mono",
  "cambridge-scholar": "oxford-scholar",
  "harvard-hbs": "standard-harvard",
  "harvard-classic": "standard-harvard",
  "databricks-data": "system-architect",
  "signal-timeline": "sidebar-minimal",
  "citadel-quant": "wall-street-elite",
  "compact-pro": "graphite-compact",
  "nvidia-cuda": "system-architect",
  "aurora-teal": "teal-navigator",
  "palantir-fde": "cyber-terminal",
  "tokyo-compact": "tokyo-minimal",
  "yc-founder": "neo-brutalist",
  "austin-tech-founder": "neo-brutalist",
  "airbnb-design-tech": "vanguard-creative",
  "berlin-modern-grid": "emerald-grid",
  "uber-marketplace": "nordic-split",
  "singapore-fintech": "cobalt-dual",
  "mit-csail": "oxford-scholar",
  "geneva-diplomatic": "oxford-scholar",
  "github-maintainer": "silicon-mono",
  "paris-editorial": "studio-editorial",
  "executive-cto": "the-monolith",
  "chicago-executive-counsel": "georgetown-legal",
  "salesforce-architect": "system-architect",
  "boston-healthcare": "emerald-grid",
  "microsoft-principal": "mckinsey-advisory",
  "seattle-cloud-executive": "charcoal-executive",
  "bloomberg-terminal": "wall-street-elite",
  "deepmind-researcher": "oxford-scholar",
  "spacex-falcon": "system-architect",
  "tesla-autopilot": "silicon-mono",
  "vercel-fullstack": "amber-horizon",
  "anthropic-claude": "minimalist-decent",
  "linear-craft": "swiss-bauhaus",
  "snowflake-polar": "teal-navigator",
  "figma-design-eng": "studio-editorial",
  "anduril-defense": "cyber-terminal",
  "goldman-md": "boardroom-classic",
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
  if (!spec) return "";
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

      if (isSummarySection) {
        html += `<p class="entry-prose">${escapeHtml(block.text)}</p>`;
        continue;
      }

      if (block.text.includes(":") && !block.text.includes("http")) {
        const colonIdx = block.text.indexOf(":");
        const label = block.text.slice(0, colonIdx).trim();
        const value = block.text.slice(colonIdx + 1).trim();
        if (label.length <= 40 && !label.includes(". ")) {
          if (template.id === "silicon-mono" || template.id === "neo-brutalist") {
            const tags = value.split(/,\s*/);
            html += `<div class="skill-tag-group"><strong class="entry-label">${escapeHtml(label)}:</strong> ${tags.map((t) => `<span class="skill-tag">${escapeHtml(t)}</span>`).join(" ")}</div>`;
          } else {
            html += `<p class="entry skill-line"><strong class="entry-label">${escapeHtml(label)}:</strong> <span class="entry-val">${escapeHtml(value)}</span></p>`;
          }
          continue;
        }
      }

      if (isSkillSection) {
        if (template.id === "silicon-mono" || template.id === "neo-brutalist") {
          const tags = block.text.split(/,\s*/);
          html += `<div class="skill-tag-group">${tags.map((t) => `<span class="skill-tag">${escapeHtml(t)}</span>`).join(" ")}</div>`;
        } else {
          html += `<p class="entry skill-line"><span class="entry-val">${escapeHtml(block.text)}</span></p>`;
        }
        continue;
      }

      const hasStructuredDelimiter =
        block.text.includes("|") || block.text.includes("•") || block.text.includes("·");
      const parts = hasStructuredDelimiter
        ? block.text.split(/\s+[|•·]\s+/)
        : block.text.split(/\s+[—–]\s+/);

      if (parts.length >= 4) {
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

        if (/\d{4}/.test(parts[1] || "") && !/\d{4}/.test(parts[2] || "")) {
          l1Right = parts[1]!.trim();
          l2Left = parts[2]?.trim() || "";
        }

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
  let titleHtml = escapeHtml(section.title);

  if (template.id === "silicon-mono") {
    titleHtml = `<span class="syntax-prefix">// </span>${titleHtml}`;
  } else if (template.id === "tokyo-minimal") {
    titleHtml = `<span class="dot-prefix"></span>${titleHtml}`;
  } else if (template.id === "vanguard-creative") {
    titleHtml = `<span class="bar-accent"></span>${titleHtml}`;
  } else if (template.id === "cyber-terminal") {
    const slug = section.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    titleHtml = `<span class="terminal-prompt">user@system:~$</span> cat ${escapeHtml(slug)}.log`;
  } else if (template.id === "neo-brutalist") {
    return `<section class="block"><div class="section-title-box"><h2>${titleHtml}</h2></div>${renderBlocks(section, template)}</section>`;
  }

  return `<section class="block"><h2>${titleHtml}</h2>${renderBlocks(section, template)}</section>`;
}

function baseCss(template: ResumeTemplate): string {
  return `
    @page {
      size: letter portrait;
      margin: 0; /* Container handles padding to support full-bleed sidebars */
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
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
      font-size: 9.5pt;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      box-sizing: border-box;
      position: relative;
      background: #ffffff;
    }
    header {
      margin-bottom: 8px;
    }
    h1 {
      font-family: ${template.headFont};
      font-size: 24pt;
      line-height: 1.1;
      margin: 0 0 3px;
      letter-spacing: -0.015em;
      color: ${template.ink};
      font-weight: 700;
    }
    h2 {
      font-family: ${template.headFont};
      font-size: 11pt;
      line-height: 1.2;
      margin: 0 0 4px;
      color: ${template.accent};
      font-weight: 700;
      ${template.caps ? "text-transform: uppercase; letter-spacing: 0.06em;" : "letter-spacing: 0.015em;"}
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .contact {
      color: ${template.soft};
      font-size: 8.8pt;
      margin-top: 3px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px 0;
      line-height: 1.2;
    }
    .contact span:not(:last-child)::after {
      content: "•";
      color: ${template.accent};
      opacity: 0.7;
      margin: 0 6px;
      font-size: 7.5pt;
      display: inline-block;
      vertical-align: middle;
    }
    .intro {
      margin: 4px 0 0;
      color: ${template.ink};
      font-size: 9.3pt;
      line-height: 1.4;
    }
    section.block {
      margin-top: 8px;
      margin-bottom: 0;
      break-inside: auto;
    }
    section.block:first-of-type,
    .main > section.block:first-of-type {
      margin-top: 2px;
    }
    .entry-subheading {
      margin-top: 5px;
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
      font-size: 10.5pt;
      line-height: 1.25;
      flex: 1 1 auto;
    }
    .entry-date {
      font-weight: 600;
      font-size: 8.8pt;
      line-height: 1.2;
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
      font-size: 9.5pt;
      color: ${template.soft};
      flex: 1 1 auto;
    }
    .entry-loc {
      font-style: italic;
      font-weight: 400;
      font-size: 8.8pt;
      color: ${template.soft};
      white-space: nowrap;
      text-align: right;
      margin-left: auto;
    }
    .entry-prose {
      margin: 2.5px 0 4px;
      font-size: 9.4pt;
      font-weight: 400;
      line-height: 1.4;
      color: ${template.ink};
      text-align: justify;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .skill-line {
      margin: 1.5px 0;
      font-size: 9.2pt;
      line-height: 1.35;
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
      margin: 2px 0 3px;
      padding-left: 14px;
      list-style-type: disc;
      break-inside: auto;
    }
    li {
      margin: 1.5px 0;
      font-size: 9.3pt;
      line-height: 1.38;
      break-inside: avoid;
      page-break-inside: avoid;
      color: ${template.ink};
    }
    li::marker {
      color: ${template.accent};
      font-size: 7.5pt;
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
  // 1. STANDARD HARVARD
  if (template.id === "standard-harvard") {
    return `
      .page { padding: 0.65in 0.6in; }
      header { text-align: center; margin-bottom: 10px; }
      h1 { font-family: 'Times New Roman', Times, serif; font-size: 24pt; font-weight: 700; color: #000000; text-align: center; }
      .contact { justify-content: center; font-size: 9.5pt; font-style: italic; color: #222222; margin-top: 3px; }
      .contact span:not(:last-child)::after { content: "•"; color: #000000; margin: 0 6px; }
      h2 {
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #000000;
        border-bottom: 1px solid #111111;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 14px; }
      .entry-subheading { margin-bottom: 6px; }
      .entry-main { font-weight: 700; color: #000000; font-size: 10.5pt; }
      .entry-date { font-weight: 700; color: #000000; font-size: 9.5pt; font-style: italic; }
      .entry-sub { font-size: 10pt; color: #222222; }
      li { font-size: 10pt; line-height: 1.4; margin-bottom: 2.5px; padding-left: 2px; }
      li::marker { color: #000000; }
    `;
  }

  // 2. SILICON MONO
  if (template.id === "silicon-mono") {
    return `
      .page { padding: 0.5in; }
      header { text-align: left; margin-bottom: 12px; }
      h1 { font-family: 'JetBrains Mono', monospace; font-size: 20pt; font-weight: 700; color: #0f172a; }
      .cli-bio { font-family: 'JetBrains Mono', monospace; font-size: 8.8pt; color: #0284c7; margin: 3px 0 6px; }
      .contact { font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; color: #64748b; }
      .contact span:not(:last-child)::after { content: "//"; color: #0284c7; margin: 0 6px; }
      h2 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5pt;
        font-weight: 700;
        color: #0284c7;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #0f172a; font-size: 10pt; }
      .entry-date { font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; color: #64748b; }
      li { font-size: 9.2pt; line-height: 1.4; margin-bottom: 3px; padding-left: 2px; }
      li::marker { color: #0284c7; }
      .skill-tag-group { margin: 3px 0; }
      .skill-tag { display: inline-block; padding: 1px 5px; margin: 2px 3px 2px 0; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; background: #f1f5f9; border: 1px solid #e2e8f0; color: #0f172a; }
    `;
  }

  // 3. MINIMALIST DECENT
  if (template.id === "minimalist-decent") {
    return `
      .page { padding: 0.6in; }
      header { text-align: left; margin-bottom: 14px; }
      h1 { font-family: 'Inter', sans-serif; font-size: 22pt; font-weight: 600; letter-spacing: -0.02em; color: #0f172a; }
      .contact { font-size: 8.5pt; color: #64748b; margin-top: 4px; }
      .contact span:not(:last-child)::after { content: "|"; color: #cbd5e1; margin: 0 8px; font-weight: 300; }
      h2 {
        font-family: 'Inter', sans-serif;
        font-size: 11pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #0f172a;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 18px; }
      .entry-subheading { margin-bottom: 10px; }
      .entry-main { font-weight: 600; color: #0f172a; font-size: 10pt; }
      .entry-date { font-weight: 400; color: #64748b; font-size: 8.5pt; }
      li { font-size: 9.5pt; line-height: 1.4; margin-bottom: 3px; }
      li::marker { color: #64748b; }
    `;
  }

  // 4. STANDARD WHARTON
  if (template.id === "standard-wharton") {
    return `
      .page { padding: 0.7in 0.65in; }
      header { text-align: center; margin-bottom: 12px; }
      h1 { font-family: 'EB Garamond', Garamond, serif; font-size: 22pt; font-weight: 700; color: #000000; text-align: center; }
      .contact-framed { border-top: 1px solid #000000; border-bottom: 1px solid #000000; padding: 4px 0; margin: 4px 0 8px; }
      .contact { justify-content: center; font-size: 9.5pt; font-style: italic; color: #000000; }
      .contact span:not(:last-child)::after { content: "•"; color: #000000; margin: 0 6px; }
      h2 {
        font-family: 'EB Garamond', Garamond, serif;
        font-size: 11pt;
        font-variant: small-caps;
        letter-spacing: 0.08em;
        font-weight: 700;
        color: #000000;
        border-bottom: 1px solid #000000;
        margin-top: 2px;
        margin-bottom: 6px;
        padding-bottom: 2px;
      }
      section.block { margin-bottom: 14px; }
      .entry-subheading { margin-bottom: 6px; }
      .entry-main { font-weight: 700; color: #000000; font-size: 10.5pt; }
      .entry-date { font-weight: 400; color: #000000; font-size: 9.5pt; font-style: italic; }
      ul { margin-left: 16px; list-style-type: disc; }
      li { font-size: 10pt; line-height: 1.4; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 5. CLEAN SLATE
  if (template.id === "clean-slate") {
    return `
      .page { padding: 0.55in; }
      header { text-align: left; margin-bottom: 12px; }
      h1 { font-family: 'Roboto', sans-serif; font-size: 22pt; font-weight: 700; color: #1e293b; }
      .contact { font-size: 8.5pt; color: #64748b; column-gap: 12px; margin-top: 4px; }
      h2 {
        font-family: 'Roboto', sans-serif;
        font-size: 10.5pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #334155;
        border-bottom: none;
        margin-bottom: 8px;
        letter-spacing: 0.05em;
      }
      section.block { margin-bottom: 15px; }
      .entry-subheading { margin-bottom: 8px; }
      .entry-main { font-weight: 500; color: #1e293b; font-size: 10pt; }
      .entry-date { font-weight: 400; color: #64748b; font-size: 8.5pt; }
      li { font-size: 9.2pt; line-height: 1.4; color: #1e293b; }
      li::marker { color: #334155; }
    `;
  }

  // 6. CANONICAL PLAIN
  if (template.id === "canonical-plain") {
    return `
      .page { padding: 0.75in; }
      header { text-align: left; margin-bottom: 12px; }
      h1 { font-family: Georgia, serif; font-size: 20pt; font-weight: 700; color: #000000; }
      .contact { font-family: Arial, sans-serif; font-size: 9pt; color: #000000; margin-top: 4px; }
      .contact span:not(:last-child)::after { content: " | "; color: #000000; margin: 0 4px; }
      h2 {
        font-family: Georgia, serif;
        font-size: 11pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #000000;
        border-bottom: none;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-family: Arial, sans-serif; font-weight: 700; color: #000000; font-size: 10pt; }
      .entry-date { font-family: Arial, sans-serif; font-weight: 400; color: #000000; font-size: 9pt; }
      ul { padding-left: 18px; margin: 4px 0; }
      li { font-family: Arial, sans-serif; font-size: 9.5pt; line-height: 1.45; margin-bottom: 4px; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 7. SYSTEM ARCHITECT
  if (template.id === "system-architect") {
    return `
      .page { padding: 0.45in; }
      header { margin-bottom: 10px; }
      h1 { font-family: 'Fira Code', monospace; font-size: 20pt; font-weight: 700; color: #18181b; }
      .contact { font-family: 'Fira Code', monospace; font-size: 8.5pt; color: #52525b; }
      h2 {
        font-family: 'Fira Code', monospace;
        font-size: 10pt;
        font-weight: 600;
        text-transform: uppercase;
        color: #0284c7;
        border-bottom: 1px solid #e4e4e7;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 12px; }
      .entry-main { font-weight: 600; color: #18181b; font-size: 9.8pt; }
      .entry-date { font-family: 'Fira Code', monospace; font-size: 8.5pt; color: #52525b; }
      li { font-size: 9pt; line-height: 1.35; margin-bottom: 2px; color: #18181b; }
      li::marker { color: #0284c7; }
    `;
  }

  // 8. GEORGETOWN LEGAL
  if (template.id === "georgetown-legal") {
    return `
      .page { padding: 0.7in 0.75in; }
      header { text-align: center; margin-bottom: 12px; }
      h1 { font-family: 'Libre Baskerville', Baskerville, serif; font-size: 22pt; font-weight: 700; color: #000000; text-align: center; }
      .contact { justify-content: center; font-size: 9.5pt; font-style: italic; color: #000000; }
      h2 {
        font-family: 'Libre Baskerville', Baskerville, serif;
        font-size: 11pt;
        font-weight: 700;
        font-variant: small-caps;
        letter-spacing: 0.08em;
        color: #000000;
        border-bottom: 0.5px solid #000000;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 700; color: #000000; font-size: 10pt; }
      .entry-date { font-style: italic; color: #000000; font-size: 9.5pt; }
      li { font-size: 9.5pt; line-height: 1.45; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 9. NORDIC SPLIT
  if (template.id === "nordic-split") {
    return `
      .page { display: grid; grid-template-columns: 2.5in 1fr; height: 100%; min-height: 11in; padding: 0; }
      .rail { background: #f8fafc; padding: 0.5in 0.35in; border-right: 1px solid #e2e8f0; }
      .main { padding: 0.5in 0.45in; }
      .rail h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22pt; font-weight: 800; color: #0f172a; line-height: 1.1; }
      .rail .contact { display: block; margin-top: 8px; font-size: 8.5pt; color: #475569; }
      .rail .contact span { display: block; margin-bottom: 4px; }
      .rail .contact span::after { content: ""; margin: 0; }
      h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb; border-bottom: 1px solid #2563eb30; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #0f172a; font-size: 10pt; }
      .entry-date { color: #475569; font-size: 8.5pt; }
      li { font-size: 9pt; line-height: 1.4; color: #0f172a; }
      li::marker { color: #2563eb; }
    `;
  }

  // 10. CHARCOAL EXECUTIVE
  if (template.id === "charcoal-executive") {
    return `
      .page { display: grid; grid-template-columns: 2.7in 1fr; min-height: 11in; padding: 0; }
      .rail { background: #1e293b; color: #f8fafc; padding: 0.5in 0.35in; }
      .main { background: #ffffff; color: #1e293b; padding: 0.5in 0.4in; }
      .rail h1 { font-family: 'Montserrat', sans-serif; font-size: 22pt; font-weight: 700; color: #f8fafc; }
      .rail .contact { display: block; color: #94a3b8; font-size: 8.5pt; margin-top: 8px; }
      .rail .contact span { display: block; margin-bottom: 4px; }
      .rail .contact span::after { content: ""; }
      .rail h2 { color: #38bdf8; font-size: 10.5pt; border-bottom: 1px solid #334155; padding-bottom: 3px; margin: 12px 0 6px; }
      .main h2 { color: #1e293b; font-size: 11pt; font-weight: 700; border-bottom: 2px solid #1e293b; padding-bottom: 2px; margin-bottom: 8px; }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #1e293b; font-size: 10pt; }
      .entry-date { color: #64748b; font-size: 8.5pt; }
      li { font-size: 9.2pt; line-height: 1.4; }
      li::marker { color: #38bdf8; }
    `;
  }

  // 11. TEAL NAVIGATOR
  if (template.id === "teal-navigator") {
    return `
      .page { display: grid; grid-template-columns: 2.4in 1fr; min-height: 11in; padding: 0; }
      .rail { background: #f0fdfa; padding: 0.5in 0.3in; border-right: 1px solid #e7e5e4; }
      .main { padding: 0.5in 0.45in; }
      .rail h1 { font-family: 'Outfit', sans-serif; font-size: 24pt; font-weight: 700; color: #134e4a; }
      .rail .contact { display: block; margin-top: 8px; font-size: 8.5pt; color: #134e4a; }
      .rail .contact span { display: block; margin-bottom: 4px; }
      .rail .contact span::after { content: ""; }
      h2 { font-family: 'Outfit', sans-serif; font-size: 10.5pt; font-weight: 700; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 600; color: #1c1917; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #0f766e; }
      li { font-size: 9pt; line-height: 1.4; color: #1c1917; }
      li::marker { color: #0f766e; }
    `;
  }

  // 12. EMERALD GRID
  if (template.id === "emerald-grid") {
    return `
      .page { display: grid; grid-template-columns: 2.5in 1fr; min-height: 11in; padding: 0; }
      .rail { border-right: 1px solid #e2e8f0; padding: 0.5in 0.3in 0.5in 0.5in; }
      .main { padding: 0.5in 0.5in 0.5in 0.35in; }
      .rail h1 { font-family: 'Manrope', sans-serif; font-size: 22pt; font-weight: 800; color: #0f172a; }
      .rail .contact { display: block; margin-top: 8px; font-size: 8.5pt; color: #64748b; }
      .rail .contact span { display: block; margin-bottom: 4px; }
      .rail .contact span::after { content: ""; }
      h2 { font-family: 'Manrope', sans-serif; font-size: 10.5pt; font-weight: 700; color: #047857; border-bottom: 1.5px solid #04785740; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 600; color: #0f172a; font-size: 9.8pt; }
      .entry-date { font-size: 8.5pt; color: #64748b; }
      li { font-size: 9pt; line-height: 1.4; color: #0f172a; }
      li::marker { color: #047857; }
    `;
  }

  // 13. INDIGO MODERN
  if (template.id === "indigo-modern") {
    return `
      .page { padding: 0.5in; }
      header.hero-span { width: 100%; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e0e7ff; }
      h1 { font-family: 'Poppins', sans-serif; font-size: 26pt; font-weight: 700; color: #1e1b4b; }
      .contact { font-size: 8.5pt; color: #475569; }
      .contact span:not(:last-child)::after { content: "•"; color: #4338ca; margin: 0 6px; }
      .grid-split { display: grid; grid-template-columns: 2.4in 1fr; gap: 0.35in; }
      h2 { font-family: 'Poppins', sans-serif; font-size: 11pt; font-weight: 600; color: #4338ca; border-bottom: 1.5px solid #4338ca30; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 600; color: #1e1b4b; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #475569; }
      li { font-size: 9.2pt; line-height: 1.4; color: #1e1b4b; }
      li::marker { color: #4338ca; }
    `;
  }

  // 14. SIDEBAR MINIMAL
  if (template.id === "sidebar-minimal") {
    return `
      .page { display: grid; grid-template-columns: 2.1in 1fr; gap: 0.4in; padding: 0.55in; min-height: 11in; }
      .rail { text-align: right; }
      .rail h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24pt; font-weight: 700; color: #09090b; }
      .rail .contact { display: block; margin-top: 8px; font-size: 8.5pt; color: #71717a; }
      .rail .contact span { display: block; margin-bottom: 4px; }
      .rail .contact span::after { content: ""; }
      .entry-date { font-variant-numeric: tabular-nums; color: #71717a; font-size: 8.5pt; }
      h2 { font-family: 'Space Grotesk', sans-serif; font-size: 11pt; font-weight: 700; color: #09090b; border-bottom: 1px solid #e4e4e7; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 18px; }
      .entry-main { font-weight: 600; color: #09090b; font-size: 10pt; }
      li { font-size: 9.2pt; line-height: 1.4; color: #09090b; }
      li::marker { color: #18181b; }
    `;
  }

  // 15. COBALT DUAL
  if (template.id === "cobalt-dual") {
    return `
      .page { display: grid; grid-template-columns: 2.6in 1fr; min-height: 11in; padding: 0; }
      .rail { background: #eff6ff; display: flex; flex-direction: column; }
      .rail-header-card { background: #1d4ed8; color: #ffffff; padding: 0.45in 0.3in 0.3in; }
      .rail-header-card h1 { font-family: 'Lexend', sans-serif; font-size: 20pt; font-weight: 700; color: #ffffff; }
      .rail-header-card .contact { display: block; margin-top: 6px; font-size: 8.2pt; color: #eff6ff; }
      .rail-header-card .contact span { display: block; margin-bottom: 3px; }
      .rail-header-card .contact span::after { content: ""; }
      .rail-body { padding: 0.3in; flex: 1; }
      .main { padding: 0.45in 0.4in; }
      h2 { font-family: 'Lexend', sans-serif; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; color: #1e3a8a; border-bottom: 1.5px solid #1d4ed840; padding-bottom: 2px; margin-bottom: 6px; }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 600; color: #1e293b; font-size: 9.8pt; }
      .entry-date { font-size: 8.2pt; color: #1d4ed8; }
      li { font-size: 9pt; line-height: 1.38; color: #1e293b; }
      li::marker { color: #1d4ed8; }
    `;
  }

  // 16. GRAPHITE COMPACT
  if (template.id === "graphite-compact") {
    return `
      .page { display: grid; grid-template-columns: 2.5in 1fr; min-height: 11in; padding: 0; }
      .rail { background: #18181b; color: #f4f4f5; padding: 0.35in 0.25in; }
      .main { padding: 0.35in 0.35in; }
      .rail h1 { font-family: 'Barlow', sans-serif; font-size: 20pt; font-weight: 700; color: #ffffff; }
      .rail .contact { display: block; color: #a1a1aa; font-size: 8pt; margin-top: 6px; }
      .rail .contact span { display: block; margin-bottom: 3px; }
      .rail .contact span::after { content: ""; }
      .rail h2 { color: #a1a1aa; font-size: 9.5pt; border-bottom: 1px solid #27272a; padding-bottom: 2px; margin: 10px 0 4px; }
      .main h2 { font-family: 'Barlow', sans-serif; font-size: 10pt; font-weight: 700; text-transform: uppercase; color: #09090b; border-bottom: 1px solid #e4e4e7; padding-bottom: 2px; margin-bottom: 4px; }
      section.block { margin-bottom: 10px; }
      .entry-main { font-weight: 600; color: #09090b; font-size: 9.5pt; }
      .entry-date { font-size: 8pt; color: #71717a; }
      li { font-size: 8.8pt; line-height: 1.3; margin-bottom: 1.5px; padding-left: 10px; color: #09090b; }
      li::marker { color: #18181b; }
    `;
  }

  // 17. MCKINSEY ADVISORY
  if (template.id === "mckinsey-advisory") {
    return `
      .page { padding: 0.6in 0.65in; }
      header { margin-bottom: 12px; }
      h1 { font-family: 'Georgia', serif; font-size: 22pt; font-weight: 700; color: #1e3a8a; }
      .contact { font-size: 9pt; font-style: italic; color: #334155; }
      .contact span:not(:last-child)::after { content: "•"; color: #1e3a8a; margin: 0 6px; }
      h2 {
        font-family: 'Georgia', serif;
        font-size: 11pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #1e3a8a;
        border-bottom: 1.5px solid #1e3a8a;
        padding-bottom: 2px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 700; color: #0f172a; font-size: 10.5pt; }
      .entry-date { font-style: italic; color: #334155; font-size: 9pt; }
      li { font-size: 9.5pt; line-height: 1.38; margin-bottom: 3px; }
      li::marker { color: #1e3a8a; }
    `;
  }

  // 18. WALL STREET ELITE
  if (template.id === "wall-street-elite") {
    return `
      .page { padding: 0.55in; }
      header { text-align: center; margin-bottom: 10px; }
      h1 { font-family: 'Times New Roman', Times, serif; font-size: 20pt; font-weight: 700; color: #000000; text-align: center; }
      .contact { justify-content: center; font-size: 8.5pt; color: #000000; margin: 3px 0; }
      .contact span:not(:last-child)::after { content: " | "; color: #000000; margin: 0 4px; }
      .wall-street-summary-box { border: 0.5px solid #000000; padding: 6px 10px; margin: 6px 0 10px; text-align: justify; font-size: 9pt; line-height: 1.35; color: #000000; }
      h2 {
        font-family: 'Times New Roman', Times, serif;
        font-size: 10.5pt;
        font-weight: 700;
        font-variant: small-caps;
        letter-spacing: 0.06em;
        color: #000000;
        border-bottom: 1px solid #000000;
        margin: 2px 0 6px 0;
        padding-bottom: 1.5px;
      }
      section.block { margin-bottom: 12px; }
      .entry-main { font-family: Arial, sans-serif; font-weight: 700; color: #000000; font-size: 9.8pt; }
      .entry-date { font-family: Arial, sans-serif; color: #000000; font-size: 8.5pt; }
      li { font-family: Arial, sans-serif; font-size: 9.2pt; line-height: 1.35; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 19. THE MONOLITH
  if (template.id === "the-monolith") {
    return `
      .page { padding: 0.7in; }
      header { text-align: center; margin-bottom: 16px; }
      h1 { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 700; color: #111827; text-align: center; margin-bottom: 0; }
      .gold-accent-divider { width: 40px; height: 2px; background: #d97706; margin: 8px auto 12px; }
      .contact { justify-content: center; font-size: 9pt; color: #374151; }
      .contact span:not(:last-child)::after { content: "•"; color: #d97706; margin: 0 8px; }
      h2 {
        font-family: 'Playfair Display', serif;
        font-size: 12pt;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #111827;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 3px;
        margin-bottom: 8px;
        text-align: center;
      }
      section.block { margin-bottom: 18px; }
      .entry-main { font-weight: 600; color: #111827; font-size: 10.5pt; }
      .entry-date { font-size: 9pt; color: #d97706; }
      li { font-size: 9.5pt; line-height: 1.45; color: #374151; }
      li::marker { color: #d97706; }
    `;
  }

  // 20. BAIN STRATEGIC
  if (template.id === "bain-strategic") {
    return `
      .page { padding: 0.6in; }
      header { margin-bottom: 12px; }
      h1 { font-family: 'EB Garamond', Garamond, serif; font-size: 22pt; font-weight: 700; color: #18181b; }
      .contact { font-size: 8.8pt; color: #52525b; }
      .contact span:not(:last-child)::after { content: "•"; color: #991b1b; margin: 0 6px; }
      h2 {
        font-family: 'EB Garamond', Garamond, serif;
        font-size: 11pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #991b1b;
        border-bottom: 1.5px solid #991b1b;
        padding-bottom: 2px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 700; color: #18181b; font-size: 10.5pt; }
      .entry-sub { font-weight: 700; font-style: italic; color: #52525b; font-size: 9.5pt; }
      .entry-date { font-size: 8.8pt; color: #991b1b; }
      li { font-size: 9.2pt; line-height: 1.4; color: #18181b; }
      li::marker { color: #991b1b; }
    `;
  }

  // 21. OXFORD SCHOLAR
  if (template.id === "oxford-scholar") {
    return `
      .page { padding: 0.75in; }
      header { text-align: center; margin-bottom: 14px; }
      h1 { font-family: 'Cormorant Garamond', serif; font-size: 24pt; font-weight: 600; color: #1c1917; text-align: center; }
      .contact { justify-content: center; font-size: 9pt; color: #1c1917; }
      .contact span:not(:last-child)::after { content: "•"; color: #a8a29e; margin: 0 6px; }
      h2 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 11.5pt;
        font-weight: 600;
        font-variant: small-caps;
        letter-spacing: 0.08em;
        color: #1c1917;
        border-bottom: 1px solid #a8a29e;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #1c1917; font-size: 10.5pt; }
      .entry-date { font-style: italic; color: #78716c; font-size: 9pt; }
      li { font-size: 9.8pt; line-height: 1.45; color: #1c1917; }
      li::marker { color: #78716c; }
    `;
  }

  // 22. APEX DIRECTOR
  if (template.id === "apex-director") {
    return `
      .page { padding: 0.5in 0.55in; }
      header { margin-bottom: 10px; }
      h1 { font-family: 'Merriweather', serif; font-size: 24pt; font-weight: 900; color: #0c0a09; }
      .contact { font-size: 8.5pt; color: #57534e; margin-bottom: 8px; }
      .top-stats-banner { background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 4px; padding: 8px 12px; margin-bottom: 14px; display: flex; justify-content: space-around; font-size: 8.5pt; font-weight: 700; color: #0f766e; }
      h2 {
        font-family: 'Merriweather', serif;
        font-size: 11pt;
        font-weight: 700;
        color: #0c0a09;
        border-bottom: 2px solid #0f766e;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 700; color: #0c0a09; font-size: 10pt; }
      .entry-date { font-weight: 700; color: #0f766e; font-size: 8.5pt; }
      li { font-size: 9.2pt; line-height: 1.4; color: #0c0a09; }
      li::marker { color: #0f766e; }
    `;
  }

  // 23. BOARDROOM CLASSIC
  if (template.id === "boardroom-classic") {
    return `
      .page { padding: 0.65in; }
      header { text-align: center; margin-bottom: 12px; }
      .monogram-box { width: 36px; height: 36px; border: 1px solid #111827; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-family: serif; font-size: 13pt; font-weight: 700; color: #111827; }
      h1 { font-family: 'Libre Baskerville', serif; font-size: 22pt; font-weight: 700; color: #111827; text-align: center; }
      .contact { justify-content: center; font-size: 8.5pt; color: #4b5563; }
      h2 {
        font-family: 'Libre Baskerville', serif;
        font-size: 10.5pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #111827;
        border-top: 1px solid #d1d5db;
        border-bottom: 1px solid #d1d5db;
        padding: 3px 0;
        margin-bottom: 8px;
        text-align: center;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #111827; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #6b7280; }
      li { font-size: 9pt; line-height: 1.4; color: #111827; }
      li::marker { color: #111827; }
    `;
  }

  // 24. METROPOLITAN PARTNER
  if (template.id === "metropolitan-partner") {
    return `
      .page { padding: 0.65in; }
      header { margin-bottom: 12px; }
      h1 { font-family: 'Cinzel', serif; font-size: 22pt; font-weight: 700; letter-spacing: 0.15em; color: #1c1917; }
      .contact { font-size: 8.5pt; color: #57534e; }
      .contact span:not(:last-child)::after { content: "•"; color: #78350f; margin: 0 6px; }
      h2 {
        font-family: 'Cinzel', serif;
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #78350f;
        border-bottom: 1.5px solid #78350f;
        padding-bottom: 3px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 700; color: #78350f; font-size: 9.8pt; }
      .entry-date { font-size: 8.5pt; color: #57534e; }
      li { font-size: 9pt; line-height: 1.4; color: #1c1917; }
      li::marker { color: #78350f; }
    `;
  }

  // 25. SWISS BAUHAUS
  if (template.id === "swiss-bauhaus") {
    return `
      .page { padding: 0.5in; }
      header { margin-bottom: 14px; }
      h1 { font-family: 'Archivo Black', sans-serif; font-size: 28pt; font-weight: 900; color: #000000; letter-spacing: -0.02em; }
      .contact { font-family: monospace; font-size: 8.5pt; color: #000000; }
      .contact span:not(:last-child)::after { content: " / "; color: #000000; margin: 0 6px; font-weight: 700; }
      h2 {
        font-family: 'Archivo Black', sans-serif;
        font-size: 11pt;
        font-weight: 900;
        text-transform: uppercase;
        color: #000000;
        border-bottom: 3px solid #000000;
        padding-bottom: 2px;
        margin-bottom: 10px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 700; color: #000000; font-size: 10pt; }
      .entry-date { font-family: monospace; font-size: 8.5pt; color: #000000; font-weight: 700; }
      li { font-size: 9.2pt; line-height: 1.4; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 26. AMBER HORIZON
  if (template.id === "amber-horizon") {
    return `
      .page { padding: 0.55in; }
      header { margin-bottom: 12px; }
      h1 { font-family: 'Syne', sans-serif; font-size: 24pt; font-weight: 800; color: #18181b; }
      .contact { font-size: 8.5pt; color: #71717a; }
      .contact span:not(:last-child)::after { content: "•"; color: #d97706; margin: 0 6px; }
      h2 {
        font-family: 'Syne', sans-serif;
        font-size: 11pt;
        font-weight: 700;
        color: #d97706;
        border-bottom: 2px solid #d97706;
        padding-bottom: 2px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 16px; }
      .entry-main { font-weight: 600; color: #18181b; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #d97706; }
      li { font-size: 9.2pt; line-height: 1.4; color: #18181b; }
      li::marker { color: #d97706; }
    `;
  }

  // 27. STUDIO EDITORIAL
  if (template.id === "studio-editorial") {
    return `
      .page { padding: 0.6in 0.65in; }
      header { text-align: center; margin-bottom: 14px; }
      h1 { font-family: 'Bodoni Moda', serif; font-size: 30pt; font-weight: 700; font-style: italic; color: #171717; text-align: center; }
      .contact { justify-content: center; font-size: 8.5pt; color: #737373; }
      .contact span:not(:last-child)::after { content: "—"; color: #d4d4d4; margin: 0 8px; }
      h2 {
        font-family: 'Bodoni Moda', serif;
        font-size: 11pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #171717;
        border-bottom: 0.5px solid #d4d4d4;
        padding-bottom: 3px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 18px; }
      .entry-main { font-weight: 500; color: #171717; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #737373; }
      li { font-size: 9pt; line-height: 1.45; color: #171717; }
      li::marker { color: #737373; }
    `;
  }

  // 28. DIGITAL PRODUCT
  if (template.id === "digital-product") {
    return `
      .page { padding: 0.5in; }
      .header-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 14px; background: #f8fafc; }
      h1 { font-family: 'Sora', sans-serif; font-size: 22pt; font-weight: 700; color: #0f172a; }
      .contact { font-size: 8.5pt; color: #64748b; }
      .contact span:not(:last-child)::after { content: "•"; color: #3b82f6; margin: 0 6px; }
      h2 {
        font-family: 'Sora', sans-serif;
        font-size: 10.5pt;
        font-weight: 600;
        color: #3b82f6;
        border-bottom: 1.5px solid #3b82f630;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 14px; }
      .entry-main { font-weight: 600; color: #0f172a; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #3b82f6; }
      li { font-size: 9.2pt; line-height: 1.4; color: #0f172a; }
      li::marker { color: #3b82f6; }
    `;
  }

  // 29. TOKYO MINIMAL
  if (template.id === "tokyo-minimal") {
    return `
      .page { padding: 0.65in; }
      header { margin-bottom: 14px; }
      h1 { font-family: 'Noto Sans', sans-serif; font-size: 20pt; font-weight: 300; letter-spacing: 0.1em; color: #18181b; }
      .contact { font-size: 8pt; color: #71717a; }
      .contact span:not(:last-child)::after { content: "·"; color: #ef4444; margin: 0 6px; }
      .dot-prefix { display: inline-block; width: 5px; height: 5px; background: #ef4444; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
      h2 {
        font-family: 'Noto Sans', sans-serif;
        font-size: 9.5pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #18181b;
        border-bottom: 0.5px solid #f1f5f9;
        padding-bottom: 2px;
        margin-bottom: 6px;
      }
      section.block { margin-bottom: 20px; }
      .entry-main { font-weight: 500; color: #18181b; font-size: 9.5pt; }
      .entry-date { font-size: 8pt; color: #71717a; }
      li { font-size: 8.8pt; line-height: 1.4; color: #18181b; }
      li::marker { color: #ef4444; font-size: 5pt; }
    `;
  }

  // 30. CYBER / TERMINAL
  if (template.id === "cyber-terminal") {
    return `
      .page { padding: 0.4in; border: 1px solid #27272a; margin: 0.2in auto; }
      header { font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; }
      h1 { font-family: 'Space Mono', monospace; font-size: 18pt; font-weight: 700; color: #09090b; }
      .terminal-prompt { color: #16a34a; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
      .contact { font-family: 'JetBrains Mono', monospace; font-size: 8pt; color: #52525b; }
      .contact span:not(:last-child)::after { content: " | "; color: #16a34a; margin: 0 4px; }
      h2 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10pt;
        font-weight: 700;
        color: #09090b;
        background: #f4f4f5;
        padding: 2px 6px;
        margin-bottom: 8px;
        border-left: 3px solid #000000;
      }
      section.block { margin-bottom: 12px; }
      .entry-main { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #09090b; font-size: 9.5pt; }
      .entry-date { font-family: 'JetBrains Mono', monospace; font-size: 8pt; color: #16a34a; }
      li { font-family: 'JetBrains Mono', monospace; font-size: 8.8pt; line-height: 1.35; color: #09090b; }
      li::marker { color: #16a34a; }
    `;
  }

  // 31. NEO-BRUTALIST
  if (template.id === "neo-brutalist") {
    return `
      .page { padding: 0.5in; }
      header { margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 8px; }
      h1 { font-family: 'Public Sans', sans-serif; font-size: 26pt; font-weight: 900; text-transform: uppercase; color: #000000; }
      .contact { font-family: monospace; font-size: 8.5pt; color: #000000; font-weight: 700; }
      .contact span:not(:last-child)::after { content: " ■ "; color: #000000; margin: 0 4px; }
      .section-title-box { border: 2px solid #000000; background: #000000; color: #ffffff; padding: 2px 8px; margin-bottom: 8px; }
      .section-title-box h2 {
        font-family: 'Public Sans', sans-serif;
        font-size: 11pt;
        font-weight: 900;
        text-transform: uppercase;
        color: #ffffff;
        margin: 0;
        border: none;
      }
      section.block { margin-bottom: 14px; }
      .entry-main { font-weight: 800; color: #000000; font-size: 10pt; }
      .entry-date { font-family: monospace; font-weight: 700; color: #000000; font-size: 8.5pt; }
      .skill-tag { display: inline-block; border: 1.5px solid #000000; padding: 2px 6px; font-weight: 700; margin: 2px 4px 2px 0; background: #fef08a; font-size: 8.2pt; }
      li { font-size: 9.2pt; line-height: 1.4; color: #000000; }
      li::marker { color: #000000; }
    `;
  }

  // 32. VANGUARD CREATIVE
  if (template.id === "vanguard-creative") {
    return `
      .page { padding: 0.55in; }
      header { margin-bottom: 12px; }
      h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26pt; font-weight: 900; color: #0f172a; }
      .contact { font-size: 8.5pt; color: #475569; }
      .contact span:not(:last-child)::after { content: "•"; color: #6366f1; margin: 0 6px; }
      .bar-accent { display: inline-block; width: 4px; height: 14px; background: #6366f1; border-radius: 2px; margin-right: 8px; vertical-align: middle; }
      h2 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11pt;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 3px;
        margin-bottom: 8px;
      }
      section.block { margin-bottom: 15px; }
      .entry-main { font-weight: 700; color: #0f172a; font-size: 10pt; }
      .entry-date { font-size: 8.5pt; color: #6366f1; font-weight: 600; }
      li { font-size: 9.2pt; line-height: 1.4; color: #0f172a; }
      li::marker { color: #6366f1; }
    `;
  }

  return "";
}

function headerHtml(doc: ResumeDoc, fallbackName: string, template: ResumeTemplate): string {
  const name = doc.name || fallbackName;
  const contact = doc.contact.length
    ? `<div class="contact">${doc.contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
    : "";
  const intro = doc.intro.length ? `<p class="intro">${escapeHtml(doc.intro.join(" "))}</p>` : "";

  if (template.id === "boardroom-classic") {
    const initials = name
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
    return `<header><div class="monogram-box">${escapeHtml(initials || "CV")}</div><h1>${escapeHtml(name)}</h1>${contact}${intro}</header>`;
  }

  if (template.id === "the-monolith") {
    return `<header><h1>${escapeHtml(name)}</h1><div class="gold-accent-divider"></div>${contact}${intro}</header>`;
  }

  if (template.id === "apex-director") {
    return `<header><h1>${escapeHtml(name)}</h1>${contact}<div class="top-stats-banner"><span>$120M+ P&amp;L Accountability</span><span>•</span><span>250+ Cross-Functional ICs</span><span>•</span><span>99.99% Enterprise Uptime</span></div>${intro}</header>`;
  }

  if (template.id === "standard-wharton") {
    return `<header><h1>${escapeHtml(name)}</h1><div class="contact-framed">${contact}</div>${intro}</header>`;
  }

  if (template.id === "wall-street-elite") {
    const summaryText = doc.intro.length
      ? doc.intro.join(" ")
      : "Quantitative financial advisory professional with deep execution expertise across M&A deal structures, capital markets, and cross-border transactions.";
    return `<header><h1>${escapeHtml(name)}</h1>${contact}<div class="wall-street-summary-box">${escapeHtml(summaryText)}</div></header>`;
  }

  if (template.id === "silicon-mono") {
    const bioText = doc.intro.length
      ? doc.intro.join(" ")
      : "Senior Infrastructure Engineer specializing in distributed nodes, high-throughput systems, and fault-tolerant cloud architecture.";
    return `<header><h1>${escapeHtml(name)}</h1><p class="cli-bio">&gt; ${escapeHtml(bioText)}</p>${contact}</header>`;
  }

  if (template.id === "digital-product") {
    return `<div class="header-card"><h1>${escapeHtml(name)}</h1>${contact}${intro}</div>`;
  }

  return `<header><h1>${escapeHtml(name)}</h1>${contact}${intro}</header>`;
}

function orderSectionsForTemplate(sections: ResumeSection[], _templateId: string): ResumeSection[] {
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

  const cacheKey = `${activeTemplate.id}:${effectiveText.length}:${effectiveName}:${ghostKeywords?.join(",") || ""}:${showXRay}:${isInteractive}:${includeLatex}:${effectiveText.slice(0, 40)}`;
  const cached = htmlRenderCache.get(cacheKey);
  if (cached) return cached;

  const doc = parseResume(effectiveText);
  const header = headerHtml(doc, effectiveName, activeTemplate);

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

  if (activeTemplate.id === "indigo-modern") {
    const aside = orderedSections.filter(isAsideSection);
    const main = orderedSections.filter((section) => !isAsideSection(section));
    body = `<header class="hero-span">${header}</header>
      <div class="grid-split">
        <aside class="side-col">${aside.map((s) => renderSection(s, activeTemplate)).join("")}</aside>
        <main class="main-col">${(main.length ? main : orderedSections).map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</main>
      </div>`;
  } else if (activeTemplate.id === "cobalt-dual") {
    const aside = orderedSections.filter(isAsideSection);
    const main = orderedSections.filter((section) => !isAsideSection(section));
    body = `<div class="rail">
      <div class="rail-header-card">${header}</div>
      <div class="rail-body">${aside.map((s) => renderSection(s, activeTemplate)).join("")}</div>
    </div>
    <div class="main">${(main.length ? main : orderedSections).map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</div>`;
  } else if (activeTemplate.layout === "sidebar") {
    const aside = orderedSections.filter(isAsideSection);
    const main = orderedSections.filter((section) => !isAsideSection(section));
    body = `<div class="rail">${header}${aside.map((s) => renderSection(s, activeTemplate)).join("")}</div>
      <div class="main">${(main.length ? main : orderedSections).map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</div>`;
  } else {
    body = `${header}<div class="main">${orderedSections.map((s) => renderSection(s, activeTemplate)).join("")}${ghostHtml}</div>`;
  }

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

        window.addEventListener('wheel', function(e) {
          if (window.parent && Math.abs(e.deltaY) > 0) {
            window.parent.postMessage({ type: 'RESUME_WHEEL', deltaY: e.deltaY }, '*');
          }
        }, { passive: true });
      })();
    </script>
  `
    : "";

  const googleFontsTag = activeTemplate.googleFonts
    ? `<link rel="stylesheet" href="${fontsHref(activeTemplate.googleFonts)}" />`
    : "";

  const finalHtml = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${escapeHtml(doc.name || fallbackName)} — Resume</title>
<meta name="generator" content="CVFitt ATS Universal Engine" />
<meta name="application-name" content="CVFitt ResumeMatcher" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${googleFontsTag}
<style>${baseCss(activeTemplate)}${layoutCss(activeTemplate)}</style>
</head><body><div class="page">${body}</div>${latexSemanticTag}${heightReporterScript}</body></html>`;

  if (htmlRenderCache.size >= MAX_CACHE_SIZE) {
    const firstKey = htmlRenderCache.keys().next().value;
    if (firstKey) htmlRenderCache.delete(firstKey);
  }
  htmlRenderCache.set(cacheKey, finalHtml);

  return finalHtml;
}
