import { useState, useEffect } from "react";
import { Sparkles, Cpu, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumeSkeletonProps {
  statusText?: string;
  className?: string;
}

const GENERATION_STEPS = [
  "Analyzing job description & extracting technical keywords...",
  "Infiltrating high-weight competencies into experience bullet points...",
  "Synthesizing quantified metrics & FAANG-benchmarked achievements...",
  "Activating ATS Stealth Cloak™ white-font keyword injection...",
  "Compiling Overleaf LaTeX & formatting executive vector document...",
];

export function ResumeSkeleton({ statusText, className = "" }: ResumeSkeletonProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % GENERATION_STEPS.length);
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 14) + 6;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full rounded-2xl border border-border bg-card/70 backdrop-blur-md p-5 sm:p-8 shadow-xl transition-all animate-in fade-in duration-300 ${className}`}
    >
      {/* Live AI Engine Processing Header */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm animate-pulse">
              <Sparkles className="size-4 animate-spin duration-1000" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  ATS Synthesizer Live
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <Cpu className="size-3" /> 100% Match Engine
                </span>
              </div>
              <p className="text-xs text-foreground/90 font-medium mt-0.5 transition-all">
                {statusText || GENERATION_STEPS[stepIndex]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="font-mono text-xs font-bold text-primary">{progress}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Simulated Document Canvas Skeleton */}
      <div className="space-y-6 rounded-xl border border-border/60 bg-background/50 p-6 sm:p-8 shadow-inner">
        {/* Candidate Header */}
        <div className="space-y-2.5 pb-4 border-b border-border/40">
          <Skeleton className="h-7 w-48 sm:w-64 rounded-lg bg-primary/20" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-28 rounded-md" />
          </div>
        </div>

        {/* Executive Summary Block */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32 rounded bg-primary/20" />
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-[94%] rounded" />
          <Skeleton className="h-3 w-[88%] rounded" />
          <Skeleton className="h-3 w-[65%] rounded" />
        </div>

        {/* Categorized Skills Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded bg-primary/20" />
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-lg bg-primary/15" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded-lg bg-primary/15" />
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-6 w-36 rounded-lg bg-primary/15" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        </div>

        {/* Professional Experience with Bullet Points */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-40 rounded bg-primary/20" />
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-44 rounded font-semibold" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-3 w-32 rounded" />

            <div className="space-y-1.5 pl-3 border-l-2 border-primary/20 mt-2">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary/50 shrink-0" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary/50 shrink-0" />
                <Skeleton className="h-3 w-[92%] rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary/50 shrink-0" />
                <Skeleton className="h-3 w-[96%] rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary/50 shrink-0" />
                <Skeleton className="h-3 w-[78%] rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* ATS Stealth Cloak Verification Badge */}
        <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Verified against Workday, Greenhouse, Lever, and Taleo algorithms</span>
        </div>
      </div>
    </div>
  );
}
