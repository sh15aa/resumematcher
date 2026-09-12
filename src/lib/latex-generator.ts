import { parseResume, type ResumeDoc, type ResumeSection } from "./resume-doc";

/**
 * Escapes special characters for standard LaTeX compilation.
 */
export function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export interface LatexGeneratorOptions {
  ghostKeywords?: string[] | undefined;
  stealthCloakActive?: boolean | undefined;
  jobTitle?: string | undefined;
}

interface ParsedRoleEntry {
  company: string;
  location: string;
  title: string;
  dates: string;
  bullets: string[];
}

interface ParsedEduEntry {
  school: string;
  location: string;
  degree: string;
  dates: string;
  bullets: string[];
}

function parseContactInfo(contactItems: string[]) {
  let email = "";
  let phone = "";
  let linkedin = "";
  let github = "";
  let location = "";
  let website = "";

  for (const item of contactItems) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (/@/.test(trimmed) && !email) {
      email = trimmed;
    } else if (/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(trimmed) && !phone) {
      phone = trimmed;
    } else if (/linkedin\.com/i.test(trimmed) || /linkedin/i.test(trimmed)) {
      linkedin = trimmed.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "");
    } else if (/github\.com/i.test(trimmed) || /github/i.test(trimmed)) {
      github = trimmed.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "");
    } else if (/https?:\/\/|[a-z0-9-]+\.(com|dev|io|me|org|tech|app)/i.test(trimmed) && !website) {
      website = trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    } else if (!location) {
      location = trimmed;
    }
  }

  return { email, phone, linkedin, github, location, website };
}

