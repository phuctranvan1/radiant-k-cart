import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/lib/useCart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — GLOW" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  shipping_address: z.string().trim().min(5).max(300),
  shipping_city: z.string().trim().min(2).max(100),
  shipping_country: z.string().trim().min(2).max(100),
  shipping_postal: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const { items, subtotal, clearCart, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum] = useState<string | null>(null);

  const shipping = subtotal >= 80 ? 0 : 10;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyPromo = async () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!data) {
      toast.error("Invalid promo code");
      return;
    }
    if (data.min_order && subtotal < Number(data.min_order)) {
      toast.error(`Minimum order $${data.min_order} required`);
      return;
    }
    const d =
      data.discount_type === "percent"
        ? subtotal * (Number(data.discount_value) / 100)
        : Number(data.discount_value);
    setDiscount(d);
    setAppliedCode(code);
    toast.success(`Code ${code} applied — saved $${d.toFixed(2)}`);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (count === 0) {
      toast.error("Your bag is empty");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        ...parsed.data,
        phone: parsed.data.phone || null,
        shipping_postal: parsed.data.shipping_postal || null,
        notes: parsed.data.notes || null,
        subtotal,
        discount,
        shipping_fee: shipping,
        total,
        promo_code: appliedCode,
        status: "pending",
      })
      .select()
      .single();

    if (error || !order) {
      toast.error("Could not place order");
      setSubmitting(false);
      return;
    }

    const lines = items
      .filter((i) => i.product)
      .map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product!.name,
        product_image: i.product!.image_url,
        unit_price: i.product!.sale_price ?? i.product!.price,
        quantity: i.quantity,
      }));
    await supabase.from("order_items").insert(lines);

    await clearCart();
    setOrderNum(order.order_number);
    setSubmitting(false);
  };

  if (orderNum) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <CheckCircle2 className="mx-auto mb-6" size={56} style={{ color: "var(--gold)" }} />
        <h1 className="font-display text-4xl mb-3">Thank you</h1>
        <p className="text-muted-foreground mb-2">Your order is confirmed.</p>
        <p className="font-mono text-gold text-xl mb-8">{orderNum}</p>
        <p className="text-sm text-muted-foreground mb-6">
          Save your order number to track it anytime. A confirmation will be sent to your email.
        </p>
        <Link to="/order-lookup">
          <Button className="bg-gradient-gold text-primary-foreground">Track Order</Button>
        </Link>
        <Link to="/products" className="block mt-4 text-sm text-muted-foreground hover:text-gold">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Your bag is empty.</p>
        <Link to="/products" className="text-gold underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <section className="luxe-card rounded-xl p-6">
            <h2 className="font-display text-2xl mb-4">Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full name</Label>
                <Input
                  name="full_name"
                  required
                  defaultValue={user?.user_metadata?.full_name || ""}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" required defaultValue={user?.email || ""} />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input name="phone" />
              </div>
            </div>
          </section>
          <section className="luxe-card rounded-xl p-6">
            <h2 className="font-display text-2xl mb-4">Shipping address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Street address</Label>
                <Input name="shipping_address" required />
              </div>
              <div>
                <Label>City</Label>
                <Input name="shipping_city" required />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input name="shipping_postal" />
              </div>
              <div className="col-span-2">
                <Label>Country</Label>
                <Input name="shipping_country" required defaultValue="United States" />
              </div>
              <div className="col-span-2">
                <Label>Order notes (optional)</Label>
                <Textarea name="notes" rows={3} />
              </div>
            </div>
          </section>
          <section className="luxe-card rounded-xl p-6">
            <h2 className="font-display text-2xl mb-2">Payment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              <Sparkles
                size={14}
                className="inline text-gold mr-1"
                style={{ color: "var(--gold)" }}
              />
              Demo checkout — no payment will be charged. Real payment processing can be enabled
              later.
            </p>
          </section>
        </div>

        <aside className="luxe-card rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display text-2xl mb-4">Summary</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {items.map(
              (i) =>
                i.product && (
                  <div key={i.product_id} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">{i.quantity}×</span>
                    <span className="flex-1 truncate">{i.product.name}</span>
                    <span>
                      ${((i.product.sale_price ?? i.product.price) * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ),
            )}
          </div>
          <div className="border-t border-border pt-4 mb-4">
            <Label>Promo code</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="WELCOME10"
              />
              <Button type="button" variant="outline" onClick={applyPromo}>
                Apply
              </Button>
            </div>
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-gold">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full mt-6 bg-gradient-gold text-primary-foreground"
            disabled={submitting}
          >
            {submitting ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
