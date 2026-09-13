import { useState, useRef, useEffect, useMemo } from "react";
import {
  Download,
  FileDown,
  FileCode,
  Lock,
  Check,
  ShieldCheck,
  Star,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_SAMPLE_RESUME_TEXT, renderResumeHtml, type ResumeTemplate } from "@/lib/templates";

interface TemplateZoomModalProps {
  template: ResumeTemplate | null;
  resumeText: string;
  applicant: string;
  isSubscribed: boolean;
  onClose: () => void;
  onSelect: (template: ResumeTemplate) => void;
  onDownloadWord: (template: ResumeTemplate) => void;
  onDownloadPdf: (template: ResumeTemplate) => void;
  onDownloadLatex?: ((template: ResumeTemplate) => void) | undefined;
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
  onDownloadLatex,
}: TemplateZoomModalProps) {
  const [isFitMode, setIsFitMode] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [zoomDocHeight, setZoomDocHeight] = useState(1100);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const effectiveResumeText =
    resumeText && resumeText.trim().length >= 15 ? resumeText : DEFAULT_SAMPLE_RESUME_TEXT;
  const effectiveApplicant =
    (!resumeText || resumeText.trim().length < 15) && (!applicant || applicant === "Your Name")
      ? "Alex Chen"
      : applicant;

  const srcDoc = useMemo(() => {
    return renderResumeHtml(effectiveResumeText, template, effectiveApplicant, undefined, false, {
      isInteractive: true,
      includeLatexLayer: false,
    });
  }, [template, effectiveResumeText, effectiveApplicant]);

  useEffect(() => {
    setIsFitMode(true);
    setZoomDocHeight(1100);
  }, [template?.id]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === "RESUME_DOC_HEIGHT" && typeof e.data.height === "number") {
        const safeH = Math.min(15000, Math.max(1100, Math.ceil(e.data.height)));
        setZoomDocHeight((prev) => (prev !== safeH ? safeH : prev));
      } else if (
        e.data &&
        e.data.type === "RESUME_WHEEL" &&
        typeof e.data.deltaY === "number" &&
        !isNaN(e.data.deltaY)
      ) {
        if (canvasRef.current) {
          const delta = Math.min(250, Math.max(-250, e.data.deltaY));
          canvasRef.current.scrollTop += delta;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let rafId: number | null = null;
    const updateDims = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (canvasRef.current) {
          const w = canvasRef.current.clientWidth;
          const h = canvasRef.current.clientHeight;
          setContainerWidth((prev) => (prev !== w ? w : prev));
          setContainerHeight((prev) => (prev !== h ? h : prev));
        }
      });
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(canvasRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const fitScale = useMemo(() => {
    if (containerWidth > 0) {
      const availW = Math.max(160, containerWidth - (containerWidth < 768 ? 16 : 48));
      const scaleW = availW / 850;
      return Number(Math.min(1.05, Math.max(0.15, scaleW)).toFixed(3));
    }
    return 0.85;
  }, [containerWidth]);

  const effectiveScale = useMemo(() => {
    if (isFitMode && fitScale > 0) {
      return fitScale;
    }
    if (containerWidth > 0) {
      const avail = Math.max(160, containerWidth - (containerWidth < 768 ? 16 : 32));
      const baseScale = Math.min(1, avail / 850);
      return Number((baseScale * (zoom / 100)).toFixed(3));
    }
    return Number((zoom / 100).toFixed(3));
  }, [isFitMode, fitScale, containerWidth, zoom]);

  const handleFitPage = () => {
    setIsFitMode(true);
    if (fitScale > 0) setZoom(Math.round(fitScale * 100));
  };

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-x-hidden">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-card px-4 sm:px-6 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                {template.name}
              </h3>
              {template.isFree ? (
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-semibold px-2 py-0.5">
                  FREE TIER
                </span>
              ) : (
                <span className="rounded-md bg-white/5 border border-white/10 text-slate-200 text-[10px] sm:text-xs font-semibold px-2 py-0.5 inline-flex items-center gap-1">
                  <Lock className="size-3 text-primary" /> PRO
                </span>
              )}
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-semibold px-2 py-0.5 inline-flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" />
                {template.id === "overleaf-faang" ||
                template.id === "google-swe" ||
                template.id === "citadel-quant" ||
                template.id === "harvard-hbs"
                  ? "100% ATS Verified"
                  : "99% ATS Verified"}
              </span>
              <Badge variant="outline" className="text-[10px] font-medium border-border/80">
                📄 {Math.max(1, Math.ceil(zoomDocHeight / 1100))}{" "}
                {Math.max(1, Math.ceil(zoomDocHeight / 1100)) === 1 ? "Page" : "Pages"} (Letter)
              </Badge>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline-flex items-center gap-1">
                <Star className="size-3.5 fill-slate-300 text-slate-300" />
                {template.rating}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block truncate max-w-xl">
              {template.blurb}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-xl border border-border bg-[#121624] p-0.5 shadow-xs">
              <Button
                variant={isFitMode ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs font-bold rounded-lg cursor-pointer"
                onClick={handleFitPage}
                title="Fit resume width to window (100% readable)"
              >
                Fit
              </Button>
              <Button
                variant={!isFitMode && zoom === 100 ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs font-bold rounded-lg cursor-pointer"
                onClick={() => {
                  setIsFitMode(false);
                  setZoom(100);
                }}
                title="Actual 100% size"
              >
                100%
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg cursor-pointer"
                onClick={() => {
                  setIsFitMode(false);
                  setZoom((z) => Math.max(40, z - 15));
                }}
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-xs font-bold px-1.5 min-w-[38px] text-center">
                {isFitMode ? `${Math.round(fitScale * 100)}%` : `${zoom}%`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg cursor-pointer"
                onClick={() => {
                  setIsFitMode(false);
                  setZoom((z) => Math.min(150, z + 15));
                }}
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 rounded-xl cursor-pointer"
              onClick={() => onDownloadWord(template)}
            >
              <FileDown className="size-3.5 sm:mr-1 text-blue-600" />
              <span className="hidden sm:inline">Word Free</span>
            </Button>

            {onDownloadLatex && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 sm:px-3 rounded-xl cursor-pointer"
                onClick={() => onDownloadLatex(template)}
                title="Download Overleaf FAANGPath LaTeX (.tex)"
              >
                <FileCode className="size-3.5 sm:mr-1" />
                <span className="hidden sm:inline">LaTeX (.tex)</span>
                <span className="sm:hidden">.tex</span>
              </Button>
            )}

            <Button
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm font-bold px-3 sm:px-3.5 rounded-xl cursor-pointer"
              onClick={() => onDownloadPdf(template)}
            >
              <Download className="size-3.5 sm:mr-1" />
              <span>PDF</span>
              {!isSubscribed && <Lock className="size-3 ml-1 text-primary" />}
            </Button>

            <Button
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-3.5 rounded-xl cursor-pointer"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              <Check className="size-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Apply Template</span>
              <span className="sm:hidden">Apply</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scalable Full Preview Canvas - 100% Centered with Zero Horizontal Overflow on Mobile */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-[#090A0F] p-2 sm:p-4 pb-8 sm:pb-10 flex flex-col items-center justify-start w-full max-w-full"
          style={{ overscrollBehaviorY: "contain", scrollbarWidth: "thin" }}
        >
          <div
            style={{
              width: `${Math.round(850 * effectiveScale)}px`,
              height: `${Math.round(zoomDocHeight * effectiveScale)}px`,
              maxWidth: "100%",
              position: "relative",
              overflow: "hidden",
            }}
            className="mx-auto rounded shadow-2xl bg-white transition-all duration-150 mb-4 w-full max-w-full transform-gpu"
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "850px",
                height: `${zoomDocHeight}px`,
                transform: `scale(${effectiveScale})`,
                transformOrigin: "top left",
                willChange: "transform",
              }}
              className="bg-white"
            >
              <iframe
                title={`${template.name} Full Preview`}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
                className="w-[850px] border-0"
                style={{ height: `${zoomDocHeight}px` }}
                onLoad={(e) => {
                  try {
                    const doc = e.currentTarget.contentDocument;
                    if (doc) {
                      const page = doc.querySelector(".page") as HTMLElement | null;
                      if (page) {
                        const scrollH = page.scrollHeight;
                        if (scrollH > 200) {
                          const pageCount =
                            scrollH <= 1080 ? 1 : Math.max(1, Math.ceil(scrollH / 1100));
                          const newH = pageCount * 1100;
                          setZoomDocHeight((prev) => (prev !== newH ? newH : prev));
                        }
                      }
                    }
                  } catch {
                    // ignore iframe cross-origin access
                  }
                }}
              />
            </div>

            {/* Visual Page Break Demarcation Guides for Multi-Page Documents */}
            {Array.from({ length: Math.floor((zoomDocHeight - 50) / 1100) }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: `${Math.round((idx + 1) * 1100 * effectiveScale)}px`,
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  pointerEvents: "none",
                }}
                className="flex items-center justify-center -translate-y-1/2"
              >
                <div className="w-full border-t border-slate-300 dark:border-slate-700 opacity-80" />
                <span className="absolute bg-slate-800 text-slate-100 text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  Page {idx + 2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
