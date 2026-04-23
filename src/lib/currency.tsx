import { createContext, useContext, useState, useCallback } from "react";

export type Currency = "USD" | "VND" | "KRW";

/** Static exchange rates relative to USD */
const RATES: Record<Currency, number> = {
  USD: 1,
  VND: 25000,
  KRW: 1350,
};

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  VND: "₫",
  KRW: "₩",
};

/** Number of decimal places per currency */
const DECIMALS: Record<Currency, number> = {
  USD: 2,
  VND: 0,
  KRW: 0,
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format a USD amount into the selected currency string */
  fmt: (usdAmount: number) => string;
  /** Convert a USD amount to the selected currency (raw number) */
  convert: (usdAmount: number) => number;
  symbol: string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "USD";
    return (localStorage.getItem("glow_currency") as Currency) ?? "USD";
  });

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    if (typeof window !== "undefined") localStorage.setItem("glow_currency", next);
  }, []);

  const convert = useCallback((usdAmount: number) => usdAmount * RATES[currency], [currency]);

  const fmt = useCallback(
    (usdAmount: number) => {
      const amount = usdAmount * RATES[currency];
      const decimals = DECIMALS[currency];
      const symbol = SYMBOLS[currency];
      const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (currency === "VND") return `${formatted} ${symbol}`;
      return `${symbol}${formatted}`;
    },
    [currency],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, fmt, convert, symbol: SYMBOLS[currency] }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
