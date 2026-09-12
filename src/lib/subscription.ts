import { useEffect, useState } from "react";

const SUBSCRIPTION_KEY = "resumematcher:subscription:v1";
const CHANGE_EVENT = "resumematcher:subscription_change";

export type SubscriptionState = {
  isSubscribed: boolean;
  plan?: "monthly" | "annual";
  activatedAt?: number;
};

export function getSubscriptionState(): SubscriptionState {
  if (typeof window === "undefined") {
    return { isSubscribed: false };
  }
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return { isSubscribed: false };
    const parsed = JSON.parse(raw);
    return {
      isSubscribed: Boolean(parsed.isSubscribed),
      plan: parsed.plan || "monthly",
      activatedAt: parsed.activatedAt,
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
    /* storage error ignored */
  }
}

export function activateSubscription(plan: "monthly" | "annual" = "monthly"): void {
  saveSubscription({
    isSubscribed: true,
    plan,
    activatedAt: Date.now(),
  });
}

export function cancelSubscription(): void {
  saveSubscription({
    isSubscribed: false,
  });
}

export function useSubscription(): {
  isSubscribed: boolean;
  plan?: "monthly" | "annual";
  subscribe: (plan?: "monthly" | "annual") => void;
  unsubscribe: () => void;
} {
  const [sub, setSub] = useState<SubscriptionState>(() => getSubscriptionState());

  useEffect(() => {
    function onStorage() {
      setSub(getSubscriptionState());
    }
    window.addEventListener(CHANGE_EVENT, onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    isSubscribed: sub.isSubscribed,
    plan: sub.plan,
    subscribe: (plan = "monthly") => activateSubscription(plan),
    unsubscribe: () => cancelSubscription(),
  };
}
