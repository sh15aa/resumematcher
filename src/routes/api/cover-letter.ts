import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { callGateway, textStreamResponse } from "@/lib/gateway.server";
import { createCoverLetterStreamResponse, generateCoverLetter } from "@/lib/matcher-engine";

const BodySchema = z.object({
  resume: z.string().min(1).max(30000),
  job: z.string().min(1).max(30000),
  tone: z.enum(["concise", "impact", "formal"]),
  applicant: z.string().max(120).optional(),
});

const TONE_HINT: Record<string, string> = {
  concise: "Short and direct. Three tight paragraphs, no filler.",
  impact: "Lead with outcomes and numbers drawn from the resume.",
  formal: "Professional and restrained, suitable for corporate or academic hiring.",
};

export const Route = createFileRoute("/api/cover-letter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return Response.json(
            { error: "Tailor your resume first, then write the letter." },
            { status: 400 },
          );
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (apiKey) {
          try {
            const result = await callGateway(apiKey, {
              model: "openai/gpt-5.6-sol",
              reasoning: { effort: "low", summary: "auto" },
              instructions:
                "You write cover letters. Use ONLY facts present in the supplied tailored resume — never invent employers, " +
                "metrics, dates or skills. Mirror the posting's vocabulary where truthful. Output plain text only, no markdown. " +
                "Structure: an optional greeting line ('Dear Hiring Team,'), 3 short paragraphs, then 'Sincerely,' and the " +
                "candidate's name. Under 300 words. " +
                TONE_HINT[body.tone],
              input: [
                {
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: `JOB POSTING:\n${body.job}\n\nTAILORED RESUME:\n${body.resume}${
                        body.applicant ? `\n\nCANDIDATE NAME: ${body.applicant}` : ""
                      }`,
                    },
                  ],
                },
              ],
            });

            if (result.ok) return textStreamResponse(result.stream);
          } catch {
            // Fall back to built-in generator
          }
        }

        // Built-in intelligent cover letter generator
        const letter = generateCoverLetter(body);
        return createCoverLetterStreamResponse(letter);
      },
    },
  },
});
