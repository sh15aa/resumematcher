import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay.server";
import { signEntitlementToken, type PlanType } from "@/lib/entitlement.server";

const VerifyPaymentSchema = z.object({
  order_id: z.string().optional(),
  payment_id: z.string().optional(),
  signature: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  plan: z.enum(["monthly", "annual"]).optional().default("monthly"),
});

export const Route = createFileRoute("/api/verify-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof VerifyPaymentSchema>;

        try {
          const raw = await request.json();
          body = VerifyPaymentSchema.parse(raw);
        } catch {
          return Response.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
        }

        const result = verifyRazorpaySignature(body);

        if (!result.ok) {
          return Response.json(
            { success: false, error: result.error || "Payment verification failed" },
            { status: result.status },
          );
        }

        const orderId = result.order_id!;
        const paymentId = result.payment_id!;
        const plan = (body.plan || "monthly") as PlanType;

        // Cryptographically sign the entitlement token with server HMAC-SHA256
        const token = signEntitlementToken({
          plan,
          orderId,
          paymentId,
        });

        const headers = new Headers();
        // Set HTTP-Only secure cookie for browser-enforced security
        headers.append(
          "Set-Cookie",
          `cvfitt_entitlement=${token}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax; HttpOnly; Secure`,
        );

        return new Response(
          JSON.stringify({
            success: true,
            message: result.message,
            order_id: orderId,
            payment_id: paymentId,
            token,
            plan,
          }),
          {
            status: 200,
            headers: {
              ...Object.fromEntries(headers.entries()),
              "Content-Type": "application/json",
            },
          },
        );
      },
    },
  },
});
