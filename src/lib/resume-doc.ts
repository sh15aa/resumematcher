/** Parse a plain-text resume into a light structured document for templating. */

export type ResumeBlock = { kind: "entry"; text: string } | { kind: "bullet"; text: string };

export type ResumeSection = {
  title: string;
  blocks: ResumeBlock[];
};

export type ResumeDoc = {
  name: string;
  contact: string[];
  intro: string[];
  sections: ResumeSection[];
};

const BULLET_RE = /^\s*(?:[-*•‣–—]|\d+[.)])\s+/;

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 65) return false;
  if (BULLET_RE.test(trimmed)) return false;
  const clean = trimmed.replace(/:$/, "").trim();
  const letters = clean.replace(/[^A-Za-z]/g, "");
  if (letters.length < 2) return false;
  const upper = clean.replace(/[^A-Z]/g, "");
  if (upper.length / letters.length > 0.82) return true;
  return (
    /^[A-Z][A-Za-z0-9 /&,-]+:?$/.test(trimmed) && trimmed.length <= 45 && !trimmed.includes(". ")
  );
}

function looksLikeContact(line: string): boolean {
  return /@|\+?\d[\d\s().-]{6,}|linkedin|github|https?:\/\/|www\./i.test(line);
}

export function parseResume(raw: string): ResumeDoc {
  const lines = raw.replace(/\r/g, "").split("\n");
  const doc: ResumeDoc = { name: "", contact: [], intro: [], sections: [] };

  const COMMON_SECTION_TITLES =
    /^(?:summary|profile|about|objective|experience|work|employment|career|history|education|skills|technical skills|projects|certifications|awards|contact|contact information)$/i;

  let index = 0;
  while (index < lines.length && !lines[index]!.trim()) index += 1;
  if (index < lines.length) {
    const firstTrimmed = lines[index]!.trim();
    if (!COMMON_SECTION_TITLES.test(firstTrimmed.replace(/:$/, ""))) {
      doc.name = firstTrimmed;
      index += 1;
    }
  }

  let current: ResumeSection | null = null;

  for (; index < lines.length; index += 1) {
    const line = lines[index]!;
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isHeading(trimmed)) {
      current = { title: trimmed.replace(/:$/, "").trim(), blocks: [] };
      doc.sections.push(current);
      continue;
    }

    if (!current) {
      if (looksLikeContact(trimmed)) {
        for (const piece of trimmed.split(/\s*[|•·]\s*/)) {
          if (piece.trim()) doc.contact.push(piece.trim());
        }
      } else {
        doc.intro.push(trimmed);
      }
      continue;
    }

    if (BULLET_RE.test(trimmed)) {
      current.blocks.push({ kind: "bullet", text: trimmed.replace(BULLET_RE, "").trim() });
    } else {
      current.blocks.push({ kind: "entry", text: trimmed });
    }
  }

  if (doc.name.toUpperCase() === "CANDIDATE NAME") {
    doc.name = "";
  }

  doc.sections = doc.sections.filter((s) => {
    const t = s.title.toUpperCase().trim();
    if (t === "CANDIDATE NAME") return false;
    if (doc.name && t === doc.name.toUpperCase().trim()) return false;
    return true;
  });

  return doc;
}

const ASIDE_HINTS = [
  "skill",
  "education",
  "certification",
  "language",
  "tool",
  "technolog",
  "award",
  "interest",
  "contact",
  "profile link",
  "course",
];

export function isAsideSection(section: ResumeSection): boolean {
  const title = section.title.toLowerCase();
  return ASIDE_HINTS.some((hint) => title.includes(hint));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
