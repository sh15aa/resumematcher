import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RazorpayButtonProps {
  amountPaise: number;
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (data: { paymentId: string; orderId: string; signature: string }) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  amountPaise,
  currency = "INR",
  receipt,
  name = "CVFitt Enterprise Pro",
  description = "Unlock all 32 FAANG & Overleaf templates",
  prefill,
  onSuccess,
  onError,
  className,
  children,
  disabled,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      // 1. Ensure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay checkout script. Please check your network connection.",
        );
      }

      // 2. Call backend endpoint to create order (STEP 1)
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });

      const orderData = (await orderRes.json()) as {
        order_id?: string;
        amount?: number;
        currency?: string;
        key_id?: string;
        error?: string;
      };

      if (!orderRes.ok || !orderData.order_id) {
        const errorMsg = orderData.error || `Failed to create order (HTTP ${orderRes.status})`;
        throw new Error(errorMsg);
      }

      const keyId =
        orderData.key_id ||
        (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined)?.trim() ||
        "";

      // 3. Open Razorpay Standard Checkout modal with order_id (STEP 2)
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || "Alex Chen",
          email: prefill?.email || "alex.chen@example.com",
          contact: prefill?.contact || "+919876543210",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Send payment details to backend verify endpoint (STEP 3)
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = (await verifyRes.json()) as {
              success?: boolean;
              error?: string;
              message?: string;
            };

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            setLoading(false);
            toast.success(`Payment verified successfully! ID: ${response.razorpay_payment_id}`);

            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            }
          } catch (verifyErr: unknown) {
            setLoading(false);
            const err =
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment signature verification failed.";
            toast.error(err);
            if (onError) onError(err);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled: checkout window was closed.");
            if (onError) onError("Payment cancelled by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: { error?: { description?: string } }) {
        setLoading(false);
        const errorDesc =
          response.error?.description || "Payment failed. Please try another payment method.";
        toast.error(`Payment failed: ${errorDesc}`);
        if (onError) onError(errorDesc);
      });

      rzp.open();
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Failed to initialize payment.";
      toast.error(message);
      if (onError) onError(message);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCheckout}
      disabled={loading || disabled}
      className={
        className ||
        "w-full h-11 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
      }
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          Processing Payment...
        </>
      ) : (
        children || (
          <>
            <Lock className="size-4 mr-2" />
            Pay Now with Razorpay
          </>
        )
      )}
    </Button>
  );
}
