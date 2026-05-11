import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  Star,
} from "lucide-react";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  email: string;
  user_id: string | null;
};

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

const GOLD = "oklch(0.78 0.14 80)";
const GOLD_SOFT = "oklch(0.88 0.10 82)";
const GOLD_DEEP = "oklch(0.62 0.14 70)";
const STATUS_COLORS: Record<string, string> = {
  pending: "oklch(0.70 0.13 70)",
  paid: "oklch(0.74 0.16 145)",
  processing: "oklch(0.72 0.14 220)",
  shipped: "oklch(0.78 0.14 80)",
  delivered: "oklch(0.68 0.18 145)",
  cancelled: "oklch(0.62 0.22 25)",
};

const RANGES = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
] as const;

export function AnalyticsDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("30d");
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [lowStock, setLowStock] = useState<{ name: string; stock: number }[]>([]);
  const [customers, setCustomers] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [loading, setLoading] = useState(true);

  const days = RANGES.find((r) => r.key === range)!.days;
  const since = useMemo(
    () => new Date(Date.now() - days * 86400000).toISOString(),
    [days],
  );

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      const [{ data: ords }, { data: prods }, { data: low }, { count: ucount }, { count: tcount }] =
        await Promise.all([
          supabase
            .from("orders")
            .select("id,total,status,created_at,email,user_id")
            .gte("created_at", since)
            .order("created_at", { ascending: true }),
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("name,stock")
            .lt("stock", 10)
            .order("stock", { ascending: true })
            .limit(8),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "open"),
        ]);
      if (cancel) return;
      const o = (ords ?? []) as Order[];
      setOrders(o);
      setProductCount((prods as any)?.length ?? 0);
      // get exact count separately
      const { count: pc } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });
      if (cancel) return;
      setProductCount(pc ?? 0);
      setLowStock((low ?? []) as any);
      setCustomers(ucount ?? 0);
      setTickets(tcount ?? 0);

      if (o.length) {
        const ids = o.map((x) => x.id);
        const { data: oi } = await supabase
          .from("order_items")
          .select("product_name,quantity,unit_price")
          .in("order_id", ids);
        if (!cancel) setItems((oi ?? []) as OrderItem[]);
      } else {
        setItems([]);
      }
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [since]);

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const aov = orders.length ? revenue / orders.length : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;

  // Build daily series
  const series = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key.slice(5), revenue: 0, orders: 0 });
    }
    orders.forEach((o) => {
      const key = o.created_at.slice(0, 10);
      const row = map.get(key);
      if (row) {
        row.revenue += Number(o.total);
        row.orders += 1;
      }
    });
    return Array.from(map.values());
  }, [orders, days]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => (counts[o.status] = (counts[o.status] ?? 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    items.forEach((it) => {
      const row = map.get(it.product_name) ?? {
        name: it.product_name,
        qty: 0,
        revenue: 0,
      };
      row.qty += it.quantity;
      row.revenue += Number(it.unit_price) * it.quantity;
      map.set(it.product_name, row);
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [items]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="mt-6 space-y-6">
      {/* Range picker */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Overview</h2>
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-4 py-1.5 text-xs tracking-widest rounded-full transition ${
                range === r.key
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<DollarSign size={18} />}
          label="Revenue"
          value={fmt(revenue)}
          loading={loading}
        />
        <KpiCard
          icon={<ShoppingBag size={18} />}
          label="Orders"
          value={String(orders.length)}
          loading={loading}
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Avg order"
          value={fmt(aov)}
          loading={loading}
        />
        <KpiCard
          icon={<Users size={18} />}
          label="Customers"
          value={String(uniqueCustomers || customers)}
          loading={loading}
        />
      </div>

      {/* Revenue + status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="luxe-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Revenue</h3>
            <span className="text-xs text-muted-foreground">Daily, USD</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD_SOFT} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0 0 / 30%)" strokeDasharray="3 6" />
                <XAxis dataKey="date" stroke="oklch(0.65 0 0)" fontSize={11} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.012 60)",
                    border: "1px solid oklch(0.30 0.012 70 / 60%)",
                    borderRadius: 8,
                    color: "oklch(0.96 0 0)",
                  }}
                  formatter={(v: number) => fmt(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={GOLD}
                  strokeWidth={2}
                  fill="url(#g-rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="luxe-card rounded-xl p-5">
          <h3 className="font-display text-lg mb-4">Order status</h3>
          <div className="h-[260px]">
            {statusBreakdown.length === 0 ? (
              <EmptyMini label="No orders in range" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusBreakdown.map((s) => (
                      <Cell
                        key={s.name}
                        fill={STATUS_COLORS[s.name] ?? GOLD_DEEP}
                        stroke="oklch(0.16 0.012 60)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "oklch(0.85 0 0)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.012 60)",
                      border: "1px solid oklch(0.30 0.012 70 / 60%)",
                      borderRadius: 8,
                      color: "oklch(0.96 0 0)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top products + Orders volume */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="luxe-card rounded-xl p-5">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <Star size={16} style={{ color: GOLD }} /> Top products
          </h3>
          <div className="h-[260px]">
            {topProducts.length === 0 ? (
              <EmptyMini label="No sales yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid stroke="oklch(0.30 0 0 / 30%)" strokeDasharray="3 6" />
                  <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="oklch(0.65 0 0)"
                    fontSize={11}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.012 60)",
                      border: "1px solid oklch(0.30 0.012 70 / 60%)",
                      borderRadius: 8,
                      color: "oklch(0.96 0 0)",
                    }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Bar dataKey="revenue" fill={GOLD} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="luxe-card rounded-xl p-5">
          <h3 className="font-display text-lg mb-4">Order volume</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid stroke="oklch(0.30 0 0 / 30%)" strokeDasharray="3 6" />
                <XAxis dataKey="date" stroke="oklch(0.65 0 0)" fontSize={11} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.012 60)",
                    border: "1px solid oklch(0.30 0.012 70 / 60%)",
                    borderRadius: 8,
                    color: "oklch(0.96 0 0)",
                  }}
                />
                <Bar dataKey="orders" fill={GOLD_DEEP} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Inventory + ops */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="luxe-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-destructive" /> Low stock
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products well stocked ✨</p>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate pr-4">{p.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      p.stock === 0
                        ? "bg-destructive/15 text-destructive"
                        : "bg-gold/10 text-gold"
                    }`}
                  >
                    {p.stock === 0 ? "OUT" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <MiniStat
            icon={<Package size={16} />}
            label="Total SKUs"
            value={String(productCount)}
          />
          <MiniStat
            icon={<Users size={16} />}
            label="Registered customers"
            value={String(customers)}
          />
          <MiniStat
            icon={<Clock size={16} />}
            label="Open tickets"
            value={String(tickets)}
            tone={tickets > 0 ? "warn" : "ok"}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="luxe-card rounded-xl p-5 relative overflow-hidden group">
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--gradient-radial-gold)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-gold">{icon}</span>
      </div>
      <p className="relative mt-3 font-display text-3xl">
        {loading ? <span className="opacity-40">—</span> : value}
      </p>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="luxe-card rounded-xl p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          tone === "warn"
            ? "bg-destructive/15 text-destructive"
            : "bg-gold/10 text-gold"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-xl">{value}</p>
      </div>
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
