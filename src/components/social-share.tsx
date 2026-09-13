import { useState } from "react";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface SocialShareProps {
  score?: number;
  roleTitle?: string;
  className?: string;
}

export function SocialShare({ score = 100, roleTitle, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://cvfitt.fitt.workers.dev";
  const shareText = `Just tailored my resume for ${roleTitle ? `"${roleTitle}"` : "my target role"} using CVFitt Enterprise — achieved a ${score}% ATS shortlist score! Highly recommended for any job seeker:`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      toast.success("Share link & message copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Link: " + shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "CVFitt Enterprise — 100% ATS Resume Matcher",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch {
        // user dismissed
      }
    } else {
      copyToClipboard();
    }
  };

  const openPopup = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Share2 className="size-4 text-primary" /> Share With Peers &amp; Job Seekers
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Help fellow candidates beat applicant tracking systems and secure interview callbacks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* LinkedIn */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              openPopup(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
              )
            }
            className="h-8 text-xs font-semibold hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-500/40"
            aria-label="Share on LinkedIn"
          >
            LinkedIn
          </Button>

          {/* X / Twitter */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              openPopup(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
              )
            }
            className="h-8 text-xs font-semibold hover:bg-neutral-900/10 hover:border-neutral-700 dark:hover:bg-white/10"
            aria-label="Share on X (Twitter)"
          >
            X / Twitter
          </Button>

          {/* WhatsApp */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              openPopup(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
              )
            }
            className="h-8 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/40"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="size-3.5 mr-1" /> WhatsApp
          </Button>

          {/* Copy / Native Share */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleNativeShare}
            className="h-8 text-xs font-semibold"
            aria-label="Copy share link"
          >
            {copied ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" /> Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
