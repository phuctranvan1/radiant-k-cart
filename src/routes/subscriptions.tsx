import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Repeat, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — GLOW" }] }),
  component: SubsPage,
});

type Sub = {
  id: string;
  product_id: string;
  interval_days: number;
  quantity: number;
  status: string;
  next_ship_at: string;
  discount_percent: number;
  product?: { name: string; brand: string | null; image_url: string | null; price: number; sale_price: number | null; slug: string };
};

function SubsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { redirect: "/subscriptions" } });
  }, [user, authLoading, navigate]);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select(
        "id,product_id,interval_days,quantity,status,next_ship_at,discount_percent,products(name,brand,image_url,price,sale_price,slug)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSubs(
      (data ?? []).map((r) => ({
        ...(r as unknown as Sub),
        product: (r as unknown as { products: Sub["product"] }).products,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  if (!user) return null;

  const cancel = async (id: string) => {
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", id);
    toast.success("Subscription cancelled");
    refresh();
  };

  const updateInterval = async (id: string, days: number) => {
    const next = new Date(Date.now() + days * 86400000).toISOString();
    await supabase.from("subscriptions").update({ interval_days: days, next_ship_at: next }).eq("id", id);
    refresh();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] text-gold mb-2">AUTO-REPLENISH</p>
        <h1 className="font-display text-5xl">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Never run out. Save 15% on every recurring delivery. Pause or cancel any time.
        </p>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto" />
      ) : subs.length === 0 ? (
        <div className="luxe-card rounded-2xl p-10 text-center">
          <Repeat className="w-10 h-10 mx-auto mb-3 text-gold" />
          <h2 className="font-display text-2xl mb-2">No active subscriptions</h2>
          <p className="text-muted-foreground text-sm mb-5">
            Add subscribe-and-save to any product page to start.
          </p>
          <Link to="/products">
            <Button className="bg-gradient-gold text-primary-foreground">
              <Plus size={14} className="mr-2" /> Browse products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => (
            <div key={s.id} className="luxe-card rounded-xl p-4 flex gap-4 items-center">
              <Link to="/products/$slug" params={{ slug: s.product?.slug ?? "" }} className="shrink-0">
                {s.product?.image_url && (
                  <img src={s.product.image_url} alt={s.product.name} className="w-20 h-20 object-cover rounded-md" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {s.product?.brand}
                </p>
                <p className="font-medium truncate">{s.product?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {s.status === "active"
                    ? `Next ship: ${new Date(s.next_ship_at).toLocaleDateString()}`
                    : `Status: ${s.status}`}{" "}
                  · Save {s.discount_percent}%
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={s.interval_days}
                    onChange={(e) => updateInterval(s.id, Number(e.target.value))}
                    className="bg-input text-xs rounded-md px-2 py-1"
                  >
                    <option value={30}>Every 30 days</option>
                    <option value={60}>Every 60 days</option>
                    <option value={90}>Every 90 days</option>
                  </select>
                  <Button
                    onClick={() => cancel(s.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
