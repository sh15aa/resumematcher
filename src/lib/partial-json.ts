/** Extract a (possibly incomplete) JSON string field from a streaming JSON document. */
export function extractPartialString(raw: string, key: string): string {
  const marker = `"${key}"`;
  const keyAt = raw.indexOf(marker);
  if (keyAt === -1) return "";
  const quoteAt = raw.indexOf('"', raw.indexOf(":", keyAt + marker.length) + 1);
  if (quoteAt === -1) return "";

  let out = "";
  for (let i = quoteAt + 1; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "\\") {
      const next = raw[i + 1];
      if (next === undefined) break;
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "";
      else if (next === "u") {
        const hex = raw.slice(i + 2, i + 6);
        if (hex.length < 4) break;
        out += String.fromCharCode(parseInt(hex, 16));
        i += 4;
      } else out += next;
      i += 1;
      continue;
    }
    if (ch === '"') break;
    out += ch;
  }
  return out;
}

export type KeywordFix = {
  keyword: string;
  original_snippet: string;
  suggestion: string;
};

export type TailorResult = {
  tailored_resume: string;
  match_score: number;
  changes: string[];
  missing_keywords: string[];
  keyword_fixes: KeywordFix[];
  ghost_keywords?: string[];
  all_keywords?: string[];
};

function parseFixes(value: unknown): KeywordFix[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      keyword: typeof item["keyword"] === "string" ? item["keyword"] : "",
      original_snippet:
        typeof item["original_snippet"] === "string" ? item["original_snippet"] : "",
      suggestion: typeof item["suggestion"] === "string" ? item["suggestion"] : "",
    }))
    .filter((fix) => fix.keyword && fix.suggestion);
}

export function parseTailorResult(raw: string): TailorResult | null {
  try {
    const parsed = JSON.parse(raw) as Partial<TailorResult>;
    if (typeof parsed?.tailored_resume !== "string") return null;
    return {
      tailored_resume: parsed.tailored_resume,
      match_score: Math.max(0, Math.min(100, Math.round(Number(parsed.match_score) || 0))),
      changes: Array.isArray(parsed.changes)
        ? parsed.changes.filter((c) => typeof c === "string")
        : [],
      missing_keywords: Array.isArray(parsed.missing_keywords)
        ? parsed.missing_keywords.filter((k) => typeof k === "string")
        : [],
      keyword_fixes: parseFixes(parsed.keyword_fixes),
      ghost_keywords: Array.isArray(parsed.ghost_keywords)
        ? parsed.ghost_keywords.filter((k) => typeof k === "string")
        : [],
      all_keywords: Array.isArray(parsed.all_keywords)
        ? parsed.all_keywords.filter((k) => typeof k === "string")
        : [],
    };
  } catch {
    return null;
  }
}
