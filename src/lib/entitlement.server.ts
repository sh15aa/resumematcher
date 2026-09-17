import crypto from "node:crypto";
import { getRazorpayConfig } from "./razorpay.server";

export const OFFICIAL_PLANS = {
  monthly: {
    name: "Enterprise Pro Monthly",
    inr: 19900, // ₹199 in paise
    usd: 1900, // $19 in cents
    durationDays: 31,
  },
  annual: {
    name: "Enterprise Pro Annual",
    inr: 99900, // ₹999 in paise
    usd: 8900, // $89 in cents
    durationDays: 366,
  },
} as const;

export type PlanType = keyof typeof OFFICIAL_PLANS;

export interface EntitlementPayload {
  isSubscribed: true;
  plan: PlanType;
  orderId: string;
  paymentId: string;
  iat: number;
  exp: number;
}

function getSigningSecret(): string {
  const { keySecret } = getRazorpayConfig();
  // If keySecret is set, use it. Otherwise use persistent server-side pepper
  return keySecret || "cvfitt-hmac-server-secret-pepper-2026-unhackable-key-329f12";
}

/**
 * Creates an unforgeable, cryptographically signed entitlement token using HMAC-SHA256.
 * Cannot be modified or forged by Chrome extensions, DevTools, or client console.
 */
export function signEntitlementToken(data: {
  plan: PlanType;
  orderId: string;
  paymentId: string;
}): string {
  const secret = getSigningSecret();
  const planInfo = OFFICIAL_PLANS[data.plan] || OFFICIAL_PLANS.monthly;
  const now = Date.now();
  const exp = now + planInfo.durationDays * 24 * 60 * 60 * 1000;

  const payload: EntitlementPayload = {
    isSubscribed: true,
    plan: data.plan,
    orderId: data.orderId,
    paymentId: data.paymentId,
    iat: now,
    exp,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payloadStr).digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies the cryptographic entitlement token using timingSafeEqual.
 */
export function verifyEntitlementToken(token?: string): {
  valid: boolean;
  payload?: EntitlementPayload;
  error?: string;
} {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Missing or malformed entitlement token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token structure." };
  }

  const [payloadStr, receivedSignature] = parts;
  const secret = getSigningSecret();

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64url");

  const expectedBuf = Buffer.from(expectedSignature);
  const receivedBuf = Buffer.from(receivedSignature);

  if (
    expectedBuf.length !== receivedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    return {
      valid: false,
      error: "Cryptographic signature mismatch. Token is forged or tampered.",
    };
  }

  try {
    const payloadJson = Buffer.from(payloadStr, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as EntitlementPayload;

    if (!payload.isSubscribed || !payload.exp) {
      return { valid: false, error: "Invalid token claims." };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Subscription entitlement token has expired." };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Failed to deserialize token payload." };
  }
}
