import { useState, useMemo } from "react";
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/supabase-auth";

export interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "sign_in" | "sign_up";
  onSuccess?: (userId: string) => void;
  title?: string;
  subtitle?: string;
}

// Client-side brute-force prevention state
let failedAttempts = 0;
let lockUntil = 0;

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "sign_in",
  onSuccess,
  title,
  subtitle,
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"sign_in" | "sign_up">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Compute password strength for registration
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit lock
    if (Date.now() < lockUntil) {
      const remainingSecs = Math.ceil((lockUntil - Date.now()) / 1000);
      toast.error(`Too many attempts. Please wait ${remainingSecs}s for security.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (mode === "sign_up") {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    if (mode === "sign_in") {
      const { user, error } = await signIn(cleanEmail, password);
      setLoading(false);
      if (error) {
        failedAttempts++;
        if (failedAttempts >= 5) {
          lockUntil = Date.now() + 60 * 1000;
          setCooldown(60);
          const interval = setInterval(() => {
            const left = Math.ceil((lockUntil - Date.now()) / 1000);
            if (left <= 0) {
              failedAttempts = 0;
              setCooldown(0);
              clearInterval(interval);
            } else {
              setCooldown(left);
            }
          }, 1000);
          toast.error("Account locked for 60s due to excessive attempts.");
          return;
        }
        toast.error(error.message || "Failed to sign in. Please verify your credentials.");
      } else if (user) {
        failedAttempts = 0;
        toast.success(`Welcome back, ${user.email}!`);
        onSuccess?.(user.id);
        onOpenChange(false);
      }
    } else {
      const { user, session, error } = await signUp(cleanEmail, password);
      setLoading(false);
      if (error) {
        toast.error(error.message || "Sign up failed. Please check your details.");
      } else {
        if (session && user) {
          toast.success("Account created successfully!");
          onSuccess?.(user.id);
          onOpenChange(false);
        } else {
          toast.success("Account registered! A verification link has been sent to your email.");
          onSuccess?.(user?.id || "new-user");
          onOpenChange(false);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 ring-1 ring-primary/20">
            <Lock className="size-5" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground hero-gradient-text">
            {title || (mode === "sign_up" ? "Create Pro Account" : "Sign In to CVFitt")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
            {subtitle ||
              (mode === "sign_up"
                ? "Your subscriptions, custom sections, and saved templates are securely stored."
                : "Enter your email and password to access your cloud profile and templates.")}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("sign_in")}
            className={`rounded-lg py-2 transition-all ${
              mode === "sign_in"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("sign_up")}
            className={`rounded-lg py-2 transition-all ${
              mode === "sign_up"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {/* Cooldown notice if locked */}
        {cooldown > 0 && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>Too many attempts. Protection active: wait {cooldown}s.</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" /> Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-10 text-sm bg-background/50 focus:bg-background"
              disabled={loading || cooldown > 0}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" /> Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-sm bg-background/50 focus:bg-background"
              disabled={loading || cooldown > 0}
            />
          </div>

          {mode === "sign_up" && (
            <>
              {/* Strength Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Password Strength</span>
                  <span className="font-semibold text-foreground">
                    {passwordStrength <= 1 ? "Weak" : passwordStrength === 2 ? "Fair" : "Strong"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1">
                  <div
                    className={`rounded-full ${passwordStrength >= 1 ? "bg-amber-500" : "bg-muted"}`}
                  />
                  <div
                    className={`rounded-full ${passwordStrength >= 2 ? "bg-amber-500" : "bg-muted"}`}
                  />
                  <div
                    className={`rounded-full ${passwordStrength >= 3 ? "bg-emerald-500" : "bg-muted"}`}
                  />
                  <div
                    className={`rounded-full ${passwordStrength >= 4 ? "bg-emerald-500" : "bg-muted"}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left animate-in fade-in duration-150">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" /> Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-sm bg-background/50 focus:bg-background"
                  disabled={loading || cooldown > 0}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full h-10 mt-2 font-semibold text-sm shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {mode === "sign_up" ? "Creating Account..." : "Signing In..."}
              </>
            ) : mode === "sign_up" ? (
              <>
                <Sparkles className="size-4 mr-2 text-primary-foreground" />
                Create Free Account
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Guarantee */}
        <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Secured via Supabase 256-Bit Authentication</span>
        </div>
      </div>
    </div>
  );
}
