import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Shield, Heart } from "lucide-react";
import heroImg from "@/assets/hero-luxury.jpg";

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
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Luxury K-beauty serums"
            className="w-full h-full object-cover opacity-60"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-32 md:py-44 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-gold rounded-full text-xs tracking-widest text-gold">
            <Sparkles size={12} /> NEW SEASON · K-BEAUTY EDIT
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6">
            The art of <span className="text-gold italic">glass skin</span>, distilled.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            Discover our curated edit of luxury Korean cosmetics — from gold-infused serums to dewy
            cushions, handpicked from Seoul's most coveted ateliers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products">
              <Button
                size="lg"
                className="bg-gradient-gold text-primary-foreground hover:opacity-90 px-8"
              >
                Shop the Edit
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
              >
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, t: "Free Worldwide Shipping", s: "On orders over $80" },
            { icon: Shield, t: "Authentic Guarantee", s: "Sourced direct from Seoul" },
            { icon: Heart, t: "Cruelty-Free", s: "Always & forever" },
            { icon: Sparkles, t: "AI Beauty Advisor", s: "24/7 personal guidance" },
          ].map((f) => (
            <div key={f.t} className="flex flex-col items-center gap-1">
              <f.icon className="w-5 h-5 mb-1" style={{ color: "var(--gold)" }} />
              <p className="text-xs font-semibold tracking-wider">{f.t}</p>
              <p className="text-[10px] text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-gold mb-3">SHOP BY CATEGORY</p>
          <h2 className="font-display text-4xl md:text-5xl">Curated for every ritual</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="luxe-card rounded-xl p-6 text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="text-primary-foreground" size={24} />
              </div>
              <p className="font-display text-lg group-hover:text-gold transition-colors">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] text-gold mb-3">BESTSELLERS</p>
            <h2 className="font-display text-4xl md:text-5xl">The Editor's Edit</h2>
          </div>
          <Link to="/products" className="hidden md:block text-sm text-gold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container mx-auto px-4 py-12">
        <div className="luxe-card rounded-2xl p-12 text-center bg-gradient-to-br from-card to-secondary border-gold">
          <Sparkles className="mx-auto mb-4" size={32} style={{ color: "var(--gold)" }} />
          <h3 className="font-display text-3xl md:text-4xl mb-3">20% off orders over $80</h3>
          <p className="text-muted-foreground mb-6">
            Use code <span className="text-gold font-mono font-bold tracking-widest">GLOW20</span>{" "}
            at checkout
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground">
              Shop now
            </Button>
          </Link>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gold mb-3">JUST IN</p>
            <h2 className="font-display text-4xl md:text-5xl">New arrivals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
