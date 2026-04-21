import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/lib/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — GLOW" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, [ids]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">SAVED</p>
        <h1 className="font-display text-5xl mb-2">Your Wishlist</h1>
        <p className="text-muted-foreground text-sm">
          {ids.length} saved item{ids.length !== 1 ? "s" : ""}
        </p>
      </div>

      {ids.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="mx-auto mb-6" size={48} style={{ color: "var(--gold)" }} />
          <h2 className="font-display text-2xl mb-3">Nothing saved yet</h2>
          <p className="text-muted-foreground mb-8">Tap the ♡ on any product to save it here.</p>
          <Link to="/products">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground gap-2">
              <ShoppingBag size={18} /> Browse Products
            </Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ids.map((id) => (
            <div key={id} className="space-y-2">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