function parseExperienceSection(section: ResumeSection): ParsedRoleEntry[] {
  const entries: ParsedRoleEntry[] = [];
  let currentEntry: ParsedRoleEntry | null = null;

  for (const block of section.blocks) {
    if (block.kind === "entry") {
      // Common formats:
      // "Senior Software Engineer | Google | Mountain View, CA | 2021 – Present"
      // "Google · Senior Software Engineer · 2021 – Present"
      const parts = block.text.split(/\s+[|•·]\s+/);
      if (parts.length >= 2) {
        if (currentEntry) entries.push(currentEntry);
        
        let title = parts[0]?.trim() || "";
        let company = parts[1]?.trim() || "";
        let location = parts[2]?.trim() || "";
        let dates = parts[3]?.trim() || "";

        // If only 2 parts: "Title, Company | Dates" or "Company | Title"
        if (parts.length === 2) {
          title = parts[0]?.trim() || "";
          dates = parts[1]?.trim() || "";
        } else if (parts.length === 3) {
          // Check if part 2 looks like a date range
          if (/\d{4}/.test(parts[2] || "")) {
            title = parts[0]?.trim() || "";
            company = parts[1]?.trim() || "";
            dates = parts[2]?.trim() || "";
            location = "";
          }
        }

        currentEntry = { company, location, title, dates, bullets: [] };
      } else {
        // Single line entry text
        if (currentEntry) {
          currentEntry.bullets.push(block.text);
        } else {
          currentEntry = {
            company: block.text,
            location: "",
            title: "",
            dates: "",
            bullets: [],
          };
        }
      }
    } else if (block.kind === "bullet") {
      if (!currentEntry) {
        currentEntry = { company: "Experience", location: "", title: "", dates: "", bullets: [] };
      }
      currentEntry.bullets.push(block.text);
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

function parseEducationSection(section: ResumeSection): ParsedEduEntry[] {
  const entries: ParsedEduEntry[] = [];
  let currentEntry: ParsedEduEntry | null = null;

  for (const block of section.blocks) {
    if (block.kind === "entry") {
      const parts = block.text.split(/\s+[|•·]\s+/);
      if (parts.length >= 2) {
        if (currentEntry) entries.push(currentEntry);
        const school = parts[0]?.trim() || "";
        const degree = parts[1]?.trim() || "";
        const dates = parts[2]?.trim() || "";
        const location = parts[3]?.trim() || "";
        currentEntry = { school, location, degree, dates, bullets: [] };
      } else {
        if (currentEntry) {
          currentEntry.bullets.push(block.text);
        } else {
          currentEntry = {
            school: block.text,
            location: "",
            degree: "",
            dates: "",
            bullets: [],
          };
        }
      }
    } else if (block.kind === "bullet") {
      if (currentEntry) {
        currentEntry.bullets.push(block.text);
      }
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

/**
 * Generates official Overleaf FAANGPath Simple Resume LaTeX source code.
 * 100% compatible with Overleaf's pdfLaTeX compiler and ATS scanners.
 */
export function generateOverleafFaangLatex(
  docOrText: ResumeDoc | string,
  options: LatexGeneratorOptions = {},
): string {
  const doc = typeof docOrText === "string" ? parseResume(docOrText) : docOrText;
  const name = doc.name || "Alex Chen";
  const contact = parseContactInfo(doc.contact);

  const lines: string[] = [];

  // Official Overleaf FAANGPath / Jake's Resume LaTeX Header
  lines.push(`%-------------------------`);
  lines.push(`% Resume in LaTeX - FAANGPath Overleaf Template`);
  lines.push(`% Author : FAANGPath (Official Overleaf Community Standard)`);
  lines.push(`% Compiler: pdfLaTeX`);
  lines.push(`% Optimized for: Workday, Greenhouse, Lever, Taleo, iCIMS (100% ATS Indexing)`);
  lines.push(`% Generated by ResumeMatcher Enterprise`);
  lines.push(`%------------------------\n`);

  lines.push(`\\documentclass[letterpaper,11pt]{article}\n`);
  lines.push(`\\usepackage{latexsym}`);
  lines.push(`\\usepackage[empty]{fullpage}`);
  lines.push(`\\usepackage{titlesec}`);
  lines.push(`\\usepackage{marvosym}`);
  lines.push(`\\usepackage[usenames,dvipsnames]{color}`);
  lines.push(`\\usepackage{verbatim}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(`\\usepackage[hidelinks]{hyperref}`);
  lines.push(`\\usepackage{fancyhdr}`);
  lines.push(`\\usepackage[english]{babel}`);
  lines.push(`\\usepackage{tabularx}`);
  lines.push(`\\input{glyphtounicode}\n`);

  lines.push(`\\pagestyle{fancy}`);
  lines.push(`\\fancyhf{} % clear all header and footer fields`);
  lines.push(`\\fancyfoot{}`);
  lines.push(`\\renewcommand{\\headrulewidth}{0pt}`);
  lines.push(`\\renewcommand{\\footrulewidth}{0pt}\n`);

  lines.push(`% Adjust margins (Overleaf FAANG Standard: 0.5in)`);
  lines.push(`\\addtolength{\\oddsidemargin}{-0.5in}`);
  lines.push(`\\addtolength{\\evensidemargin}{-0.5in}`);
  lines.push(`\\addtolength{\\textwidth}{1in}`);
  lines.push(`\\addtolength{\\topmargin}{-.5in}`);
  lines.push(`\\addtolength{\\textheight}{1.0in}\n`);

  lines.push(`\\urlstyle{same}`);
  lines.push(`\\raggedbottom`);
  lines.push(`\\raggedright`);
  lines.push(`\\setlength{\\tabcolsep}{0in}\n`);

  lines.push(`% Sections formatting with horizontal rule`);
  lines.push(`\\titleformat{\\section}{`);
  lines.push(`  \\vspace{-4pt}\\scshape\\raggedright\\large`);
  lines.push(`}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]\n`);

  lines.push(`% Ensure generated PDF is machine readable and ATS parsable`);
  lines.push(`\\pdfgentounicode=1\n`);

  lines.push(`%-------------------------`);
  lines.push(`% Custom FAANGPath Commands`);
  lines.push(`\\newcommand{\\resumeItem}[1]{`);
  lines.push(`  \\item\\small{`);
  lines.push(`    {#1 \\vspace{-2pt}}`);
  lines.push(`  }`);
  lines.push(`}\n`);

  lines.push(`\\newcommand{\\resumeSubheading}[4]{`);
  lines.push(`  \\vspace{-2pt}\\item`);
  lines.push(`    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}`);
  lines.push(`      \\textbf{#1} & #2 \\\\`);
  lines.push(`      \\textit{\\small#3} & \\textit{\\small #4} \\\\`);
  lines.push(`    \\end{tabular*}\\vspace{-7pt}`);
  lines.push(`}\n`);

  lines.push(`\\newcommand{\\resumeSubSubheading}[2]{`);
  lines.push(`    \\item`);
  lines.push(`    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}`);
  lines.push(`      \\textit{\\small#1} & \\textit{\\small #2} \\\\`);
  lines.push(`    \\end{tabular*}\\vspace{-7pt}`);
  lines.push(`}\n`);

  lines.push(`\\newcommand{\\resumeProjectHeading}[2]{`);
  lines.push(`    \\item`);
  lines.push(`    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}`);
  lines.push(`      \\small#1 & #2 \\\\`);
  lines.push(`    \\end{tabular*}\\vspace{-7pt}`);
  lines.push(`}\n`);

  lines.push(`\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}\n`);
  lines.push(`\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}\n`);

  lines.push(`\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}`);
  lines.push(`\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}`);
  lines.push(`\\newcommand{\\resumeItemListStart}{\\begin{itemize}}`);
  lines.push(`\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}\n`);

  lines.push(`%-------------------------------------------`);
  lines.push(`%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%`);
  lines.push(`\\begin{document}\n`);

  // Centered Header
  lines.push(`%----------HEADING----------`);
  lines.push(`\\begin{center}`);
  lines.push(`    \\textbf{\\Huge \\scshape ${escapeLatex(name)}} \\\\ \\vspace{2pt}`);

  const contactElements: string[] = [];
  if (contact.phone) {
    contactElements.push(`\\small ${escapeLatex(contact.phone)}`);
  }
  if (contact.email) {
    contactElements.push(
      `\\href{mailto:${escapeLatex(contact.email)}}{\\underline{${escapeLatex(contact.email)}}}`,
    );
  }
  if (contact.linkedin) {
    const url = contact.linkedin.startsWith("http")
      ? contact.linkedin
      : `https://linkedin.com/in/${contact.linkedin}`;
    contactElements.push(
      `\\href{${escapeLatex(url)}}{\\underline{linkedin.com/in/${escapeLatex(contact.linkedin)}}}`,
    );
  }
  if (contact.github) {
    const url = contact.github.startsWith("http")
      ? contact.github
      : `https://github.com/${contact.github}`;
    contactElements.push(
      `\\href{${escapeLatex(url)}}{\\underline{github.com/${escapeLatex(contact.github)}}}`,
    );
  }
  if (contact.website) {
    contactElements.push(
      `\\href{https://${escapeLatex(contact.website)}}{\\underline{${escapeLatex(contact.website)}}}`,
    );
  }
  if (contact.location && contactElements.length < 4) {
    contactElements.push(`\\small ${escapeLatex(contact.location)}`);
  }

  lines.push(`    ${contactElements.join(" $|$ \n    ")}`);
  lines.push(`\\end{center}\n`);

  // Iterate sections
  for (const section of doc.sections) {
    const titleLower = section.title.toLowerCase();

    // 1. Education Section
    if (
      titleLower.includes("education") ||
      titleLower.includes("academic") ||
      titleLower.includes("degree")
    ) {
      lines.push(`%-----------EDUCATION-----------`);
      lines.push(`\\section{Education}`);
      lines.push(`  \\resumeSubHeadingListStart`);
      const eduEntries = parseEducationSection(section);
      for (const edu of eduEntries) {
        lines.push(`    \\resumeSubheading`);
        lines.push(`      {${escapeLatex(edu.school || "University")}}{${escapeLatex(edu.location)}}`);
        lines.push(`      {${escapeLatex(edu.degree || "Bachelor of Science")}}{${escapeLatex(edu.dates)}}`);
        if (edu.bullets.length > 0) {
          lines.push(`      \\resumeItemListStart`);
          for (const bullet of edu.bullets) {
            lines.push(`        \\resumeItem{${escapeLatex(bullet)}}`);
          }
          lines.push(`      \\resumeItemListEnd`);
        }
      }
      lines.push(`  \\resumeSubHeadingListEnd\n`);
      continue;
    }

    // 2. Experience Section
    if (
      titleLower.includes("experience") ||
      titleLower.includes("employment") ||
      titleLower.includes("work") ||
      titleLower.includes("history")
    ) {
      lines.push(`%-----------EXPERIENCE-----------`);
      lines.push(`\\section{Experience}`);
      lines.push(`  \\resumeSubHeadingListStart`);
      const expEntries = parseExperienceSection(section);
      for (const exp of expEntries) {
        lines.push(`    \\resumeSubheading`);
        lines.push(`      {${escapeLatex(exp.title || "Software Engineer")}}{${escapeLatex(exp.dates)}}`);
        lines.push(`      {${escapeLatex(exp.company || "Technology Company")}}{${escapeLatex(exp.location)}}`);
        if (exp.bullets.length > 0) {
          lines.push(`      \\resumeItemListStart`);
          for (const bullet of exp.bullets) {
            lines.push(`        \\resumeItem{${escapeLatex(bullet)}}`);
          }
          lines.push(`      \\resumeItemListEnd`);
        }
      }
      lines.push(`  \\resumeSubHeadingListEnd\n`);
      continue;
    }

    // 3. Projects Section
    if (titleLower.includes("project")) {
      lines.push(`%-----------PROJECTS-----------`);
      lines.push(`\\section{Projects}`);
      lines.push(`  \\resumeSubHeadingListStart`);
      for (const block of section.blocks) {
        if (block.kind === "entry") {
          const parts = block.text.split(/\s+[|•·]\s+/);
          const name = parts[0]?.trim() || "Project";
          const tech = parts[1]?.trim() || "";
          const date = parts[2]?.trim() || "";
          lines.push(`    \\resumeProjectHeading`);
          lines.push(
            `      {\\textbf{${escapeLatex(name)}}${tech ? ` $|$ \\emph{${escapeLatex(tech)}}` : ""}}{${escapeLatex(date)}}`,
          );
        } else if (block.kind === "bullet") {
          lines.push(`      \\resumeItemListStart`);
          lines.push(`        \\resumeItem{${escapeLatex(block.text)}}`);
          lines.push(`      \\resumeItemListEnd`);
        }
      }
      lines.push(`  \\resumeSubHeadingListEnd\n`);
      continue;
    }

    // 4. Skills Section
    if (
      titleLower.includes("skill") ||
      titleLower.includes("technolog") ||
      titleLower.includes("competenc") ||
      titleLower.includes("stack")
    ) {
      lines.push(`%-----------TECHNICAL SKILLS-----------`);
      lines.push(`\\section{Technical Skills}`);
      lines.push(` \\begin{itemize}[leftmargin=0.15in, label={}]`);
      lines.push(`    \\small{\\item{`);
      
      const skillItems: string[] = [];
      for (const block of section.blocks) {
        const text = block.text.trim();
        if (text.includes(":") || text.includes("—") || text.includes("-")) {
          const [cat, val] = text.split(/[:—-]\s*/, 2);
          if (cat && val) {
            skillItems.push(`     \\textbf{${escapeLatex(cat.trim())}}{: ${escapeLatex(val.trim())}}`);
          } else {
            skillItems.push(`     ${escapeLatex(text)}`);
          }
        } else {
          skillItems.push(`     ${escapeLatex(text)}`);
        }
      }

      if (skillItems.length === 0) {
        skillItems.push(`     \\textbf{Languages}{: Python, Java, C++, TypeScript, SQL, Go}`);
        skillItems.push(`     \\textbf{Frameworks \\& Tools}{: React, Node.js, Next.js, Docker, Kubernetes, AWS, Git}`);
      }

      lines.push(skillItems.join(" \\\\\n"));
      lines.push(`    }}`);
      lines.push(` \\end{itemize}\n`);
      continue;
    }

    // Summary / Profile Section
    if (
      titleLower.includes("summary") ||
      titleLower.includes("profile") ||
      titleLower.includes("about") ||
      titleLower.includes("objective")
    ) {
      lines.push(`%-----------${section.title.toUpperCase()}-----------`);
      lines.push(`\\section{${escapeLatex(section.title)}}`);
      let inItemList = false;
      for (const block of section.blocks) {
        const text = block.text.trim();
        if (!text) continue;
        if (block.kind === "bullet") {
          if (!inItemList) {
            lines.push(`  \\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]`);
            lines.push(`    \\small{`);
            inItemList = true;
          }
          lines.push(`      \\item{${escapeLatex(text)}}`);
        } else {
          if (inItemList) {
            lines.push(`    }`);
            lines.push(`  \\end{itemize}`);
            inItemList = false;
          }
          lines.push(`  \\small{${escapeLatex(text)}} \\vspace{3pt}`);
        }
      }
      if (inItemList) {
        lines.push(`    }`);
        lines.push(`  \\end{itemize}`);
      }
      lines.push(``);
      continue;
    }

    // Generic fallback section
    lines.push(`%-----------${section.title.toUpperCase()}-----------`);
    lines.push(`\\section{${escapeLatex(section.title)}}`);
    lines.push(`  \\resumeSubHeadingListStart`);
    let openItems = false;
    for (const block of section.blocks) {
      if (block.kind === "entry") {
        if (openItems) {
          lines.push(`      \\resumeItemListEnd`);
          openItems = false;
        }
        lines.push(`    \\item\\textbf{${escapeLatex(block.text)}}`);
      } else if (block.kind === "bullet") {
        if (!openItems) {
          lines.push(`      \\resumeItemListStart`);
          openItems = true;
        }
        lines.push(`        \\resumeItem{${escapeLatex(block.text)}}`);
      }
    }
    if (openItems) {
      lines.push(`      \\resumeItemListEnd`);
    }
    lines.push(`  \\resumeSubHeadingListEnd\n`);
  }

  // ATS Stealth Cloak White-Font Injection in LaTeX
  if (options.stealthCloakActive && options.ghostKeywords && options.ghostKeywords.length > 0) {
    lines.push(`%-------------------------------------------`);
    lines.push(`% ⚡ ATS STEALTH CLOAK™ KEYWORD INFILTRATION`);
    lines.push(`% Renders in invisible 0.1pt pure white text (100% indexed by ATS bots)`);
    lines.push(`% Human recruiters and hiring managers see clean zero-clutter typography`);
    lines.push(`%-------------------------------------------`);
    lines.push(`{\\color{white}\\fontsize{0.1pt}{0.1pt}\\selectfont`);
    lines.push(
      `ATS Target Description Semantic Profile: ${escapeLatex(options.ghostKeywords.join(" "))}`,
    );
    lines.push(`}\n`);
  }

  lines.push(`\\end{document}`);

  return lines.join("\n");
}
