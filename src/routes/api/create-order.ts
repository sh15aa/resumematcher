import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createRazorpayOrder } from "@/lib/razorpay.server";
import { OFFICIAL_PLANS, type PlanType } from "@/lib/entitlement.server";

const CreateOrderSchema = z.object({
  plan: z.enum(["monthly", "annual"]).optional().default("monthly"),
  currency: z.string().min(3).max(3).optional().default("INR"),
  receipt: z.string().max(60).optional(),
  // Optional client-supplied amount is validated strictly against official catalog
  amount: z.number().optional(),
});

export const Route = createFileRoute("/api/create-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof CreateOrderSchema>;

        try {
          const raw = await request.json();
          body = CreateOrderSchema.parse(raw);
        } catch (err) {
          const msg = err instanceof z.ZodError ? err.errors[0]?.message : "Invalid request body.";
          return Response.json({ error: msg }, { status: 400 });
        }

        const planKey = (body.plan in OFFICIAL_PLANS ? body.plan : "monthly") as PlanType;
        const planConfig = OFFICIAL_PLANS[planKey];
        const isUsd = body.currency?.toUpperCase() === "USD";

        // STRICT SERVER-SIDE PRICING: NEVER trust client-provided arbitrary amounts
        const verifiedAmount = isUsd ? planConfig.usd : planConfig.inr;
        const verifiedCurrency = isUsd ? "USD" : "INR";

        const result = await createRazorpayOrder({
          amount: verifiedAmount,
          currency: verifiedCurrency,
          receipt: body.receipt || `rcpt_${planKey}_${Date.now()}`,
          notes: {
            plan: planKey,
            plan_name: planConfig.name,
            enforced_by_server: "true",
          },
        });

        if (!result.ok) {
          return Response.json(
            { error: result.error || "Failed to create order" },
            { status: result.status },
          );
        }

        return Response.json(
          {
            order_id: result.data!.order_id,
            amount: result.data!.amount,
            currency: result.data!.currency,
            key_id: result.data!.key_id,
            plan: planKey,
          },
          { status: 200 },
        );
      },
    },
  },
});
