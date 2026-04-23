import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Shield, Heart } from "lucide-react";
import heroImg from "@/assets/hero-luxury.jpg";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GLOW — Luxury Korean Beauty Boutique" },
      {
        name: "description",
        content:
          "Discover premium K-beauty essentials handpicked from Seoul. Skincare, makeup, sun care and curated sets.",
      },
    ],
  }),
  component: Index,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  rating: number | null;
  is_new: boolean | null;
};
type Category = { id: string; name: string; slug: string; description: string | null };

function Index() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useI18n();
  const { fmt } = useCurrency();

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
      .eq("featured", true)
      .limit(8)
      .then(({ data }) => setFeatured(data ?? []));
    supabase
      .from("products")
      .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
      .eq("is_new", true)
      .limit(4)
      .then(({ data }) => setNewest(data ?? []));
    supabase
      .from("categories")
      .select("id,name,slug,description")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  return (
    <div className="bg-mesh">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Luxury K-beauty serums"
            className="w-full h-full object-cover opacity-50 scale-105"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
          <div
            className="orb"
            style={{
              width: 400,
              height: 400,
              background: "var(--gold)",
              top: "-100px",
              left: "10%",
            }}
          />
          <div
            className="orb"
            style={{
              width: 300,
              height: 300,
              background: "oklch(0.62 0.18 25)",
              bottom: "-80px",
              right: "15%",
              animationDelay: "3s",
            }}
          />
        </div>
        <div className="relative container mx-auto px-4 py-32 md:py-48 max-w-3xl">
          <div className="reveal inline-flex items-center gap-2 mb-6 px-4 py-1.5 glass rounded-full text-[11px] tracking-[0.3em] gold-ring">
            <Sparkles size={12} className="animate-pulse" style={{ color: "var(--gold)" }} />
            <span className="text-gold">{t("home.newSeason")}</span>
          </div>
          <h1 className="reveal reveal-delay-1 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] mb-6">
            {t("home.heroTitle1")}{" "}
            <span className="text-gold-shine italic">{t("home.heroTitle2")}</span>,<br />
            {t("home.heroTitle3")}
          </h1>
          <p className="reveal reveal-delay-2 text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            {t("home.heroDesc")}
          </p>
          <div className="reveal reveal-delay-3 flex flex-wrap gap-3">
            <Link to="/products">
              <Button
                size="lg"
                className="btn-luxe bg-gradient-gold text-primary-foreground hover:opacity-95 px-8 shadow-gold"
              >
                {t("home.shopEdit")}
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10 backdrop-blur"
              >
                {t("home.ourStory")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND MARQUEE */}
      <section className="border-y border-border/50 py-6 bg-card/20">
        <div className="marquee">
          <div className="marquee-track text-muted-foreground/60 font-display italic text-2xl md:text-3xl">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-16 whitespace-nowrap px-8">
                <span>SULWHASOO</span>
                <span className="text-gold">✦</span>
                <span>LANEIGE</span>
                <span className="text-gold">✦</span>
                <span>BEAUTY OF JOSEON</span>
                <span className="text-gold">✦</span>
                <span>COSRX</span>
                <span className="text-gold">✦</span>
                <span>HERA</span>
                <span className="text-gold">✦</span>
                <span>INNISFREE</span>
                <span className="text-gold">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-border/50 bg-card/20">
        <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, t: t("trust.freeShipping"), s: t("trust.freeShippingDesc") },
            { icon: Shield, t: t("trust.authentic"), s: t("trust.authenticDesc") },
            { icon: Heart, t: t("trust.crueltyFree"), s: t("trust.crueltyFreeDesc") },
            { icon: Sparkles, t: t("trust.advisor"), s: t("trust.advisorDesc") },
          ].map((f) => (
            <div key={f.t} className="hover-float flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 mb-1 rounded-full glass flex items-center justify-center">
                <f.icon className="w-4 h-4" style={{ color: "var(--gold)" }} />
              </div>
              <p className="text-xs font-semibold tracking-wider">{f.t}</p>
              <p className="text-[10px] text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-12 reveal-on-scroll">
          <p className="text-xs tracking-[0.3em] text-gold mb-3">{t("home.shopByCategory")}</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
            {t("home.curatedRitual")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((c, i) => (
            <div key={c.id} className={`reveal-on-scroll stagger-${(i % 4) + 1}`}>
              <Link
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="luxe-card rounded-xl p-5 md:p-6 text-center group block"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="text-primary-foreground" size={22} />
                </div>
                <p className="font-display text-base md:text-lg group-hover:text-gold transition-colors">
                  {c.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10 md:mb-12 reveal-on-scroll">
          <div>
            <p className="text-xs tracking-[0.3em] text-gold mb-3">{t("home.bestsellers")}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
              {t("home.editorsEdit")}
            </h2>
          </div>
          <Link to="/products" className="hidden md:block text-sm text-gold hover:underline">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => (
            <div key={p.id} className={`reveal-on-scroll stagger-${(i % 4) + 1}`}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container mx-auto px-4 py-12">
        <div className="relative luxe-card rounded-2xl p-8 md:p-12 text-center overflow-hidden gold-ring reveal-on-scroll">
          <div
            className="orb"
            style={{
              width: 250,
              height: 250,
              background: "var(--gold)",
              top: "-60px",
              left: "20%",
              opacity: 0.25,
            }}
          />
          <div className="relative">
            <Sparkles
              className="mx-auto mb-4 animate-pulse"
              size={32}
              style={{ color: "var(--gold)" }}
            />
            <h3 className="font-display text-2xl sm:text-3xl md:text-5xl mb-3">
              {t("home.promoTitle1")} <span className="text-gold-shine">{fmt(80)}</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("home.promoDesc")}{" "}
              <span className="text-gold font-mono font-bold tracking-widest">
                {t("home.promoCode")}
              </span>{" "}
              {t("home.promoAt")}
            </p>
            <Link to="/products">
              <Button
                size="lg"
                className="btn-luxe bg-gradient-gold text-primary-foreground shadow-gold"
              >
                {t("home.shopNow")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-10 md:mb-12 reveal-on-scroll">
            <p className="text-xs tracking-[0.3em] text-gold mb-3">{t("home.justIn")}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
              {t("home.newArrivals")}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newest.map((p, i) => (
              <div key={p.id} className={`reveal-on-scroll stagger-${(i % 4) + 1}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <NewsletterSignup />

      {/* RECENTLY VIEWED */}
      <RecentlyViewedSection />
    </div>
  );
}
