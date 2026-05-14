import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { LayoutDashboard, ShoppingBag, Award, User, Heart, History, Sparkles } from "lucide-react";
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
    <div className="container mx-auto px-4 py-12 max-w-6xl bg-mesh">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 space-y-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-gold p-1 shadow-gold mb-4">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <span className="font-display text-3xl text-gold">
                  {user.user_metadata?.display_name ? user.user_metadata.display_name[0].toUpperCase() : user.email?.charAt(0).toUpperCase() || "G"}
                </span
              </div>
            </div>
            <h2 className="font-display text-xl">Hello,</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <nav className="space-y-2">
            <AccountLink icon={<LayoutDashboard size={18} />} label="Dashboard" to="/account" active />
            <AccountLink icon={<Award size={18} />} label="The Glow Circle" to="/account/loyalty" />
            <AccountLink icon={<ShoppingBag size={18} />} label="My Routine" to="/routine" />
            <AccountLink icon={<History size={18} />} label="Order History" to="/account/orders" />
            <AccountLink icon={<Heart size={18} />} label="Wishlist" to="/wishlist" />
            <AccountLink icon={<User size={18} />} label="Profile" to="/account/profile" />
          </nav>

          <div className="pt-8 border-t border-border/50">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400"
            >
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-12">
          <div className="reveal-on-scroll">
            <div className="flex justify-between items-end mb-8">
              <h1 className="font-display text-4xl">Member Hub</h1>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className="border-gold text-gold text-xs">
                    Admin Access
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <DashboardCard
                icon={<Award className="text-gold" />}
                label="Loyalty Tier"
                value="Silver"
                sub="420 / 500 pts to Gold"
                href="/account/loyalty"
              />
              <DashboardCard
                icon={<ShoppingBag className="text-gold" />}
                label="Active Routine"
                value="Glass Skin"
                sub="Curated regimen"
                href="/routine"
              />
              <DashboardCard
                icon={<Sparkles className="text-gold" />}
                label="Skin Status"
                value="Hydrated"
                sub="Analyzed May 14"
                href="/skin-quiz"
              />
            </div>

            <div className="mb-8">
              <LoyaltyCard />
            </div>

            <div className="luxe-card rounded-3xl p-8 reveal-on-scroll">
              <h2 className="font-display text-2xl mb-6">Order history</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-sm">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                          <ShoppingBag size={14} />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-gold">{o.order_number}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {new Date(o.created_at).toLocaleDateString()} · {o.status}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">${Number(o.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AccountLink({ icon, label, to, active = false }: { icon: React.ReactNode, label: string, to: string, active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm ${
        active
          ? "bg-gradient-gold text-primary-foreground shadow-gold"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function DashboardCard({ icon, label, value, sub, href }: { icon: React.ReactNode, label: string, value: string, sub: string, href: string }) {
  return (
    <Link to={href} className="luxe-card p-6 rounded-2xl group hover:shadow-gold transition-all duration-500">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1">{label}</p>
      <h4 className="font-display text-xl mb-1">{value}</h4>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}
