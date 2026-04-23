import { useState } from "react";
import { Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t("newsletter.invalidEmail"));
      return;
    }
    setSubmitted(true);
    toast.success(t("newsletter.successToast"));
  };

  return (
    <section className="container mx-auto px-4 py-12 reveal-on-scroll">
      <div className="relative luxe-card rounded-2xl p-8 md:p-14 text-center overflow-hidden">
        {/* Decorative orbs */}
        <div
          className="orb"
          style={{
            width: 220,
            height: 220,
            background: "var(--gold)",
            top: "-60px",
            right: "10%",
            opacity: 0.18,
          }}
        />
        <div
          className="orb"
          style={{
            width: 160,
            height: 160,
            background: "oklch(0.62 0.18 25)",
            bottom: "-40px",
            left: "5%",
            opacity: 0.15,
            animationDelay: "2s",
          }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 glass rounded-full text-[11px] tracking-[0.3em] gold-ring">
            <Mail size={12} style={{ color: "var(--gold)" }} />
            <span className="text-gold">{t("newsletter.badge")}</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl mb-3">
            {t("newsletter.heading")}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
            {t("newsletter.desc")}
          </p>

          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <Sparkles className="text-primary-foreground" size={24} />
              </div>
              <p className="font-display text-xl text-gold">{t("newsletter.thankYou")}</p>
              <p className="text-sm text-muted-foreground">{t("newsletter.thankYouDesc")}</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                required
                className="flex-1 bg-input border border-border rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
              />
              <Button
                type="submit"
                className="btn-luxe bg-gradient-gold text-primary-foreground shadow-gold rounded-full px-6 shrink-0"
              >
                {t("newsletter.cta")}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground/60 mt-5">{t("newsletter.privacy")}</p>
        </div>
      </div>
    </section>
  );
}
