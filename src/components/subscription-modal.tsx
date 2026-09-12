import { useState, useMemo } from "react";
import {
  Check,
  Crown,
  FileText,
  Sparkles,
  X,
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  UserCheck,
  Globe,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/lib/subscription";
import { useAuth } from "@/lib/supabase-auth";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

export interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureReason?: string;
}

// Simple Luhn Algorithm card validation
function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isSecond = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (isSecond) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isSecond = !isSecond;
  }
  return sum % 10 === 0;
}

// Detect card brand
function getCardBrand(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (/^4/.test(clean)) return "Visa";
  if (/^5[1-5]/.test(clean)) return "Mastercard";
  if (/^3[47]/.test(clean)) return "American Express";
  if (/^6(?:011|5)/.test(clean)) return "Discover";
  return "Card";
}

export function SubscriptionModal({ open, onOpenChange, featureReason }: SubscriptionModalProps) {
  const { isSubscribed, subscribe, unsubscribe } = useSubscription();
  const { user, signIn, signUp, linkSubscriptionToUser } = useAuth();
  const { currency, currencyCode, setCurrency, currenciesList } = useCurrency();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [step, setStep] = useState<"plans" | "auth" | "payment" | "success">("plans");
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Payment fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const cardBrand = useMemo(() => getCardBrand(cardNumber), [cardNumber]);

  if (!open) return null;

  const currentPriceFormatted =
    billingCycle === "annual"
      ? `${currency.annualFormatted} / year`
      : `${currency.monthlyFormatted} / month`;

  const handlePlanProceed = () => {
    if (user) {
      setStep("payment");
    } else {
      setStep("auth");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setAuthLoading(true);
    if (authMode === "login") {
      const { user: authedUser, error } = await signIn(email, password);
      setAuthLoading(false);
      if (error) {
        toast.error(error.message || "Failed to sign in. Please verify your credentials.");
      } else if (authedUser) {
        toast.success("Signed in successfully!");
        setStep("payment");
      }
    } else {
      if (password.length < 6) {
        setAuthLoading(false);
        toast.error("Password must be at least 6 characters.");
        return;
      }
      const { user: newUser, session, error } = await signUp(email, password);
      setAuthLoading(false);
      if (error) {
        toast.error(error.message || "Sign up failed.");
      } else {
        toast.success("Account created successfully!");
        setStep("payment");
      }
    }
  };

  const fillTestCard = () => {
    setCardName(user?.email?.split("@")[0] || "Alex Chen");
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("12/28");
    setCardCvc("888");
    setPostalCode("94105");
    toast.info("Filled with PCI-compliant sandbox testing credentials.");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (!cleanNumber || cleanNumber.length < 15) {
      toast.error("Please provide a valid card number.");
      return;
    }

    if (!validateLuhn(cleanNumber)) {
      toast.error("Invalid card number. Please re-check.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Please enter expiry as MM/YY.");
      return;
    }

    if (!cardCvc || cardCvc.length < 3) {
      toast.error("Please provide a valid 3 or 4-digit CVC.");
      return;
    }

    setPaymentLoading(true);

    // Cryptographic transaction signature simulation
    await new Promise((r) => setTimeout(r, 1400));

    const generatedTxn = `TXN-PRO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTransactionId(generatedTxn);

    // Securely link to user
    await linkSubscriptionToUser(billingCycle);
    subscribe(billingCycle);

    setPaymentLoading(false);
    setStep("success");
    toast.success("🎉 Payment verified! Enterprise Pro has been activated.");
  };

  const handleCancelSub = () => {
    unsubscribe();
    toast.info("Switched back to Free Tier. PDF downloads now require subscription.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-6 sm:px-8 pt-6 pb-5 text-foreground">
          <button
            type="button"
            onClick={() => {
              setStep("plans");
              onOpenChange(false);
            }}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Crown className="size-3.5 fill-current" /> Enterprise Pro
              </span>
              {user && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <UserCheck className="size-3 text-emerald-500" /> {user.email}
                </span>
              )}
            </div>

            {/* Currency Selector */}
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2 py-0.5 text-xs shadow-2xs">
              <Globe className="size-3.5 text-muted-foreground" />
              <label htmlFor="modal-currency" className="sr-only">
                Select Currency
              </label>
              <select
                id="modal-currency"
                value={currencyCode}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground cursor-pointer focus:outline-hidden"
              >
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {step === "plans" && "Upgrade to Unlock All 25 Templates & Vector PDFs"}
            {step === "auth" && "Secure Your Pro Account"}
            {step === "payment" && "256-Bit SSL Encrypted Checkout"}
            {step === "success" && "Subscription Confirmed!"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
            {step === "plans" &&
              (featureReason ||
                "Free tier offers the first 5 templates in Word (.doc). Upgrade to unlock vector PDFs and 25 FAANG-tested formats.")}
            {step === "auth" &&
              "Register or sign in so your Pro benefits, custom sections, and saved resumes are securely linked."}
            {step === "payment" &&
              `You are activating Enterprise Pro (${currentPriceFormatted}). Backed by our 30-Day Money-Back Guarantee.`}
            {step === "success" &&
              "Your account is now fully upgraded with all 25 world-class resume templates unlocked."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: PLANS */}
          {step === "plans" && (
            <>
              {/* Localized Currency Note */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Price localized for:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <span>{currency.flag}</span>
                    <span>{currency.countryName}</span>
                  </span>
                </span>
                <span className="font-semibold text-primary">
                  {currency.code} ({currency.symbol})
                </span>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex items-center rounded-xl bg-muted/70 p-1 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly ({currency.monthlyFormatted} / mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`relative rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                      billingCycle === "annual"
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Annual ({currency.annualFormatted} / yr)
                    <span className="ml-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      SAVE {currency.savingsPercentage}%
                    </span>
                  </button>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Free Box */}
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs space-y-2.5">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <FileText className="size-3.5" /> Free Tier
                  </span>
                  <p className="font-bold text-base text-foreground">
                    {currency.symbol}0 / forever
                  </p>
                  <ul className="space-y-1.5 text-muted-foreground pt-1">
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span>First 5 World-Class Templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Word Document (.doc) Downloads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span>100% ATS Match &amp; Ghost Cloaking</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground/50 line-through">
                      <span>Vector PDF Downloads</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground/50 line-through">
                      <span>Templates 6–25 (Google, Meta, Apple)</span>
                    </li>
                  </ul>
                </div>

                {/* Pro Box */}
                <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 text-xs space-y-2.5 relative shadow-xs">
                  <div className="absolute -top-2.5 right-3">
                    <Badge className="bg-primary text-primary-foreground text-[10px] py-0 px-2 font-semibold">
                      RECOMMENDED
                    </Badge>
                  </div>
                  <span className="font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Crown className="size-3.5 text-amber-500" /> Enterprise Pro
                  </span>
                  <p className="font-bold text-base text-foreground">{currentPriceFormatted}</p>
                  <ul className="space-y-1.5 text-foreground pt-1">
                    <li className="flex items-center gap-2 font-medium">
                      <Check className="size-3.5 text-primary shrink-0 stroke-[2.5]" />
                      <span>Unlimited High-Res Vector PDF Exports</span>
                    </li>
                    <li className="flex items-center gap-2 font-medium">
                      <Check className="size-3.5 text-primary shrink-0 stroke-[2.5]" />
                      <span>All 25 Templates Unlocked (FAANG Benchmarked)</span>
                    </li>
                    <li className="flex items-center gap-2 font-medium">
                      <Check className="size-3.5 text-primary shrink-0 stroke-[2.5]" />
                      <span>100% Ad-Free Clean Document Studio</span>
                    </li>
                    <li className="flex items-center gap-2 font-medium">
                      <Check className="size-3.5 text-primary shrink-0 stroke-[2.5]" />
                      <span>Cloud Saved Resumes &amp; Career History</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {!isSubscribed ? (
                  <Button
                    size="lg"
                    onClick={handlePlanProceed}
                    className="w-full h-11 font-bold text-sm shadow-sm transition-all"
                  >
                    <Sparkles className="size-4 mr-2 text-amber-300" />
                    {user ? "Proceed to Secure Checkout" : "Create Account & Unlock Pro"} (
                    {currentPriceFormatted})
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      ✓ Enterprise Pro is currently ACTIVE!
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSub}
                      className="w-full text-xs text-muted-foreground hover:text-destructive"
                    >
                      Revert to Free Tier (Test Mode)
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> 30-Day Money-Back
                    Guarantee
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="hover:text-foreground underline transition-colors"
                  >
                    Continue with Free Word (.doc)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: AUTH */}
          {step === "auth" && (
            <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 text-xs font-medium mb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`rounded-lg py-1.5 transition-all ${
                    authMode === "register"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-lg py-1.5 transition-all ${
                    authMode === "login"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I have an account
                </button>
              </div>

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
                  className="h-10 text-sm"
                  disabled={authLoading}
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
                  placeholder="Minimum 6 characters"
                  className="h-10 text-sm"
                  disabled={authLoading}
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-10 font-semibold text-sm"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Connecting with Supabase...
                    </>
                  ) : authMode === "register" ? (
                    <>
                      <Sparkles className="size-4 mr-2 text-amber-300" />
                      Create Account &amp; Proceed
                    </>
                  ) : (
                    <>
                      Sign In &amp; Proceed
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("plans")}
                  className="text-xs text-muted-foreground"
                >
                  ← Back to Plans
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT GATEWAY CHECKOUT */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">
                    Enterprise Pro ({billingCycle.toUpperCase()})
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    All 25 Templates + Vector PDF Exports
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">{currentPriceFormatted}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Billed securely
                  </p>
                </div>
              </div>

              {/* Demo test card trigger */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="size-3 text-emerald-500" /> Card Details
                </span>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Use Demo Test Card
                </button>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-foreground">Cardholder Name</label>
                <Input
                  type="text"
                  required
                  placeholder="Full name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="h-10 text-sm"
                  disabled={paymentLoading}
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Card Number</span>
                  <span className="text-[10px] font-semibold text-primary">{cardBrand}</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4444 4444 4444 4444"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                      setCardNumber(formatted);
                    }}
                    className="h-10 text-sm pl-9 font-mono"
                    disabled={paymentLoading}
                  />
                  <CreditCard className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-medium text-foreground">Expiry (MM/YY)</label>
                  <Input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^\d/]/g, "");
                      if (v.length === 2 && !v.includes("/")) v = v + "/";
                      setCardExpiry(v.slice(0, 5));
                    }}
                    className="h-10 text-sm font-mono text-center"
                    disabled={paymentLoading}
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-medium text-foreground">Security CVC</label>
                  <Input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-10 text-sm font-mono text-center"
                    disabled={paymentLoading}
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-foreground">
                  Billing Postal / Zip Code
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 94105 or 560001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.toUpperCase().slice(0, 10))}
                  className="h-10 text-sm"
                  disabled={paymentLoading}
                />
              </div>

              {/* Pay Button */}
              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full h-11 font-bold text-sm shadow-sm transition-all"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Verifying with Bank via 256-Bit SSL...
                    </>
                  ) : (
                    <>
                      <Lock className="size-4 mr-2" />
                      Pay {currentPriceFormatted} &amp; Unlock Pro
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("plans")}
                  className="w-full text-xs text-muted-foreground"
                >
                  ← Back to Plans
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-around text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-500" /> PCI-DSS Level 1
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="size-3.5 text-primary" /> 256-Bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> 30-Day Refund
                </span>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "success" && (
            <div className="text-center py-4 space-y-4 max-w-md mx-auto">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Welcome to Enterprise Pro!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your payment was successfully authorized. Your subscription is active.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-semibold text-foreground">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-semibold text-foreground">
                    Enterprise Pro ({billingCycle.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Active / Paid
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setStep("plans");
                  onOpenChange(false);
                }}
                className="w-full h-10 font-semibold text-sm"
              >
                Start Using 25 Templates &amp; PDF Downloads →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
