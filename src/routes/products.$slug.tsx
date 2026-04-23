import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/useCart";
import { useWishlist } from "@/lib/useWishlist";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "@/components/ProductReviews";
import { Star, Minus, Plus, Heart, Truck, Shield } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="container py-20 text-center">
      <h1 className="font-display text-3xl mb-4">Product not found</h1>
      <Link to="/products" className="text-gold underline">
        Back to all products
      </Link>
    </div>
  ),
});

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  image_url: string | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
};

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="grid md:grid-cols-2 gap-12 mt-6">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ingredients" | "how">("desc");
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setP(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;
  if (!p) return notFound();

  const onSale = p.sale_price && p.sale_price < p.price;
  const gallery = [p.image_url, ...(p.images ?? [])].filter(
    (x): x is string => typeof x === "string" && x.length > 0,
  );
  const currentImg = gallery[activeImg] ?? p.image_url;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/products" className="text-sm text-muted-foreground hover:text-gold">
        ← Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-6">
        <div className="reveal-on-scroll">
          <div className="luxe-card rounded-2xl overflow-hidden aspect-square bg-secondary relative">
            {currentImg && (
              <img
                key={currentImg}
                src={currentImg}
                alt={p.name}
                onLoad={(e) => e.currentTarget.classList.add("loaded")}
                className="gallery-fade w-full h-full object-cover"
              />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i
                      ? "border-gold scale-105"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="reveal-on-scroll stagger-1">
          {p.brand && (
            <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">
              {p.brand}
            </p>
          )}
          <h1 className="font-display text-4xl mb-4">{p.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            {p.rating && (
              <span className="flex items-center gap-1 text-sm">
                <Star size={14} className="fill-current" style={{ color: "var(--gold)" }} />
                {p.rating} <span className="text-muted-foreground">({p.review_count} reviews)</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            {onSale ? (
              <>
                <span className="font-display text-4xl text-gold">${p.sale_price?.toFixed(2)}</span>
                <span className="text-lg text-muted-foreground line-through">
                  ${p.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-display text-4xl">${p.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">{p.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 hover:text-gold"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:text-gold">
                <Plus size={16} />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90"
              onClick={() => addItem(p.id, qty)}
              disabled={p.stock === 0}
            >
              {p.stock === 0 ? "Out of stock" : "Add to bag"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`border-gold ${isWishlisted(p.id) ? "bg-gold/10" : ""}`}
              onClick={() => toggle(p.id)}
              aria-label={isWishlisted(p.id) ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart
                size={18}
                className={isWishlisted(p.id) ? "fill-current" : ""}
                style={{ color: "var(--gold)" }}
              />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck size={14} style={{ color: "var(--gold)" }} /> Free shipping over $80
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield size={14} style={{ color: "var(--gold)" }} /> Authentic guaranteed
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex gap-6 mb-4 text-sm">
              {[
                { id: "desc", label: "Description" },
                { id: "ingredients", label: "Ingredients" },
                { id: "how", label: "How to use" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as "desc" | "ingredients" | "how")}
                  className={`pb-2 border-b-2 ${tab === t.id ? "border-gold text-gold" : "border-transparent text-muted-foreground"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {tab === "desc" && p.description}
              {tab === "ingredients" && (p.ingredients ?? "Ingredient list coming soon.")}
              {tab === "how" && (p.how_to_use ?? "Application guide coming soon.")}
            </div>
          </div>
        </div>
        <ProductReviews productId={p.id} />
      </div>
    </div>
  );
}
