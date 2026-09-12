import React, { memo } from "react";
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

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border-2 transition-all bg-card shadow-xs overflow-hidden ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-primary/60 hover:shadow-sm"
      }`}
    >
      {/* High-Resolution Miniature Preview */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-border">
        <div
          className="cursor-pointer origin-top-left w-full h-full"
          onClick={() => onSelect(template)}
        >
          <iframe
            title={`${template.name} preview`}
            srcDoc={renderResumeHtml(resumeText, template, applicant)}
            loading="lazy"
            className="h-[1100px] w-[850px] origin-top-left border-0 pointer-events-none"
            style={{ transform: "scale(0.38)", willChange: "transform" }}
            tabIndex={-1}
          />
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Check className="size-4 stroke-[3]" />
          </div>
        )}

        {/* Tier badge */}
        <div className="absolute top-3 left-3">
          {template.isFree ? (
            <Badge className="bg-emerald-600 text-white text-[11px] font-bold shadow-xs py-0.5 px-2.5">
              FREE TIER
            </Badge>
          ) : (
            <Badge className="bg-blue-900 text-white text-[11px] font-bold shadow-xs py-0.5 px-2.5 gap-1.5">
              <Crown className="size-3 text-amber-300" /> PRO EXCLUSIVE
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
