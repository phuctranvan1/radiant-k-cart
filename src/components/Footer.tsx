import { Link } from "@tanstack/react-router";
import { Sparkles, Instagram, Twitter, Facebook } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border mt-24 bg-card/40">
      <div className="container mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
            <span className="font-display text-2xl font-semibold text-gold">GLOW</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.desc")}</p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Twitter size={18} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4 text-gold">{t("footer.shop")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                {t("nav.allProducts")}
              </Link>
            </li>
            <li>
              <Link
                to="/categories/$slug"
                params={{ slug: "skincare" }}
                className="hover:text-foreground"
              >
                {t("nav.skincare")}
              </Link>
            </li>
            <li>
              <Link
                to="/categories/$slug"
                params={{ slug: "makeup" }}
                className="hover:text-foreground"
              >
                {t("nav.makeup")}
              </Link>
            </li>
            <li>
              <Link
                to="/categories/$slug"
                params={{ slug: "sets-gifts" }}
                className="hover:text-foreground"
              >
                {t("footer.setsGifts")}
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-foreground">
                {t("nav.wishlist")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">{t("footer.help")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-foreground">
                {t("footer.contact")}
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-foreground">
                {t("footer.support")}
              </Link>
            </li>
            <li>
              <Link to="/order-lookup" className="hover:text-foreground">
                {t("nav.trackOrder")}
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                {t("footer.shippingReturns")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">{t("footer.brand")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                {t("footer.about")}
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                {t("footer.terms")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="gold-divider" />
      <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("footer.copyright")}
      </div>
    </footer>
  );
}
