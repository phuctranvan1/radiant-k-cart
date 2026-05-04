import { Link } from "@tanstack/react-router";
import { Sparkles, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TIKTOK_ICON = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border mt-24">
      {/* Gold divider top */}
      <div className="gold-divider" />

      <div className="bg-card/40">
        <div className="container mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <Sparkles
                className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500"
                style={{ color: "var(--gold)" }}
              />
              <span className="font-display text-2xl font-semibold text-gold-shine">GLOW</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t("footer.desc")}</p>
            <div className="flex gap-3 mt-4">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter / X" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: TIKTOK_ICON, label: "TikTok" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/60 border border-border/40 transition-all hover-float"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Payment badges */}
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {["VISA", "MC", "AMEX", "PayPal"].map((b) => (
                <span
                  key={b}
                  className="text-[9px] font-bold tracking-wider px-2 py-1 rounded border border-border/60 text-muted-foreground/60"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg mb-4 text-gold">{t("footer.shop")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-foreground transition-colors">
                  {t("nav.allProducts")}
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/$slug"
                  params={{ slug: "skincare" }}
                  className="hover:text-foreground transition-colors"
                >
                  {t("nav.skincare")}
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/$slug"
                  params={{ slug: "makeup" }}
                  className="hover:text-foreground transition-colors"
                >
                  {t("nav.makeup")}
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/$slug"
                  params={{ slug: "sets-gifts" }}
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.setsGifts")}
                </Link>
              </li>
              <li>
                <Link to="/bundles" className="hover:text-foreground transition-colors">
                  Bundles
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-foreground transition-colors">
                  {t("nav.wishlist")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-4 text-gold">{t("footer.help")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-foreground transition-colors">
                  {t("footer.support")}
                </Link>
              </li>
              <li>
                <Link to="/order-lookup" className="hover:text-foreground transition-colors">
                  {t("nav.trackOrder")}
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-foreground transition-colors">
                  {t("footer.shippingReturns")}
                </Link>
              </li>
              <li>
                <Link to="/skin-quiz" className="hover:text-foreground transition-colors">
                  Skin Quiz
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="hover:text-foreground transition-colors">
                  Refer & Earn
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-4 text-gold">{t("footer.brand")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="hover:text-foreground transition-colors">
                  {t("nav.lookbook")}
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-foreground transition-colors">
                  Rewards
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-foreground transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="gold-divider" />
      <div className="bg-card/20">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </span>
          <div className="flex items-center gap-1 text-[10px] tracking-widest">
            <Sparkles size={10} style={{ color: "var(--gold)" }} />
            <span className="text-gold/60">HANDPICKED FROM SEOUL</span>
            <Sparkles size={10} style={{ color: "var(--gold)" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
