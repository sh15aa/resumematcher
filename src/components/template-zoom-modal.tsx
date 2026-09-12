import { useState } from "react";
import { Download, FileDown, Lock, Check, Star, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderResumeHtml, type ResumeTemplate } from "@/lib/templates";

interface TemplateZoomModalProps {
  template: ResumeTemplate | null;
  resumeText: string;
  applicant: string;
  isSubscribed: boolean;
  onClose: () => void;
  onSelect: (template: ResumeTemplate) => void;
  onDownloadWord: (template: ResumeTemplate) => void;
  onDownloadPdf: (template: ResumeTemplate) => void;
}

export function TemplateZoomModal({
  template,
  resumeText,
  applicant,
  isSubscribed,
  onClose,
  onSelect,
  onDownloadWord,
  onDownloadPdf,
}: TemplateZoomModalProps) {
  const [zoom, setZoom] = useState(100);

  if (!template) return null;

  const isLocked = !template.isFree && !isSubscribed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/70 px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-foreground">{template.name}</h3>
              {template.isFree ? (
                <Badge className="bg-emerald-600 text-white font-bold text-xs">FREE TIER</Badge>
              ) : (
                <Badge className="bg-blue-900 text-white font-bold text-xs gap-1">
                  <Lock className="size-3 text-amber-300" /> PRO EXCLUSIVE
                </Badge>
              )}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                {template.rating} ({template.reviewCount})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{template.blurb}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-1 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setZoom((z) => Math.max(60, z - 15))}
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-xs font-semibold px-1 min-w-[42px] text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] px-2"
                onClick={() => setZoom(100)}
              >
                Reset
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs font-semibold"
              onClick={() => onDownloadWord(template)}
            >
              <FileDown className="size-3.5 mr-1 text-blue-600" /> Word (.doc) Free
            </Button>

            <Button
              size="sm"
              className="h-9 text-xs font-bold"
              onClick={() => onDownloadPdf(template)}
            >
              <Download className="size-3.5 mr-1" /> PDF
              {!isSubscribed && <Lock className="size-3 ml-1 text-amber-300" />}
            </Button>

            <Button
              size="sm"
              className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              <Check className="size-3.5 mr-1" /> Apply Template
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full ml-1 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Scalable Full Preview Canvas */}
        <div className="flex-1 overflow-auto bg-slate-200/60 dark:bg-slate-950/60 p-6 flex justify-center">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
            className="w-[850px] min-h-[1100px] bg-white shadow-2xl rounded-sm overflow-hidden mb-12"
          >
            <iframe
              title={`${template.name} Full Preview`}
              srcDoc={renderResumeHtml(resumeText, template, applicant)}
              className="w-[850px] h-[1100px] border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
