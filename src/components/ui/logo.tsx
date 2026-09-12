import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

export function ResumeMatcherLogo({
  className = "",
  size = 32,
  showText = true,
  textSize = "text-base font-bold",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-xs ring-1 ring-primary/25 group transition-transform hover:scale-105"
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="logoSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Background tile */}
          <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#logoBg)" />

          {/* Resume document sheet */}
          <rect x="14" y="10" width="36" height="44" rx="4" fill="#ffffff" />
          <path d="M14 14 C14 12 16 10 18 10 L46 10 C48 10 50 12 50 14 L50 17 L14 17 Z" fill="#e2e8f0" />
          <rect x="19" y="21" width="18" height="3.5" rx="1.5" fill="#1e293b" />
          <rect x="19" y="27" width="26" height="1.5" rx="0.75" fill="#3b82f6" />
          <rect x="19" y="31.5" width="26" height="2" rx="1" fill="#94a3b8" />
          <rect x="19" y="35.5" width="21" height="2" rx="1" fill="#cbd5e1" />
          <rect x="19" y="39.5" width="24" height="2" rx="1" fill="#cbd5e1" />

          {/* 100% ATS Match Check Badge */}
          <circle cx="42" cy="42" r="9" fill="url(#logoAccent)" />
          <path
            d="M38 42 L41 45 L47 39"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* AI Sparkle */}
          <path
            d="M47 5 C47 9 49 11 53 11 C49 11 47 13 47 17 C47 13 45 11 41 11 C45 11 47 9 47 5 Z"
            fill="url(#logoSparkle)"
          />
        </svg>
      </div>

      {showText && (
        <span className={`tracking-tight text-foreground ${textSize}`}>
          Resume<span className="text-primary font-black">Matcher</span>
        </span>
      )}
    </div>
  );
}
