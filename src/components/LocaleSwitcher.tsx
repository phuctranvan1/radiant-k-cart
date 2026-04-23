import { Globe } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { useCurrency, type Currency } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ko: "한국어",
};

const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "USD ($)",
  VND: "VND (₫)",
  KRW: "KRW (₩)",
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs px-2 text-muted-foreground hover:text-gold"
          aria-label="Language and currency"
        >
          <Globe size={15} />
          <span className="hidden sm:inline">{locale.toUpperCase()}</span>
          <span className="hidden sm:inline text-muted-foreground/50">·</span>
          <span className="hidden sm:inline">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Language
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([code, label]) => (
            <DropdownMenuRadioItem key={code} value={code} className="text-sm">
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Currency
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          {(Object.entries(CURRENCY_LABELS) as [Currency, string][]).map(([code, label]) => (
            <DropdownMenuRadioItem key={code} value={code} className="text-sm">
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
