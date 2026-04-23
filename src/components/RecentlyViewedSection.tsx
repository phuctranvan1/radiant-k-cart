import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import { useI18n } from "@/lib/i18n";
import { Clock } from "lucide-react";

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

export function RecentlyViewedSection() {
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    supabase
      .from("products")
      .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        // Preserve the recently viewed order
        const sorted = ids
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setProducts(sorted);
      });
  }, [ids]);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-10 md:mb-12 reveal-on-scroll">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold mb-3 flex items-center gap-2">
            <Clock size={12} style={{ color: "var(--gold)" }} />
            {t("recentlyViewed.label")}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
            {t("recentlyViewed.title")}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {products.map((p, i) => (
          <div key={p.id} className={`reveal-on-scroll stagger-${(i % 4) + 1}`}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
