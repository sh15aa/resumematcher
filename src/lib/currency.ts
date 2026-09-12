import { useEffect, useState, useMemo } from "react";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyFormatted: string;
  annualFormatted: string;
  savingsPercentage: number;
  countryName: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    monthlyPrice: 199,
    annualPrice: 1600,
    monthlyFormatted: "₹199",
    annualFormatted: "₹1,600",
    savingsPercentage: 79,
    countryName: "India",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    monthlyPrice: 9.99,
    annualPrice: 49,
    monthlyFormatted: "$9.99",
    annualFormatted: "$49",
    savingsPercentage: 59,
    countryName: "United States",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    monthlyPrice: 9.49,
    annualPrice: 49,
    monthlyFormatted: "€9.49",
    annualFormatted: "€49",
    savingsPercentage: 57,
    countryName: "Eurozone",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    monthlyPrice: 7.99,
    annualPrice: 39,
    monthlyFormatted: "£7.99",
    annualFormatted: "£39",
    savingsPercentage: 59,
    countryName: "United Kingdom",
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    monthlyPrice: 13.49,
    annualPrice: 65,
    monthlyFormatted: "CA$13.49",
    annualFormatted: "CA$65",
    savingsPercentage: 60,
    countryName: "Canada",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    monthlyPrice: 14.99,
    annualPrice: 75,
    monthlyFormatted: "A$14.99",
    annualFormatted: "A$75",
    savingsPercentage: 58,
    countryName: "Australia",
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    monthlyPrice: 13.99,
    annualPrice: 69,
    monthlyFormatted: "S$13.99",
    annualFormatted: "S$69",
    savingsPercentage: 59,
    countryName: "Singapore",
  },
  AED: {
    code: "AED",
    symbol: "AED ",
    name: "UAE Dirham",
    flag: "🇦🇪",
    monthlyPrice: 36.99,
    annualPrice: 179,
    monthlyFormatted: "AED 36.99",
    annualFormatted: "AED 179",
    savingsPercentage: 60,
    countryName: "United Arab Emirates",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    monthlyPrice: 1480,
    annualPrice: 7400,
    monthlyFormatted: "¥1,480",
    annualFormatted: "¥7,400",
    savingsPercentage: 58,
    countryName: "Japan",
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    flag: "🇧🇷",
    monthlyPrice: 49.9,
    annualPrice: 249,
    monthlyFormatted: "R$49.90",
    annualFormatted: "R$249",
    savingsPercentage: 58,
    countryName: "Brazil",
  },
  CHF: {
    code: "CHF",
    symbol: "CHF ",
    name: "Swiss Franc",
    flag: "🇨🇭",
    monthlyPrice: 9.9,
    annualPrice: 49,
    monthlyFormatted: "CHF 9.90",
    annualFormatted: "CHF 49",
    savingsPercentage: 59,
    countryName: "Switzerland",
  },
};

const STORAGE_KEY = "resumematcher:currency:v1";

/**
 * Detect user's country and corresponding currency from timezone & locale.
 */
export function detectUserCurrency(): string {
  if (typeof window === "undefined") return "USD";

  // Check manual user selection first
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_CURRENCIES[saved]) return saved;
  } catch {
    /* storage error ignored */
  }

  // Detect via Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("India")) {
      return "INR";
    }
    if (tz.includes("London")) {
      return "GBP";
    }
    if (
      tz.includes("Berlin") ||
      tz.includes("Paris") ||
      tz.includes("Rome") ||
      tz.includes("Madrid") ||
      tz.includes("Amsterdam") ||
      tz.includes("Brussels") ||
      tz.includes("Vienna") ||
      tz.includes("Dublin") ||
      tz.includes("Lisbon") ||
      tz.includes("Helsinki") ||
      tz.includes("Stockholm") ||
      tz.includes("Athens") ||
      tz.includes("Warsaw") ||
      tz.includes("Prague")
    ) {
      return "EUR";
    }
    if (
      tz.includes("Toronto") ||
      tz.includes("Vancouver") ||
      tz.includes("Montreal") ||
      tz.includes("Edmonton") ||
      tz.includes("Winnipeg") ||
      tz.includes("Halifax")
    ) {
      return "CAD";
    }
    if (
      tz.includes("Sydney") ||
      tz.includes("Melbourne") ||
      tz.includes("Brisbane") ||
      tz.includes("Perth") ||
      tz.includes("Adelaide")
    ) {
      return "AUD";
    }
    if (tz.includes("Singapore")) {
      return "SGD";
    }
    if (tz.includes("Dubai")) {
      return "AED";
    }
    if (tz.includes("Tokyo")) {
      return "JPY";
    }
    if (tz.includes("Sao_Paulo") || tz.includes("Rio_Branco") || tz.includes("Fortaleza")) {
      return "BRL";
    }
    if (tz.includes("Zurich")) {
      return "CHF";
    }
  } catch {
    /* ignore timezone resolution errors */
  }

  // Secondary detect via navigator.language
  try {
    const lang = (navigator.language || "").toLowerCase();
    if (lang.includes("-in") || lang.startsWith("hi")) return "INR";
    if (lang.includes("-gb")) return "GBP";
    if (lang.includes("-ca")) return "CAD";
    if (lang.includes("-au")) return "AUD";
    if (lang.includes("-sg")) return "SGD";
    if (lang.includes("-ae") || lang.startsWith("ar")) return "AED";
    if (lang.includes("-jp") || lang.startsWith("ja")) return "JPY";
    if (lang.includes("-br") || lang.startsWith("pt")) return "BRL";
    if (lang.includes("-ch")) return "CHF";
    if (
      lang.includes("-de") ||
      lang.includes("-fr") ||
      lang.includes("-es") ||
      lang.includes("-it") ||
      lang.includes("-nl")
    ) {
      return "EUR";
    }
  } catch {
    /* ignore */
  }

  return "USD";
}

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState<string>(() => detectUserCurrency());

  useEffect(() => {
    const detected = detectUserCurrency();
    setCurrencyCode(detected);
  }, []);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCode(code);
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* storage error ignored */
      }
    }
  };

  const currency = useMemo(() => {
    return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES["USD"]!;
  }, [currencyCode]);

  return {
    currency,
    currencyCode,
    setCurrency,
    currenciesList: Object.values(SUPPORTED_CURRENCIES),
  };
}
