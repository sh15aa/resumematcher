import type { TailorResult } from "./partial-json";

export type HistoryEntry = {
  id: string;
  createdAt: number;
  title: string;
  tone: string;
  resume: string;
  job: string;
  result: TailorResult;
  coverLetter?: string;
  templateId?: string;
};

const KEY = "resume-tailor:history:v1";
const LIMIT = 40;

function canStore(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadHistory(): HistoryEntry[] {
  if (!canStore()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): HistoryEntry[] {
  if (!canStore()) return entries;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, LIMIT)));
  } catch {
    /* storage full or blocked */
  }
  return entries.slice(0, LIMIT);
}

/** Derive a readable label from the job posting text. */
export function deriveTitle(job: string): string {
  const firstLine = job
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 2);
  if (!firstLine) return "Untitled role";
  return firstLine.length > 70 ? `${firstLine.slice(0, 67)}…` : firstLine;
}

export function saveEntry(entry: HistoryEntry): HistoryEntry[] {
  return persist([entry, ...loadHistory().filter((item) => item.id !== entry.id)]);
}

export function updateEntry(id: string, patch: Partial<HistoryEntry>): HistoryEntry[] {
  return persist(loadHistory().map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

export function deleteEntry(id: string): HistoryEntry[] {
  return persist(loadHistory().filter((item) => item.id !== id));
}

export function clearHistory(): HistoryEntry[] {
  return persist([]);
}

export function formatWhen(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
