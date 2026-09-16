import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay.server";

const VerifyPaymentSchema = z.object({
  order_id: z.string().optional(),
  payment_id: z.string().optional(),
  signature: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
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

        return Response.json(
          {
            success: true,
            message: result.message,
            order_id: result.order_id,
            payment_id: result.payment_id,
          },
          { status: 200 },
        );
      },
    },
  },
});
