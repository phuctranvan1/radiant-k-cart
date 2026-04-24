import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/useCart";
import { useWishlist } from "@/lib/useWishlist";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star, ArrowRight, Loader2 } from "lucide-react";

type Detail = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  rating: number | null;
  review_count: number | null;
  stock: number;
};

export function QuickViewModal({
  productId,
  onClose,
}: {
  productId: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { fmt } = useCurrency();
  const { t } = useI18n();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    supabase
      .from("products")
      .select(
        "id,name,slug,brand,price,sale_price,image_url,images,description,rating,review_count,stock",
      )
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => {
        setData(data);
        setActiveImg(data?.image_url ?? data?.images?.[0] ?? null);
        setQty(1);
        setLoading(false);
      });
  }, [productId]);

  const onSale = data?.sale_price && data.sale_price < data.price;
  const wishlisted = data ? isWishlisted(data.id) : false;
  const gallery = data ? [data.image_url, ...(data.images ?? [])].filter(Boolean) as string[] : [];

  return (
    <Dialog open={!!productId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {loading || !data ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-secondary aspect-square md:aspect-auto relative overflow-hidden">
              {activeImg && (
                <img
                  src={activeImg}
                  alt={data.name}
                  className="w-full h-full object-cover gallery-fade"
                />
              )}
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {gallery.slice(0, 5).map((src) => (
                    <button
                      key={src}
                      onClick={() => setActiveImg(src)}
                      className={`w-10 h-10 rounded-md overflow-hidden border-2 transition ${
                        activeImg === src ? "border-gold" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 flex flex-col">
              {data.brand && (
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">
                  {data.brand}
                </p>
              )}
              <h2 className="font-display text-3xl mb-2">{data.name}</h2>
              {data.rating != null && (
                <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                  <Star size={14} className="fill-current" style={{ color: "var(--gold)" }} />
                  {data.rating} · {data.review_count ?? 0} reviews
                </div>
              )}
              <div className="flex items-baseline gap-3 mb-4">
                {onSale ? (
                  <>
                    <span className="font-display text-3xl text-gold">
                      {fmt(data.sale_price!)}
                    </span>
                    <span className="text-muted-foreground line-through">{fmt(data.price)}</span>
                  </>
                ) : (
                  <span className="font-display text-3xl">{fmt(data.price)}</span>
                )}
              </div>
              {data.description && (
                <p className="text-sm text-muted-foreground mb-6 line-clamp-4">
                  {data.description}
                </p>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-secondary"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="px-4 text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(data.stock || 99, qty + 1))}
                    className="px-3 py-2 hover:bg-secondary"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.stock > 0 ? `${data.stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <Button
                  className="btn-luxe flex-1 bg-gradient-gold text-primary-foreground gap-2"
                  disabled={data.stock <= 0}
                  onClick={() => {
                    void addItem(data.id, qty);
                  }}
                >
                  <ShoppingBag size={16} /> {t("product.addToBag")}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggle(data.id)}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={16}
                    className={wishlisted ? "fill-current" : ""}
                    style={wishlisted ? { color: "var(--gold)" } : undefined}
                  />
                </Button>
              </div>

              <Link
                to="/products/$slug"
                params={{ slug: data.slug }}
                onClick={onClose}
                className="text-sm text-gold hover:underline inline-flex items-center gap-1 mt-2"
              >
                View full details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
