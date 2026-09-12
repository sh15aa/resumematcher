import { useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  getSubscriptionState,
  saveSubscription,
  activateSubscription,
  cancelSubscription,
} from "./subscription";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase subscription status with local state
  const checkRemoteSubscription = useCallback(async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("subscriptions")
        .select("status, plan")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data && (data.status === "active" || data.status === "trialing")) {
        activateSubscription(data.plan === "annual" ? "annual" : "monthly");
      }
    } catch {
      // Table might not exist yet; gracefully keep existing local state
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          checkRemoteSubscription(session.user.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("[Auth] getSession error:", err);
        if (mounted) setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        checkRemoteSubscription(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRemoteSubscription]);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { user: null, error };
      if (data.user?.id) {
        await checkRemoteSubscription(data.user.id);
      }
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) return { user: null, session: null, error };
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, session: null, error: err as AuthError };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // Optional: keep or reset subscription on logout
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  // Record a newly purchased subscription to Supabase for the active user
  const linkSubscriptionToUser = async (plan: "monthly" | "annual" = "monthly") => {
    activateSubscription(plan);
    if (!user?.id) return;

    try {
      await (supabase as any).from("subscriptions").upsert(
        {
          user_id: user.id,
          status: "active",
          plan,
          current_period_end: new Date(
            Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        { onConflict: "user_id" },
      );
    } catch {
      // If table is not created yet, local storage will maintain the state seamlessly
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    linkSubscriptionToUser,
  };
}
