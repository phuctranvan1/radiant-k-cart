import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/useCart";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Check, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bundles")({
  head: () => ({
    meta: [
      { title: "Curated Bundles — Save More | GLOW" },
      {
        name: "description",
        content:
          "Hand-curated K-beauty rituals at exclusive bundle pricing. Save up to 15% on complete routines.",
      },
    ],
  }),
  component: BundlesPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
};

type Bundle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number;
  featured: boolean;
  items: Product[];
};

function BundlesPage() {
  const { fmt } = useCurrency();
  const { add } = useCart();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: bData } = await supabase
        .from("bundles")
        .select("id,name,slug,description,image_url,discount_percent,featured")
        .eq("active", true)
        .order("featured", { ascending: false });
      const ids = (bData ?? []).map((b) => b.id);
      const { data: itemsData } = await supabase
        .from("bundle_items")
        .select("bundle_id,sort_order,product:products(id,name,slug,brand,price,sale_price,image_url)")
        .in("bundle_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
        .order("sort_order");

      const grouped: Bundle[] = (bData ?? []).map((b) => ({
        ...b,
        items:
          (itemsData ?? [])
            .filter((it: any) => it.bundle_id === b.id)
            .map((it: any) => it.product)
            .filter(Boolean) ?? [],
      }));
      setBundles(grouped);
      setLoading(false);
    })();
  }, []);

  const totalPrice = (b: Bundle) =>
    b.items.reduce((sum, p) => sum + (p.sale_price ?? p.price), 0);

  const addBundle = async (b: Bundle) => {
    setAdding(b.id);
    try {
      for (const p of b.items) await add(p.id, 1);
      toast.success(`${b.name} added to bag — save ${b.discount_percent}% at checkout`);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="overflow-hidden">
      <header className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div
          className="orb"
          style={{ top: "10%", right: "10%", width: 280, height: 280, background: "var(--gold)" }}
        />
        <div className="relative z-10 reveal">
          <p className="text-xs tracking-[0.5em] text-gold mb-4">CURATED RITUALS</p>
          <h1 className="font-display text-6xl md:text-7xl mb-4">
            <span className="text-gold-shine">Bundles</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete routines at exclusive prices. Save more when you commit to your ritual.
          </p>
          <div className="gold-divider w-20 mx-auto mt-6" />
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl pb-24 space-y-16">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading curated sets...</div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No bundles yet.</div>
        ) : (
          bundles.map((b) => {
            const subtotal = totalPrice(b);
            const discounted = subtotal * (1 - b.discount_percent / 100);
            return (
              <article
                key={b.id}
                className="luxe-card rounded-2xl overflow-hidden grid lg:grid-cols-5 gap-0 reveal-on-scroll"
              >
                <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto bg-secondary">
                  {b.image_url && (
                    <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                  )}
                  {b.featured && (
                    <span className="absolute top-4 left-4 text-[10px] tracking-[0.3em] bg-gradient-gold text-primary-foreground px-3 py-1.5 rounded-full font-semibold">
                      <Sparkles size={10} className="inline mr-1" /> EDITOR'S PICK
                    </span>
                  )}
                  <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-full">
                    <span className="font-display text-2xl text-gold">
                      −{b.discount_percent}%
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col">
                  <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-2">
                    <Package size={10} className="inline mr-1" /> {b.items.length} pieces
                  </p>
                  <h2 className="font-display text-4xl mb-3">{b.name}</h2>
                  {b.description && (
                    <p className="text-sm text-muted-foreground mb-6">{b.description}</p>
                  )}

                  <div className="space-y-3 mb-6 flex-1">
                    {b.items.map((p, i) => (
                      <Link
                        key={p.id}
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        className="flex items-center gap-4 group"
                      >
                        <span className="text-xs text-gold w-5">{i + 1}.</span>
                        <div className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0">
                          {p.image_url && (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {p.brand}
                          </p>
                          <p className="text-sm group-hover:text-gold transition-colors truncate">
                            {p.name}
                          </p>
                        </div>
                        <Check size={14} className="text-gold flex-shrink-0" />
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border pt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">{fmt(subtotal)}</p>
                      <p className="font-display text-3xl text-gold-shine">{fmt(discounted)}</p>
                      <p className="text-[10px] tracking-widest text-gold uppercase">
                        You save {fmt(subtotal - discounted)}
                      </p>
                    </div>
                    <Button
                      onClick={() => addBundle(b)}
                      disabled={adding === b.id || b.items.length === 0}
                      className="bg-gradient-gold text-primary-foreground"
                    >
                      <ShoppingBag size={16} className="mr-2" />
                      {adding === b.id ? "Adding..." : "Add bundle"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
