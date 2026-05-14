import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { supabase } from "@/integrations/supabase/client";

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

export function PerfectPair({ productId }: { productId: string }) {
  const [synergy, setSynergy] = useState<{ product_id: string; reason: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchSynergy() {
      try {
        const { data, error } = await supabase.functions.invoke("generate-synergy", {
          body: { product_id: productId },
        });
        if (!error && data) setSynergy(data);
      } catch (e) {
        console.error("Synergy error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSynergy();
  }, [productId]);

  if (loading) return <div className="h-32 w-full animate-pulse bg-secondary rounded-2xl" />;
  if (!synergy) return null;

  return (
    <div className="luxe-card rounded-2xl p-6 border border-gold/20 relative overflow-hidden group reveal-on-scroll">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: "var(--gold)" }} />
            <span className="text-[10px] tracking-[0.3em] text-gold uppercase font-semibold">The Perfect Pair</span>
          </div>
          <p className="text-sm text-foreground/80 italic leading-relaxed mb-4">
            "{synergy.reason}"
          </p>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              className="btn-luxe bg-gradient-gold text-primary-foreground px-6"
              onClick={async () => {
                const { data: p } = await supabase.from("products").select("*").eq("id", synergy.product_id).single();
                if (p) addItem(p.id, 1);
              }}
            >
                        Add to Bag
            </Button>
            <div className="text-xs text-muted-foreground">
              Synergistically matched by GLOW AI
            </div>
          </div>
        </div>
        <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-secondary border border-gold/20">
          <img
            src={(await fetch(`https://radiant-k-cart.lovable.app/api/products/${synergy.product_id}`).then(r => r.json())).image_url}
            alt="Synergy Product"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
}
