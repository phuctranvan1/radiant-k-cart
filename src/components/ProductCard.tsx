import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/lib/useCart";
import { useWishlist } from "@/lib/useWishlist";
import { Button } from "@/components/ui/button";

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

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.sale_price && product.sale_price < product.price;
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative block">
      {/* Wishlist button */}
      <button
        onClick={() => toggle(product.id)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:border-gold transition-colors"
      >
        <Heart
          size={14}
          className={wishlisted ? "fill-current" : "text-muted-foreground"}
          style={wishlisted ? { color: "var(--gold)" } : undefined}
        />
      </button>

      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="luxe-card rounded-xl overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            {product.is_new && (
              <span className="absolute top-3 left-3 bg-gradient-gold text-primary-foreground text-[10px] font-bold tracking-widest px-2 py-1 rounded">
                NEW
              </span>
            )}
            {onSale && !product.is_new && (
              <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-bold tracking-widest px-2 py-1 rounded">
                SALE
              </span>
            )}

            {/* Quick-add overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button
                size="sm"
                className="w-full bg-gradient-gold text-primary-foreground gap-2 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void addItem(product.id, 1);
                }}
              >
                <ShoppingBag size={13} /> Add to Bag
              </Button>
            </div>
          </div>
          <div className="p-4">
            {product.brand && (
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-1">
                {product.brand}
              </p>
            )}
            <h3 className="font-display text-lg leading-tight mb-2 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {onSale ? (
                  <>
                    <span className="text-gold font-semibold">
                      ${product.sale_price?.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                )}
              </div>
              {product.rating && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star size={12} className="fill-current" style={{ color: "var(--gold)" }} />
                  {product.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
