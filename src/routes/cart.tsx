import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/useCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — GLOW" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, removeItem, subtotal, count } = useCart();

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <ShoppingBag className="mx-auto mb-6" size={48} style={{ color: "var(--gold)" }} />
        <h1 className="font-display text-4xl mb-3">Your bag is empty</h1>
        <p className="text-muted-foreground mb-8">Discover our collection of luxury K-beauty essentials.</p>
        <Link to="/products"><Button size="lg" className="bg-gradient-gold text-primary-foreground">Start shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="font-display text-4xl mb-8">Your Bag <span className="text-muted-foreground text-2xl">({count})</span></h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {items.map((item) => item.product && (
            <div key={item.product_id} className="luxe-card rounded-xl p-4 flex gap-4 items-center">
              <Link to="/products/$slug" params={{ slug: item.product.slug }} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-secondary">
                {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/products/$slug" params={{ slug: item.product.slug }} className="font-display text-lg hover:text-gold">{item.product.name}</Link>
                <p className="text-gold font-semibold mt-1">${(item.product.sale_price ?? item.product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center border border-border rounded">
                <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="p-2 hover:text-gold"><Minus size={14} /></button>
                <span className="px-3 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="p-2 hover:text-gold"><Plus size={14} /></button>
              </div>
              <button onClick={() => removeItem(item.product_id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <aside className="luxe-card rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display text-2xl mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm pb-4 border-b border-border">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{subtotal >= 80 ? "Free" : "$10.00"}</span></div>
          </div>
          <div className="flex justify-between py-4 text-lg font-semibold">
            <span>Total</span>
            <span className="text-gold">${(subtotal + (subtotal >= 80 ? 0 : 10)).toFixed(2)}</span>
          </div>
          <Link to="/checkout"><Button size="lg" className="w-full bg-gradient-gold text-primary-foreground">Checkout</Button></Link>
          <Link to="/products" className="block text-center mt-4 text-sm text-muted-foreground hover:text-gold">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
