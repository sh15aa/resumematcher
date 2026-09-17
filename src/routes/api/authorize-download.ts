import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyEntitlementToken } from "@/lib/entitlement.server";
import { TEMPLATES } from "@/lib/templates";

const AuthorizeDownloadSchema = z.object({
  templateId: z.string(),
  format: z.enum(["pdf", "word", "latex"]),
  token: z.string().optional(),
});

export const Route = createFileRoute("/api/authorize-download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof AuthorizeDownloadSchema>;

        try {
          const raw = await request.json();
          body = AuthorizeDownloadSchema.parse(raw);
        } catch {
          return Response.json(
            { allowed: false, error: "Invalid download authorization request." },
            { status: 400 },
          );
        }

        const template = TEMPLATES.find((t) => t.id === body.templateId);
        const isFreeTemplate = template ? template.isFree : false;

        // 1. Free word downloads for the 6 free templates do not require payment
        if (body.format === "word" && isFreeTemplate) {
          return Response.json({ allowed: true, reason: "Free community template." });
        }

        // 2. Free LaTeX source export does not require payment
        if (body.format === "latex") {
          return Response.json({ allowed: true, reason: "Open-source LaTeX template." });
        }

        // 3. Any PDF download OR any of the 26 Pro templates requires an active Pro subscription
        // Check both the body token and the HTTP-only cookie
        let token = body.token?.trim();
        if (!token) {
          const cookieHeader = request.headers.get("cookie") || "";
          const match = cookieHeader.match(/cvfitt_entitlement=([^;]+)/);
          if (match) {
            token = match[1];
          }
        }

        const verification = verifyEntitlementToken(token);

        if (!verification.valid) {
          return Response.json(
            {
              allowed: false,
              requiresUpgrade: true,
              error:
                verification.error ||
                "Active Enterprise Pro subscription required. Unauthorized download attempt blocked.",
            },
            { status: 403 },
          );
        }

        // Valid, cryptographically verified Pro user
        return Response.json({
          allowed: true,
          plan: verification.payload?.plan,
          verified: true,
        });
      },
    },
  },
});
