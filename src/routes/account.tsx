import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — GLOW" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold mb-2">MY ACCOUNT</p>
          <h1 className="font-display text-4xl">
            Hello, {user.user_metadata?.display_name || user.email?.split("@")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="border-gold text-gold">
                Admin
              </Button>
            </Link>
          )}
          <Button onClick={signOut} variant="outline">
            Sign out
          </Button>
        </div>
      </div>

      <div className="luxe-card rounded-xl p-6">
        <h2 className="font-display text-2xl mb-4">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-mono text-gold">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()} · {o.status}
                  </p>
                </div>
                <p className="font-semibold">${Number(o.total).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
