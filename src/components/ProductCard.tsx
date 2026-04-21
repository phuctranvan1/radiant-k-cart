import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

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
  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group block">
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
          {onSale && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold tracking-widest px-2 py-1 rounded">
              SALE
            </span>
          )}
        </div>
        <div className="p-4">
          {product.brand && <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-1">{product.brand}</p>}
          <h3 className="font-display text-lg leading-tight mb-2 group-hover:text-gold transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {onSale ? (
                <>
                  <span className="text-gold font-semibold">${product.sale_price?.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
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
  );
}
