import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyEntitlementToken } from "@/lib/entitlement.server";

const VerifySubSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/api/verify-subscription")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let token: string | undefined;

        try {
          const body = (await request.json().catch(() => ({}))) as z.infer<typeof VerifySubSchema>;
          token = body?.token;
        } catch {
          // ignore json errors
        }

        if (!token) {
          const cookieHeader = request.headers.get("cookie") || "";
          const match = cookieHeader.match(/cvfitt_entitlement=([^;]+)/);
          if (match) {
            token = match[1];
          }
        }

        const res = verifyEntitlementToken(token);

        if (!res.valid) {
          return Response.json(
            { isSubscribed: false, error: res.error || "Invalid or missing token" },
            { status: 200 },
          );
        }

        return Response.json({
          isSubscribed: true,
          plan: res.payload?.plan,
          expiresAt: res.payload?.exp,
        });
      },
    },
  },
});
