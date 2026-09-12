import { useState, useRef, useEffect, useMemo } from "react";
import { Download, FileDown, FileCode, Lock, Check, Star, X, ZoomIn, ZoomOut } from "lucide-react";
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

  useEffect(() => {
    setIsFitMode(true);
    setZoomDocHeight(1100);
  }, [template?.id]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === "RESUME_DOC_HEIGHT" && typeof e.data.height === "number") {
        const safeH = Math.min(15000, Math.max(1100, Math.ceil(e.data.height)));
        setZoomDocHeight(safeH);
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
    const updateDims = () => {
      if (canvasRef.current) {
        setContainerWidth(canvasRef.current.clientWidth);
        setContainerHeight(canvasRef.current.clientHeight);
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(canvasRef.current);
    window.addEventListener("resize", updateDims);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateDims);
    };
  }, []);

  const fitScale = useMemo(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      const availW = Math.max(260, containerWidth - 32);
      const availH = Math.max(260, containerHeight - 80);
      const scaleW = availW / 850;
      const scaleH = availH / Math.max(1100, zoomDocHeight);
      return Number(Math.min(scaleW, scaleH, 1).toFixed(3));
    }
    return 0.65;
  }, [containerWidth, containerHeight, zoomDocHeight]);

  const effectiveScale = useMemo(() => {
    if (isFitMode && fitScale > 0) {
      return fitScale;
    }
    if (containerWidth > 0) {
      const avail = Math.max(280, containerWidth - 32);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-x-hidden">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-muted/70 px-4 sm:px-6 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{template.name}</h3>
              {template.isFree ? (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px] sm:text-xs">FREE TIER</Badge>
              ) : (
                <Badge className="bg-blue-900 text-white font-bold text-[10px] sm:text-xs gap-1">
                  <Lock className="size-3 text-amber-300" /> PRO EXCLUSIVE
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] font-semibold">
                📄 {Math.max(1, Math.ceil(zoomDocHeight / 1100))} {Math.max(1, Math.ceil(zoomDocHeight / 1100)) === 1 ? "Page" : "Pages"} (Letter)
              </Badge>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 hidden sm:inline-flex items-center gap-1">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                {template.rating}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block truncate max-w-xl">
              {template.blurb}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 gap-0.5">
              <Button
                variant={isFitMode ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-[10px] font-bold"
                onClick={handleFitPage}
                title="Fit full page to window (100% visible)"
              >
                Fit
              </Button>
              <Button
                variant={!isFitMode && zoom === 100 ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-[10px] font-bold"
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
                className="size-7"
                onClick={() => {
                  setIsFitMode(false);
                  setZoom((z) => Math.max(40, z - 15));
                }}
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-[11px] font-semibold px-1 min-w-[36px] text-center">
                {isFitMode ? `${Math.round(fitScale * 100)}%` : `${zoom}%`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
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
              className="h-8 text-xs font-semibold px-2 sm:px-3"
              onClick={() => onDownloadWord(template)}
            >
              <FileDown className="size-3.5 sm:mr-1 text-blue-600" />
              <span className="hidden sm:inline">Word Free</span>
            </Button>

            {onDownloadLatex && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 sm:px-3"
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
              className="h-8 text-xs font-bold px-2.5 sm:px-3"
              onClick={() => onDownloadPdf(template)}
            >
              <Download className="size-3.5 sm:mr-1" />
              <span>PDF</span>
              {!isSubscribed && <Lock className="size-3 ml-1 text-amber-300" />}
            </Button>

            <Button
              size="sm"
              className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 sm:px-3"
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
          className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-200/60 dark:bg-slate-950/60 p-2 sm:p-4 pb-8 sm:pb-10 flex flex-col items-center justify-start w-full"
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
            className="mx-auto rounded shadow-2xl bg-white transition-all duration-150 mb-4"
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
                srcDoc={renderResumeHtml(resumeText, template, applicant)}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
                className="w-[850px] border-0"
                style={{ height: `${zoomDocHeight}px` }}
                onLoad={(e) => {
                  try {
                    const doc = e.currentTarget.contentDocument;
                    if (doc) {
                      const page = doc.querySelector('.page');
                      if (page) {
                        const pageRect = page.getBoundingClientRect();
                        let maxB = 0;
                        const els = page.querySelectorAll('*');
                        for (let i = 0; i < els.length; i++) {
                          const el = els[i] as HTMLElement;
                          if (el.classList && (el.classList.contains('latex-underlying-format') || (el.classList.contains('ats-ghost-keywords') && !el.classList.contains('ats-ghost-keywords-xray')))) {
                            continue;
                          }
                          const r = el.getBoundingClientRect();
                          if (r.width === 0 && r.height === 0) continue;
                          const b = r.bottom - pageRect.top;
                          if (b > maxB) maxB = b;
                        }
                        if (maxB > 200) {
                          const totalContentH = Math.ceil(maxB + 25);
                          const pageCount = totalContentH <= 1080 ? 1 : Math.max(1, Math.ceil(totalContentH / 1100));
                          setZoomDocHeight(pageCount * 1100);
                        }
                      }
                    }
                  } catch {}
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
