import { useEffect, useState } from "react";
import { useCompare } from "@/lib/useCompare";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCurrency } from "@/lib/currency";
import { Link } from "@tanstack/react-router";
import { X, GitCompareArrows, Star, Check, Minus } from "lucide-react";

type P = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  stock: number;
  ingredients: string | null;
  how_to_use: string | null;
  description: string | null;
};

export function CompareBar() {
  const { ids, remove, clear, open, setOpen } = useCompare();
  const { fmt } = useCurrency();
  const [products, setProducts] = useState<P[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    supabase
      .from("products")
      .select(
        "id,name,slug,brand,price,sale_price,image_url,rating,review_count,stock,ingredients,how_to_use,description",
      )
      .in("id", ids)
      .then(({ data }) => setProducts(data ?? []));
  }, [ids]);

  if (ids.length === 0) return null;

  const rows: { label: string; render: (p: P) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (p) =>
        p.sale_price ? (
          <span className="text-gold font-semibold">{fmt(p.sale_price)}</span>
        ) : (
          <span className="font-semibold">{fmt(p.price)}</span>
        ),
    },
    {
      label: "Rating",
      render: (p) =>
        p.rating ? (
          <span className="inline-flex items-center gap-1 text-sm">
            <Star size={12} className="fill-current" style={{ color: "var(--gold)" }} />
            {p.rating} <span className="text-muted-foreground">({p.review_count ?? 0})</span>
          </span>
        ) : (
          <Minus size={12} className="text-muted-foreground" />
        ),
    },
    {
      label: "In stock",
      render: (p) =>
        p.stock > 0 ? (
          <Check size={14} className="text-gold" style={{ color: "var(--gold)" }} />
        ) : (
          <Minus size={14} className="text-muted-foreground" />
        ),
    },
    {
      label: "Description",
      render: (p) => (
        <p className="text-xs text-muted-foreground line-clamp-3">{p.description || "—"}</p>
      ),
    },
    {
      label: "Ingredients",
      render: (p) => (
        <p className="text-xs text-muted-foreground line-clamp-3">{p.ingredients || "—"}</p>
      ),
    },
    {
      label: "How to use",
      render: (p) => (
        <p className="text-xs text-muted-foreground line-clamp-3">{p.how_to_use || "—"}</p>
      ),
    },
  ];

  return (
    <>
      {/* Floating bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 luxe-card rounded-full px-3 py-2 shadow-gold-lg flex items-center gap-3 reveal">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-gold text-primary-foreground text-xs font-semibold"
        >
          <GitCompareArrows size={14} />
          Compare ({ids.length})
        </button>
        <button
          onClick={clear}
          className="text-xs text-muted-foreground hover:text-foreground px-2"
          aria-label="Clear compare"
        >
          Clear
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-3xl">Compare Products</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `140px repeat(${products.length}, minmax(180px, 1fr))` }}>
            {/* Header row */}
            <div />
            {products.map((p) => (
              <div key={p.id} className="relative">
                <button
                  onClick={() => remove(p.id)}
                  aria-label="Remove"
                  className="absolute -top-1 -right-1 z-10 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:border-gold"
                >
                  <X size={12} />
                </button>
                <Link to="/products/$slug" params={{ slug: p.slug }} onClick={() => setOpen(false)}>
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  {p.brand && (
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                      {p.brand}
                    </p>
                  )}
                  <h3 className="font-display text-base leading-tight">{p.name}</h3>
                </Link>
              </div>
            ))}

            {/* Spec rows */}
            {rows.map((row) => (
              <>
                <div key={`label-${row.label}`} className="text-xs font-medium text-muted-foreground uppercase tracking-widest border-t border-border pt-3">
                  {row.label}
                </div>
                {products.map((p) => (
                  <div key={`${row.label}-${p.id}`} className="border-t border-border pt-3">
                    {row.render(p)}
                  </div>
                ))}
              </>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={clear}>
              Clear all
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
