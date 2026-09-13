import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { streamAiText, textStreamResponse } from "@/lib/gateway.server";
import { createTailorStreamResponse, generateTailoredResult } from "@/lib/matcher-engine";

const BodySchema = z.object({
  resume: z.string().min(1).max(30000),
  job: z.string().min(1).max(30000),
  tone: z.enum(["concise", "impact", "formal"]),
});

const TONE_HINT: Record<string, string> = {
  concise: "Tight, short bullets. Cut filler words. Prefer 1 line per bullet.",
  impact: "Lead each bullet with a strong action verb and a measurable outcome.",
  formal: "Professional, restrained register suitable for corporate and academic roles.",
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    tailored_resume: {
      type: "string",
      description: "The full rewritten resume as plain text with clear section headers.",
    },
    match_score: {
      type: "integer",
      description: "0-100 fit of the tailored resume to the posting.",
    },
    changes: {
      type: "array",
      description: "Short bullets describing what was changed and why.",
      items: { type: "string" },
    },
    missing_keywords: {
      type: "array",
      description: "Important posting keywords the resume still does not evidence.",
      items: { type: "string" },
    },
    keyword_fixes: {
      type: "array",
      description:
        "Inline suggestions. Each item points at an exact verbatim snippet copied from the ORIGINAL resume that " +
        "should be reworded to cover a posting keyword, plus the replacement wording.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          keyword: { type: "string", description: "The posting keyword or skill this addresses." },
          original_snippet: {
            type: "string",
            description:
              "An exact, character-for-character substring of the ORIGINAL resume (one sentence or bullet, " +
              "under 200 characters) that should be replaced. Must appear verbatim in the original resume.",
          },
          suggestion: { type: "string", description: "The replacement wording for that snippet." },
        },
        required: ["keyword", "original_snippet", "suggestion"],
      },
    },
  },
  required: ["tailored_resume", "match_score", "changes", "missing_keywords", "keyword_fixes"],
} as const;

export const Route = createFileRoute("/api/tailor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return Response.json(
            { error: "Please paste both your resume and the job posting." },
            { status: 400 },
          );
        }

        const systemPrompt = `You are an elite executive resume architect and ATS optimization specialist.
CRITICAL SHORTLISTING MANDATE: You MUST identify and extract all primary technical skills, frameworks, tools, and competencies explicitly requested in the target job posting. The tailored resume's 'TECHNICAL SKILLS' section and 'WORK EXPERIENCE' bullet points MUST contain these EXACT verbatim keywords seamlessly woven into achievements and metrics so automated applicant tracking systems (Workday, Greenhouse, Lever, Taleo) immediately score 95%+ and shortlist the candidate.
1. TECHNICAL SKILLS: Prominently feature the exact keywords from the posting, organized into categorized lines (e.g. Languages, Frameworks, Cloud, Databases, Tools).
2. WORK EXPERIENCE: Weave these exact keywords directly into the candidate's accomplishment bullets alongside strong action verbs and quantified impact (% latency reduced, $ saved, team/system scale), retaining the candidate's truthful history while mirroring the exact phrasing of the job description.
3. Section format: Output plain text with standard UPPERCASE section headers (PROFESSIONAL SUMMARY, TECHNICAL SKILLS, WORK EXPERIENCE, EDUCATION, KEY PROJECTS) and '- ' bullets. No markdown formatting (no **, no ##).
4. For keyword_fixes, provide 3-8 actionable inline suggestions: each original_snippet MUST be copied verbatim from the ORIGINAL resume text so it can be highlighted in place, paired with the targeted keyword and upgraded suggestion.
${TONE_HINT[body.tone]}

You MUST output ONLY a valid JSON object matching this structure:
{
  "tailored_resume": "The full rewritten resume as plain text with clear section headers",
  "match_score": 95,
  "changes": ["Short bullets describing what was changed and why"],
  "missing_keywords": ["Important posting keywords the resume still does not evidence"],
  "keyword_fixes": [
    {
      "keyword": "The posting keyword",
      "original_snippet": "Exact character-for-character substring of the ORIGINAL resume",
      "suggestion": "The replacement wording for that snippet"
    }
  ]
}`;

        const userPrompt = `JOB POSTING:\n${body.job}\n\nCURRENT RESUME:\n${body.resume}`;

        try {
          const result = await streamAiText({
            systemPrompt,
            userPrompt,
            isJson: true,
          });

          if (result.ok) {
            return textStreamResponse(result.stream);
          }
        } catch {
          // Fall back to built-in matcher engine
        }

        // Built-in intelligent ATS Resume Matcher & Tailor Engine
        const result = generateTailoredResult(body);
        return createTailorStreamResponse(result);
      },
    },
  },
});
