"use client";

/**
 * CurrencyContext — Provides currency formatting across the site.
 *
 * Exchange rates are loaded from `site_settings` in Supabase so the
 * admin can update them without a code deploy (Settings → Currency tab).
 *
 * Falls back to reasonable hardcoded defaults if the DB fetch fails,
 * so the site never breaks if settings are temporarily unavailable.
 *
 * Base currency is NGN (all prices in the DB are stored in NGN).
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type CurrencyCode = "GBP" | "USD" | "EUR" | "NGN";

interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // How many units of this currency equal ₦1
}

interface CurrencyContextType {
  currency: Currency;
  allCurrencies: Record<CurrencyCode, Currency>;
  setCurrencyCode: (code: CurrencyCode) => void;
  formatPrice: (basePriceInNGN: number) => string;
}

// ─── Fallback rates (used if the DB fetch fails) ──────────────────────────────
const FALLBACK_RATES: Record<CurrencyCode, Currency> = {
  NGN: { code: "NGN", symbol: "₦", rate: 1       },
  GBP: { code: "GBP", symbol: "£",  rate: 0.00069 }, // Approx £1 = ₦1450
  USD: { code: "USD", symbol: "$",  rate: 0.00086 }, // Approx $1.25 = £1
  EUR: { code: "EUR", symbol: "€",  rate: 0.00081 }, // Approx €1.17 = £1
};

// ─── Context setup ────────────────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // The full currencies map — starts with fallback values, then DB values load in
  const [currencies, setCurrencies] = useState<Record<CurrencyCode, Currency>>(FALLBACK_RATES);
  const [currencyCode, setCurrencyState] = useState<CurrencyCode>("NGN");

  // ── On mount: load saved preference + fetch live rates from DB ──
  useEffect(() => {
    // 1. Restore the user's previously chosen currency
    const saved = localStorage.getItem("preferred_currency") as CurrencyCode;
    if (saved && FALLBACK_RATES[saved]) {
      setCurrencyState(saved);
    }

    // 2. Fetch exchange rates from site_settings
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["currency_usd_rate", "currency_eur_rate", "currency_gbp_rate"])
      .then(({ data, error }) => {
        if (error || !data) {
          // Silently fall back to hardcoded values — the site still works
          console.warn("[CurrencyContext] Could not load exchange rates from DB, using defaults.");
          return;
        }

        // Build an updated currencies map using DB values, keeping symbols from fallback
        const updated = { ...FALLBACK_RATES };
        for (const row of data) {
          const rate = parseFloat(row.value);
          if (!isNaN(rate) && rate > 0) {
            if (row.key === "currency_usd_rate") updated.USD = { ...updated.USD, rate };
            if (row.key === "currency_eur_rate") updated.EUR = { ...updated.EUR, rate };
            if (row.key === "currency_gbp_rate") updated.GBP = { ...updated.GBP, rate };
          }
        }
        setCurrencies(updated);
      });
  }, []);

  // ── When the user changes currency: save preference ──
  const setCurrencyCode = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("preferred_currency", code);
  };

  const currency = currencies[currencyCode];

  // ── Format a NGN price into the active currency ──
  const formatPrice = (basePriceInNGN: number): string => {
    const converted = basePriceInNGN * currency.rate;

    // NGN: no decimal places (values like ₦145,000 look better without .00)
    if (currency.code === "NGN") {
      return `${currency.symbol}${converted.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
    }

    return `${currency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, allCurrencies: currencies, setCurrencyCode, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
