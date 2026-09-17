import { useEffect, useState } from "react";

const SUBSCRIPTION_KEY = "resumematcher:subscription:v1";
const CHANGE_EVENT = "resumematcher:subscription_change";

export type SubscriptionState = {
  isSubscribed: boolean;
  plan?: "monthly" | "annual" | undefined;
  activatedAt?: number | undefined;
  token?: string | undefined;
  orderId?: string | undefined;
  paymentId?: string | undefined;
};

/**
 * Validates whether the stored subscription has a plausible signed server token.
 * Prevents plain DevTools console hacks like: localStorage.setItem(..., '{"isSubscribed":true}')
 */
function isTokenFormatValid(token?: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 2 && parts[0]!.length > 10 && parts[1]!.length > 10;
}

export function getSubscriptionState(): SubscriptionState {
  if (typeof window === "undefined") {
    return { isSubscribed: false };
  }
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return { isSubscribed: false };
    const parsed = JSON.parse(raw);

    // ANTI-HACK SHIELD: If isSubscribed is true but token is missing or malformed,
    // immediately invalidate and reject the tampered client state.
    if (parsed.isSubscribed && !isTokenFormatValid(parsed.token)) {
      window.localStorage.removeItem(SUBSCRIPTION_KEY);
      return { isSubscribed: false };
    }

    return {
      isSubscribed: Boolean(parsed.isSubscribed && isTokenFormatValid(parsed.token)),
      plan: (parsed.plan as "monthly" | "annual") || "monthly",
      activatedAt: parsed.activatedAt,
      token: parsed.token,
      orderId: parsed.orderId,
      paymentId: parsed.paymentId,
    };
  } catch {
    return { isSubscribed: false };
  }
}

export function saveSubscription(state: SubscriptionState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // LocalStorage quota exceeded or disabled
  }
}

export function activateSubscription(
  plan: "monthly" | "annual" = "monthly",
  token?: string,
  orderId?: string,
  paymentId?: string,
): void {
  // If no token was provided, do not allow activating subscription
  if (!isTokenFormatValid(token)) {
    console.warn("[Security] Cannot activate subscription without authentic server signature.");
    return;
  }

  saveSubscription({
    isSubscribed: true,
    plan,
    activatedAt: Date.now(),
    token,
    orderId,
    paymentId,
  });
}

export function cancelSubscription(): void {
  saveSubscription({
    isSubscribed: false,
  });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SUBSCRIPTION_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Server Gatekeeper: Authorizes paid downloads (PDF, Pro templates) on the server.
 * Returns true only if the server cryptographically validates the token.
 */
export async function authorizeServerDownload(
  templateId: string,
  format: "pdf" | "word" | "latex",
): Promise<{ allowed: boolean; error?: string }> {
  const current = getSubscriptionState();

  try {
    const res = await fetch("/api/authorize-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        format,
        token: current.token,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      allowed?: boolean;
      error?: string;
    };

    if (!res.ok || !data.allowed) {
      // If server rejected authorization, wipe any tampered local state
      if (current.isSubscribed) {
        cancelSubscription();
      }
      return {
        allowed: false,
        error: data.error || "Active Enterprise Pro subscription required.",
      };
    }

    return { allowed: true };
  } catch {
    return {
      allowed: false,
      error: "Unable to verify download authorization. Please check network connection.",
    };
  }
}

export function useSubscription(): {
  isSubscribed: boolean;
  plan?: "monthly" | "annual" | undefined;
  token?: string | undefined;
  subscribe: (
    plan?: "monthly" | "annual" | undefined,
    token?: string,
    orderId?: string,
    paymentId?: string,
  ) => void;
  unsubscribe: () => void;
} {
  const [sub, setSub] = useState<SubscriptionState>(() => getSubscriptionState());

  useEffect(() => {
    function onStorage() {
      setSub(getSubscriptionState());
    }
    window.addEventListener(CHANGE_EVENT, onStorage);
    window.addEventListener("storage", onStorage);

    // Background server verification for active subscriptions
    const current = getSubscriptionState();
    if (current.isSubscribed && current.token) {
      void fetch("/api/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: current.token }),
      })
        .then((r) => r.json())
        .then((data: { isSubscribed?: boolean }) => {
          if (!data.isSubscribed) {
            cancelSubscription();
          }
        })
        .catch(() => {
          // Keep offline state if network is unreachable
        });
    }

    return () => {
      window.removeEventListener(CHANGE_EVENT, onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    isSubscribed: sub.isSubscribed,
    plan: sub.plan,
    token: sub.token,
    subscribe: (plan = "monthly", token, orderId, paymentId) =>
      activateSubscription(plan, token, orderId, paymentId),
    unsubscribe: () => cancelSubscription(),
  };
}
