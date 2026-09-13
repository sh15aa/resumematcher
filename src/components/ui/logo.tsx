import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

export function CVFittLogo({
  className = "",
  size = 32,
  showText = true,
  textSize = "text-base font-bold",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-xs ring-1 ring-white/10 group transition-all duration-200 hover:ring-primary/40 hover:scale-105"
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="CVFitt — 100% ATS Resume Matcher Logo"
        >
          <defs>
            <linearGradient id="cvfittBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121624" />
              <stop offset="60%" stopColor="#181e33" />
              <stop offset="100%" stopColor="#252d4a" />
            </linearGradient>
            <linearGradient id="cvfittAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="cvfittSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="cvfittCvBadge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="cvfittGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="1.5"
                floodColor="#000000"
                floodOpacity="0.4"
              />
            </filter>
          </defs>

          {/* Squircle base */}
          <rect x="0" y="0" width="64" height="64" rx="15" fill="url(#cvfittBg)" />

          {/* Outer subtle inner rim highlight */}
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="14"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1"
          />

          {/* Main CV Sheet with folded corner */}
          <g filter="url(#cvfittGlow)">
            {/* Sheet body */}
            <path
              d="M14 13 C14 10.5 15.5 9 18 9 L38 9 L48 19 L48 51 C48 53.5 46.5 55 44 55 L18 55 C15.5 55 14 53.5 14 51 Z"
              fill="#ffffff"
            />
            {/* Corner fold flap */}
            <path d="M38 9 L38 17 C38 18.5 39 19 40.5 19 L48 19 Z" fill="#e2e8f0" />
            <path d="M38 19 L48 19" stroke="#cbd5e1" strokeWidth="0.75" />

            {/* Stylized "CV" Monogram Pill */}
            <rect x="18" y="14" width="16" height="5.5" rx="2" fill="url(#cvfittCvBadge)" />
            <text
              x="26"
              y="18.2"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="4.2"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.4"
            >
              CV
            </text>

            {/* Content bars */}
            <rect x="18" y="23" width="26" height="2" rx="1" fill="#6366f1" />
            <rect x="18" y="27.5" width="26" height="2" rx="1" fill="#94a3b8" />
            <rect x="18" y="32" width="19" height="2" rx="1" fill="#cbd5e1" />
            <rect x="18" y="36.5" width="22" height="2" rx="1" fill="#cbd5e1" />
            <rect x="18" y="41" width="15" height="2" rx="1" fill="#e2e8f0" />

            {/* Precision 100% "Fitt" Target Check Badge */}
            <circle cx="42" cy="42" r="9.5" fill="url(#cvfittAccent)" />
            <circle
              cx="42"
              cy="42"
              r="9.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            {/* Checkmark */}
            <path
              d="M37.5 42 L40.5 45 L46.5 39"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Top Right AI Match Sparkle */}
          <path
            d="M48 4 C48 7.5 49.5 9 53 9 C49.5 9 48 10.5 48 14 C48 10.5 46.5 9 43 9 C46.5 9 48 7.5 48 4 Z"
            fill="url(#cvfittSparkle)"
          />
        </svg>
      </div>

      {showText && (
        <span className={`tracking-tight text-foreground font-semibold ${textSize}`}>
          CV<span className="text-primary font-black ml-0.5">Fitt</span>
        </span>
      )}
    </div>
  );
}

// Backward compatible export
export const ResumeMatcherLogo = CVFittLogo;
