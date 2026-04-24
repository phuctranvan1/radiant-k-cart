import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, Loader2 } from "lucide-react";

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

export function AIRecommendations({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProducts([]);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("recommend", {
          body: { product_id: productId },
        });
        if (cancelled) return;
        if (error || !data?.ids?.length) {
          setLoading(false);
          return;
        }
        setReason(data.reason ?? "");
        const { data: prods } = await supabase
          .from("products")
          .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
          .in("id", data.ids);
        if (cancelled) return;
        // Preserve AI-suggested order
        const ordered = data.ids
          .map((id: string) => prods?.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setProducts(ordered);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3 inline-flex items-center gap-2">
          <Sparkles size={14} /> AI CURATED FOR YOU
        </p>
        <h2 className="font-display text-4xl">Complete your routine</h2>
        {reason && (
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto italic">{reason}</p>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
