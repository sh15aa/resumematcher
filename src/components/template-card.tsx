import React, { memo, useState, useEffect, useRef } from "react";
import { Check, Crown, Download, FileDown, Lock, Star, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderResumeHtml, type ResumeTemplate } from "@/lib/templates";

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
      className={`group relative flex flex-col rounded-2xl border-2 transition-all bg-card shadow-xs overflow-hidden ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-primary/60 hover:shadow-sm"
      }`}
    >
      {/* Full-Height Miniature Preview (Shows 100% of resume from top to bottom with ZERO scrollbars) */}
      <div
        className="relative h-[400px] sm:h-[425px] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-border flex items-center justify-center cursor-pointer select-none p-2"
        onClick={() => onSelect(template)}
      >
        {/* Strictly-sized miniature document box to prevent any parent or card scrollbars */}
        <div
          style={{
            width: "298px",
            height: "385px",
            position: "relative",
            overflow: "hidden",
          }}
          className="rounded shadow-xs bg-white pointer-events-none select-none"
        >
          {isVisible ? (
            <iframe
              title={`${template.name} preview`}
              srcDoc={renderResumeHtml(resumeText, template, applicant)}
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
          <div className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Check className="size-4 stroke-[3]" />
          </div>
        )}

        {/* Tier badge & Overleaf indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {template.isFree ? (
            <Badge className="bg-emerald-600 text-white text-[11px] font-bold shadow-xs py-0.5 px-2.5">
              FREE TIER
            </Badge>
          ) : (
            <Badge className="bg-blue-900 text-white text-[11px] font-bold shadow-xs py-0.5 px-2.5 gap-1.5">
              <Crown className="size-3 text-amber-300" /> PRO EXCLUSIVE
            </Badge>
          )}
          {template.id === "overleaf-faang" && (
            <Badge variant="outline" className="bg-slate-900/90 text-white border-white/30 text-[10px] font-bold py-0.5 px-2">
              Official LaTeX
            </Badge>
          )}
        </div>

        {/* Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom(template);
          }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-bold backdrop-blur-xs shadow-md transition-all"
        >
          <ZoomIn className="size-3.5" /> Full Zoom
        </button>

        {/* Pro Lock overlay badge */}
        {isLocked && (
          <div className="absolute bottom-3 left-3">
            <div className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5 border border-white/20">
              <Lock className="size-3.5 text-amber-400" /> Unlock with Pro
            </div>
          </div>
        )}
      </div>

      {/* Details & Action Controls */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              {template.rating} ({template.reviewCount})
            </span>
            <Badge variant="outline" className="text-[11px] font-semibold py-0.5 px-2">
              {template.category}
            </Badge>
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
            className="h-9 text-xs sm:text-sm flex-1 font-bold"
            onClick={() => onSelect(template)}
          >
            {isLocked ? (
              <>
                <Lock className="size-3.5 mr-1 text-amber-500" /> Unlock Pro
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
            className="h-9 text-xs sm:text-sm px-3 font-semibold text-blue-700 dark:text-blue-300"
            onClick={() => onDownloadWord(template)}
            title="Download Word format (.doc)"
          >
            <FileDown className="size-4 mr-1" /> Word
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 text-xs sm:text-sm px-3 font-bold"
            onClick={() => onDownloadPdf(template)}
            title="Download PDF"
          >
            <Download className="size-4 mr-1" /> PDF
            {!isSubscribed && <Lock className="size-3 text-amber-500 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
});
