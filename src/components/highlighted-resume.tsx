import type { KeywordFix } from "@/lib/partial-json";

type Piece = { text: string; fix?: KeywordFix };

/** Split the original resume into plain and highlighted pieces using the AI's snippets. */
export function splitByFixes(resume: string, fixes: KeywordFix[]): Piece[] {
  const marks: { start: number; end: number; fix: KeywordFix }[] = [];
  const lower = resume.toLowerCase();

  for (const fix of fixes) {
    const snippet = fix.original_snippet?.trim();
    if (!snippet || snippet.length < 6) continue;
    let start = resume.indexOf(snippet);
    if (start === -1) start = lower.indexOf(snippet.toLowerCase());
    if (start === -1) continue;
    const end = start + snippet.length;
    if (marks.some((mark) => start < mark.end && end > mark.start)) continue;
    marks.push({ start, end, fix });
  }

  marks.sort((a, b) => a.start - b.start);

  const pieces: Piece[] = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.start > cursor) pieces.push({ text: resume.slice(cursor, mark.start) });
    pieces.push({ text: resume.slice(mark.start, mark.end), fix: mark.fix });
    cursor = mark.end;
  }
  if (cursor < resume.length) pieces.push({ text: resume.slice(cursor) });
  return pieces;
}

export function HighlightedResume({
  resume,
  fixes,
  onApply,
}: {
  resume: string;
  fixes: KeywordFix[];
  onApply: (fix: KeywordFix) => void;
}) {
  const pieces = splitByFixes(resume, fixes);
  const matched = pieces.filter((piece) => piece.fix).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {matched > 0
          ? `${matched} place${matched === 1 ? "" : "s"} in your original resume could carry a keyword from this posting. Click a highlight to swap in the suggested wording.`
          : "No inline gaps were found in your original wording for this posting."}
      </p>

      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-card px-5 py-4 font-sans text-sm leading-7 text-foreground">
        {pieces.map((piece, index) =>
          piece.fix ? (
            <button
              key={index}
              type="button"
              title={`${piece.fix.keyword}: ${piece.fix.suggestion}`}
              onClick={() => onApply(piece.fix!)}
              className="cursor-pointer rounded bg-primary/15 px-0.5 text-left underline decoration-primary/50 decoration-dotted underline-offset-4 hover:bg-primary/25"
            >
              {piece.text}
            </button>
          ) : (
            <span key={index}>{piece.text}</span>
          ),
        )}
      </pre>

      {fixes.length > 0 && (
        <ul className="space-y-3">
          {fixes.map((fix) => (
            <li
              key={`${fix.keyword}-${fix.suggestion}`}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {fix.keyword}
              </p>
              {fix.original_snippet && (
                <p className="mt-2 text-sm text-muted-foreground line-through">
                  {fix.original_snippet}
                </p>
              )}
              <p className="mt-1 text-sm text-foreground">{fix.suggestion}</p>
              <button
                type="button"
                onClick={() => onApply(fix)}
                className="mt-3 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                Apply to my resume
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
