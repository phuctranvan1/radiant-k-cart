import { useState } from "react";
import { Repeat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function SubscribeSaveButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState(30);
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      return;
    }
    setLoading(true);
    const next = new Date(Date.now() + interval * 86400000).toISOString();
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      product_id: productId,
      interval_days: interval,
      next_ship_at: next,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Subscribed! Save 15% on every refill.");
  };

  return (
    <div className="luxe-card rounded-xl p-4 border border-gold/20">
      <div className="flex items-center gap-2 mb-2">
        <Repeat size={16} className="text-gold" />
        <p className="font-medium text-sm">Subscribe & Save 15%</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Auto-deliver, skip, or cancel any time.
      </p>
      <div className="flex gap-2">
        <select
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="flex-1 bg-input text-sm rounded-md px-3 py-2"
        >
          <option value={30}>Every 30 days</option>
          <option value={60}>Every 60 days</option>
          <option value={90}>Every 90 days</option>
        </select>
        <Button onClick={subscribe} disabled={loading} className="bg-gradient-gold text-primary-foreground">
          {loading ? <Loader2 className="animate-spin" size={14} /> : "Subscribe"}
        </Button>
      </div>
    </div>
  );
}
