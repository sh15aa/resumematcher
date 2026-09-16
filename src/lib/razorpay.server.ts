import crypto from "node:crypto";
import Razorpay from "razorpay";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

/**
 * Reads Razorpay configuration from server environment variables.
 * Key Secret is kept strictly server-side.
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = (
    process.env["RAZORPAY_KEY_ID"] ||
    process.env["VITE_RAZORPAY_KEY_ID"] ||
    ""
  ).trim();

  const keySecret = (process.env["RAZORPAY_KEY_SECRET"] || "").trim();

  return { keyId, keySecret };
}

export interface CreateOrderParams {
  amount: number; // in paise (minimum 100)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  ok: boolean;
  status: number;
  data?: {
    order_id: string;
    amount: number;
    currency: string;
    receipt?: string;
    key_id?: string;
  };
  error?: string;
}

/**
 * Creates a Razorpay Order via the Razorpay API.
 * POST https://api.razorpay.com/v1/orders
 * Validates amount >= 100 paise.
 * Handles auth failures (401) and API errors (500).
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const { amount, currency = "INR", receipt, notes } = params;

  // Validate amount >= 100 paise
  if (typeof amount !== "number" || isNaN(amount) || amount < 100) {
    return {
      ok: false,
      status: 400,
      error: "Validation failed: amount must be at least 100 paise (1 INR).",
    };
  }

  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    return {
      ok: false,
      status: 500,
      error: "Server configuration error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.",
    };
  }

  try {
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      notes: notes || {},
    };

    const order = await rzp.orders.create(options);

    return {
      ok: true,
      status: 200,
      data: {
        order_id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt,
        key_id: keyId,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as {
      statusCode?: number;
      status?: number;
      message?: string;
      error?: { code?: string; description?: string };
    };

    const statusCode =
      errorObj?.statusCode ||
      errorObj?.status ||
      (errorObj?.error?.code === "BAD_REQUEST_ERROR" &&
      errorObj?.error?.description?.toLowerCase().includes("auth")
        ? 401
        : 500);

    const description = errorObj?.error?.description || errorObj?.message || "Razorpay API error";

    if (statusCode === 401 || description.toLowerCase().includes("authentication failed")) {
      return {
        ok: false,
        status: 401,
        error: `Razorpay authentication failed: ${description}. Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET credentials in .env.`,
      };
    }

    return {
      ok: false,
      status: 500,
      error: `Razorpay API error: ${description}`,
    };
  }
}

export interface VerifyPaymentParams {
  order_id?: string;
  payment_id?: string;
  signature?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface VerifyPaymentResult {
  ok: boolean;
  status: number;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

/**
 * Verifies Razorpay payment signature using HMAC-SHA256.
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Returns success only if generated signature matches razorpay_signature.
 */
export function verifyRazorpaySignature(params: VerifyPaymentParams): VerifyPaymentResult {
  const orderId = (params.razorpay_order_id || params.order_id || "").trim();
  const paymentId = (params.razorpay_payment_id || params.payment_id || "").trim();
  const signature = (params.razorpay_signature || params.signature || "").trim();

  // Missing fields: return 400
  if (!orderId || !paymentId || !signature) {
    return {
      ok: false,
      status: 400,
      error:
        "Missing required payment verification fields. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
    };
  }

  const { keySecret } = getRazorpayConfig();

  if (!keySecret) {
    return {
      ok: false,
      status: 500,
      error: "Server configuration error: RAZORPAY_KEY_SECRET is not set.",
    };
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");

    const expectedBuffer = Buffer.from(generatedSignature, "utf-8");
    const receivedBuffer = Buffer.from(signature, "utf-8");

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    // Signature mismatch: return 400, do NOT mark as paid
    if (!isMatch) {
      return {
        ok: false,
        status: 400,
        error: "Signature mismatch: payment verification failed. Do not mark as paid.",
      };
    }

    return {
      ok: true,
      status: 200,
      message: "Payment signature successfully verified.",
      order_id: orderId,
      payment_id: paymentId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return {
      ok: false,
      status: 500,
      error: `Signature verification error: ${errorMsg}`,
    };
  }
}
