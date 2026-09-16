import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createRazorpayOrder } from "@/lib/razorpay.server";

const CreateOrderSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number in paise",
    })
    .int("Amount must be an integer in paise")
    .min(100, "Amount must be at least 100 paise (1 INR)"),
  currency: z.string().min(3).max(3).optional().default("INR"),
  receipt: z.string().max(40).optional(),
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
          const msg =
            err instanceof z.ZodError
              ? err.errors[0]?.message
              : "Invalid request body. 'amount' (in paise, >= 100) is required.";
          return Response.json({ error: msg }, { status: 400 });
        }

        const result = await createRazorpayOrder({
          amount: body.amount,
          currency: body.currency,
          receipt: body.receipt,
        });

        if (!result.ok) {
          return Response.json(
            { error: result.error || "Failed to create order" },
            { status: result.status },
          );
        }

        // Return: { order_id, amount, currency }
        return Response.json(
          {
            order_id: result.data!.order_id,
            amount: result.data!.amount,
            currency: result.data!.currency,
            key_id: result.data!.key_id,
          },
          { status: 200 },
        );
      },
    },
  },
});
