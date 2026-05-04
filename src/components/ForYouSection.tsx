import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import { useWishlist } from "@/lib/useWishlist";
import { Sparkles } from "lucide-react";

export const QUIZ_PRODUCT_IDS_KEY = "glow_quiz_product_ids";

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

export function ForYouSection() {
  const { ids: recentIds } = useRecentlyViewed();
  const { ids: wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const quizIds: string[] = (() => {
      try {
        const stored = localStorage.getItem(QUIZ_PRODUCT_IDS_KEY);
        return stored ? (JSON.parse(stored) as string[]) : [];
      } catch {
        return [];
      }
    })();

    // Priority: quiz results → wishlist → recently viewed
    const allIds = [...new Set([...quizIds, ...wishlistIds, ...recentIds])];
    if (allIds.length === 0) return;

    supabase
      .from("products")
      .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
      .in("id", allIds)
      .limit(8)
      .then(({ data }) => {
        if (!data) return;
        const sorted = allIds
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is Product => !!p)
          .slice(0, 8);
        setProducts(sorted);
      });
  }, [recentIds, wishlistIds]);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-10 md:mb-12 reveal-on-scroll">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold mb-3 flex items-center gap-2">
            <Sparkles size={12} style={{ color: "var(--gold)" }} />
            PERSONALISED FOR YOU
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Your Edit</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <div key={p.id} className={`reveal-on-scroll stagger-${(i % 4) + 1}`}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
