import React, { memo, useState, useEffect, useRef, useMemo } from "react";
import { Check, Crown, Download, FileDown, Lock, ShieldCheck, Star, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_SAMPLE_RESUME_TEXT, renderResumeHtml, type ResumeTemplate } from "@/lib/templates";

interface TemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  isSubscribed: boolean;
  resumeText: string;
  applicant: string;
  onSelect: (template: ResumeTemplate) => void;
  onDownloadWord: (template: ResumeTemplate) => void;
  onDownloadPdf: (template: ResumeTemplate) => void;
  onZoom: (template: ResumeTemplate) => void;
}

export const TemplateCard = memo(function TemplateCard({
  template,
  isSelected,
  isSubscribed,
  resumeText,
  applicant,
  onSelect,
  onDownloadWord,
  onDownloadPdf,
  onZoom,
}: TemplateCardProps) {
  const isLocked = !template.isFree && !isSubscribed;
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const effectiveResumeText =
    resumeText && resumeText.trim().length >= 15 ? resumeText : DEFAULT_SAMPLE_RESUME_TEXT;
  const effectiveApplicant =
    (!resumeText || resumeText.trim().length < 15) && (!applicant || applicant === "Your Name")
      ? "Alex Chen"
      : applicant;

  const srcDoc = useMemo(() => {
    if (!isVisible) return "";
    return renderResumeHtml(effectiveResumeText, template, effectiveApplicant, undefined, false, {
      isInteractive: false,
      includeLatexLayer: false,
    });
  }, [isVisible, effectiveResumeText, template, effectiveApplicant]);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 bg-card shadow-xs overflow-hidden ${
        isSelected
          ? "border-primary ring-2 ring-primary/50 shadow-[0_0_28px_rgba(99,102,241,0.22)]"
          : "border-border hover:border-primary/50 hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(99,102,241,0.1)]"
      }`}
    >
      {/* Full-Height Miniature Preview (Shows 100% of resume from top to bottom with ZERO scrollbars) */}
      <div
        className="relative h-[400px] sm:h-[425px] overflow-hidden bg-[#090A0F]/80 border-b border-border flex items-center justify-center cursor-pointer select-none p-2"
        onClick={() => onSelect(template)}
      >
        {/* Strictly-sized miniature document box to prevent any parent or card scrollbars */}
        <div
          style={{
            width: "min(298px, 100%)",
            maxWidth: "100%",
            height: "385px",
            position: "relative",
            overflow: "hidden",
          }}
          className="rounded-lg shadow-md bg-white pointer-events-none select-none mx-auto"
        >
          {isVisible ? (
            <iframe
              title={`${template.name} preview`}
              srcDoc={srcDoc}
              loading="lazy"
              sandbox="allow-scripts"
              scrolling="no"
              className="border-0 pointer-events-none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "850px",
                height: "1100px",
                transform: "scale(0.35)",
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
              tabIndex={-1}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "850px",
                height: "1100px",
                transform: "scale(0.35)",
                transformOrigin: "top left",
              }}
              className="bg-white p-8 text-left flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-4">
                <div
                  className="h-8 w-3/5 rounded"
                  style={{ backgroundColor: template.accent || "#000000" }}
                />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
                <div className="border-b-2 my-2" style={{ borderColor: template.accent }} />
                <div className="space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-300" />
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                  <div className="h-2.5 w-5/6 rounded bg-slate-100" />
                </div>
                <div className="border-b my-2 border-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-1/4 rounded bg-slate-300" />
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                  <div className="h-2.5 w-4/5 rounded bg-slate-100" />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center">
                {template.name} · LaTeX Backend Ready
              </div>
            </div>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/40 animate-in zoom-in-75 duration-150">
            <Check className="size-4 stroke-[3]" />
          </div>
        )}

        {/* Tier badge, ATS Score & Overleaf indicator */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[calc(100%-80px)]">
          {template.isFree ? (
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold py-0.5 px-2 backdrop-blur-md">
              FREE TIER
            </span>
          ) : (
            <span className="rounded-md bg-[#121624]/90 border border-white/10 text-slate-200 text-[10px] font-semibold py-0.5 px-2 gap-1.5 inline-flex items-center backdrop-blur-md">
              <Crown className="size-3 text-primary" /> PRO
            </span>
          )}
          <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold py-0.5 px-2 inline-flex items-center gap-1 backdrop-blur-md shadow-xs">
            <ShieldCheck className="size-3 text-emerald-400" />
            {template.id === "standard-harvard" ||
            template.id === "canonical-plain" ||
            template.id === "standard-wharton" ||
            template.id === "wall-street-elite"
              ? "100% ATS"
              : "99% ATS"}
          </span>
          {template.id === "standard-harvard" && (
            <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold py-0.5 px-2 backdrop-blur-md">
              LaTeX Ready
            </span>
          )}
        </div>

        {/* Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom(template);
          }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-[#090A0F]/85 hover:bg-[#121624] text-slate-200 border border-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-md transition-all cursor-pointer"
        >
          <ZoomIn className="size-3.5 text-slate-400" /> Zoom
        </button>

        {/* Pro Lock overlay badge */}
        {isLocked && (
          <div className="absolute bottom-3 left-3">
            <div className="rounded-lg bg-[#090A0F]/90 px-2.5 py-1 text-xs font-medium text-slate-300 shadow-md flex items-center gap-1.5 border border-white/10 backdrop-blur-md">
              <Lock className="size-3.5 text-primary" /> Unlock with Pro
            </div>
          </div>
        )}
      </div>

      {/* Details & Action Controls */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Star className="size-3.5 fill-slate-300 text-slate-300" />
              {template.rating}{" "}
              <span className="text-muted-foreground text-[11px]">({template.reviewCount})</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                ATS Grade A+
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-medium py-0.5 px-2 text-muted-foreground border-border/80"
              >
                {template.category}
              </Badge>
            </div>
          </div>
          <h4 className="font-bold text-base text-foreground mt-1.5">{template.name}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
            {template.blurb}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className="h-8 text-xs flex-1 font-semibold"
            onClick={() => onSelect(template)}
          >
            {isLocked ? (
              <>
                <Lock className="size-3 mr-1 text-primary" /> Unlock Pro
              </>
            ) : isSelected ? (
              "Active Template"
            ) : (
              "Select & Apply"
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 text-xs px-2.5 font-semibold"
            onClick={() => onDownloadWord(template)}
            title="Download Word format (.doc)"
          >
            <FileDown className="size-3.5 mr-1 text-primary" /> Word
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs px-2.5 font-semibold"
            onClick={() => onDownloadPdf(template)}
            title="Download PDF"
          >
            <Download className="size-3.5 mr-1" /> PDF
            {!isSubscribed && <Lock className="size-3 text-primary ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
});
