# Resume Tailor

A single-page tool: paste your resume and a job posting, get an AI-rewritten resume tailored to that role.

## The page (/)

One screen, two-column on desktop, stacked on mobile:

1. **Inputs** — two large textareas: "Your resume" and "Job posting". A tone/style selector (Concise, Impact-driven, Formal) and a "Tailor my resume" button. Button disabled until both fields have content.
2. **Result** — streams in live as the AI writes, so you see progress instead of a spinner:
   - Tailored resume in clean, copyable plain-text sections
   - A short "What changed" list (keywords added, reordered emphasis, gaps to address)
   - A match score (0-100) with the top missing keywords
   - Copy-to-clipboard and download-as-.txt buttons

Empty state explains what to paste; errors (rate limit, credits, empty output) show as clear inline messages, never a blank result.

## How it works

- Everything stays in the browser session — no accounts, no database, nothing stored.
- The rewrite runs server-side through Lovable AI so no key is ever exposed.
- Streaming output means long resumes don't time out.

## Design direction

Editorial, document-like feel: warm off-white paper background, deep ink text, a single confident accent for actions, generous line-height, serif display headings paired with a clean sans for body. No purple gradients.

## Technical notes

- `src/routes/index.tsx` replaces the placeholder with the whole tool.
- Streaming endpoint at `src/routes/api/tailor.ts` using the Lovable AI Gateway Responses API (`openai/gpt-5.6-sol`, streaming required), reading `LOVABLE_API_KEY` inside the handler only.
- Structured result (tailored resume, change list, score, missing keywords) via a strict JSON schema, streamed and parsed progressively on the client.
- Client state with `useState` + a fetch reader; no persistence layer.
- SEO head() on the index route with a real title/description/og tags.
