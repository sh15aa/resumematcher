/**
 * Adsterra & Site Monetization Configuration
 *
 * Adsterra Website ID: 6058315 (Domain: cv.fitt.workers.dev)
 */

export interface AdUnitConfig {
  /** 32-character key from Adsterra */
  key: string;
  /** Script URL from Adsterra */
  scriptUrl?: string;
  width: number;
  height: number;
}

export interface NativeBannerConfig {
  scriptUrl: string;
  containerId: string;
}

export interface AdsConfiguration {
  enabled: boolean;
  websiteId: string;
  /** Popunder script URL */
  popunderScriptUrl: string;
  /** Social Bar / In-Page Push script URL */
  socialBarScriptUrl: string;
  /** Smartlink URL */
  smartLinkUrl: string;
  /** Native Banner configuration (4:1 horizontal widget) */
  nativeBanner: NativeBannerConfig;
  /** Anti-Adblock Sync script URL (if separate) */
  antiAdblockScriptUrl: string;
  /** Banner ad units */
  banners: {
    /** Bottom full-width ad (728x90) */
    bottom: AdUnitConfig;
    /** Sidebar ad (300x250) */
    sidebar: AdUnitConfig;
    /** Sticky bottom mobile/desktop bar (320x50) */
    stickyBottom: AdUnitConfig;
    /** Skyscraper banner (160x600) */
    banner160x600: AdUnitConfig;
    /** Compact horizontal banner (468x60) */
    banner468x60: AdUnitConfig;
    /** Vertical banner (160x300) */
    banner160x300: AdUnitConfig;
  };
}

export const ADS_CONFIG: AdsConfiguration = {
  enabled: true,
  websiteId: "6058315",
  popunderScriptUrl: "https://boughwarrior.com/c6/ab/ed/c6abed052861f349f4dc0ac0061c1252.js",
  socialBarScriptUrl: "https://boughwarrior.com/11/b9/77/11b977b4736a6e5dffd7feb4513157be.js",
  smartLinkUrl: "https://boughwarrior.com/wjjsmu40h?key=22d5d727a748fba0b5ecfd2064c01928",
  nativeBanner: {
    scriptUrl: "https://boughwarrior.com/0372d8e050827ab890c8b90b9c00c926/invoke.js",
    containerId: "container-0372d8e050827ab890c8b90b9c00c926",
  },
  antiAdblockScriptUrl: "",
  banners: {
    bottom: {
      key: "1d0de5ac8f7def0908f1ecbe26ef0a4e",
      scriptUrl: "https://boughwarrior.com/1d0de5ac8f7def0908f1ecbe26ef0a4e/invoke.js",
      width: 728,
      height: 90,
    },
    sidebar: {
      key: "71edce7e2f32c162ff4554d749843c99",
      scriptUrl: "https://boughwarrior.com/71edce7e2f32c162ff4554d749843c99/invoke.js",
      width: 300,
      height: 250,
    },
    stickyBottom: {
      key: "7a54a326ce69b8105b1b3e70e4e41d5f",
      scriptUrl: "https://boughwarrior.com/7a54a326ce69b8105b1b3e70e4e41d5f/invoke.js",
      width: 320,
      height: 50,
    },
    banner160x600: {
      key: "86eb05e84515b1e0a448d6027e5c7505",
      scriptUrl: "https://boughwarrior.com/86eb05e84515b1e0a448d6027e5c7505/invoke.js",
      width: 160,
      height: 600,
    },
    banner468x60: {
      key: "4c29ad2a64bf44d4bab04510122b58e3",
      scriptUrl: "https://boughwarrior.com/4c29ad2a64bf44d4bab04510122b58e3/invoke.js",
      width: 468,
      height: 60,
    },
    banner160x300: {
      key: "4e732277286fef74dc3f03dc6359481c",
      scriptUrl: "https://boughwarrior.com/4e732277286fef74dc3f03dc6359481c/invoke.js",
      width: 160,
      height: 300,
    },
  },
};

/**
 * Normalizes Adsterra keys from either raw 32-char hex or entire <script> snippets.
 */
export function normalizeAdsterraKey(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  const match = trimmed.match(/['"]?key['"]?\s*:\s*['"]([a-f0-9]{24,40})['"]/i);
  if (match) return match[1];
  const hexMatch = trimmed.match(/[a-f0-9]{32}/i);
  if (hexMatch) return hexMatch[0];
  return trimmed;
}

/**
 * Normalizes script URLs from either raw URL or full <script src="..."> tags.
 */
export function normalizeScriptSrc(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  const srcMatch = trimmed.match(/src=['"]([^'"]+)['"]/i);
  if (srcMatch) return srcMatch[1];
  return trimmed;
}
