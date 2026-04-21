import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type LookupOrder = Database["public"]["Functions"]["lookup_order"]["Returns"][number];
type LookupOrderItem = Database["public"]["Functions"]["lookup_order_items"]["Returns"][number];

export const Route = createFileRoute("/order-lookup")({
  head: () => ({ meta: [{ title: "Track Order — GLOW" }] }),
  component: OrderLookup,
});

const schema = z.object({
  order_number: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(255),
});

function OrderLookup() {
  const [order, setOrder] = useState<LookupOrder | null>(null);
  const [items, setItems] = useState<LookupOrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error("Enter a valid order number and email");
      return;
    }
    setLoading(true);
    const { data: o } = await supabase.rpc("lookup_order", {
      _order_number: parsed.data.order_number,
      _email: parsed.data.email,
    });
    if (!o || o.length === 0) {
      toast.error("Order not found");
      setLoading(false);
      setOrder(null);
      return;
    }
    setOrder(o[0]);
    const { data: it } = await supabase.rpc("lookup_order_items", {
      _order_number: parsed.data.order_number,
      _email: parsed.data.email,
    });
    setItems(it ?? []);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Search className="mx-auto mb-3" size={28} style={{ color: "var(--gold)" }} />
        <h1 className="font-display text-4xl">Track your order</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your order number and email to view status.
        </p>
      </div>

      <form onSubmit={lookup} className="luxe-card rounded-xl p-6 space-y-4">
        <div>
          <Label>Order number</Label>
          <Input name="order_number" placeholder="GLW-XXXXXXXX" required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" name="email" required />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-gold text-primary-foreground"
          disabled={loading}
        >
          {loading ? "Looking up..." : "Track order"}
        </Button>
      </form>

      {order && (
        <div className="luxe-card rounded-xl p-6 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs tracking-widest text-muted-foreground">ORDER</p>
              <p className="font-mono text-gold text-xl">{order.order_number}</p>
            </div>
            <span className="text-xs px-3 py-1 border border-gold rounded-full text-gold uppercase tracking-wider">
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Placed {new Date(order.created_at).toLocaleDateString()}
          </p>
          <div className="border-t border-border pt-4 space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {it.quantity}× {it.product_name}
                </span>
                <span>${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-gold">${Number(order.total).toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Shipping to {order.full_name}, {order.shipping_address}, {order.shipping_city},{" "}
            {order.shipping_country}
          </p>
        </div>
      )}
    </div>
  );
}
