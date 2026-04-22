import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

type AdminProduct = Database["public"]["Tables"]["products"]["Row"] & {
  categories: { name: string } | null;
};
type AdminCategory = Database["public"]["Tables"]["categories"]["Row"];
type AdminOrder = Database["public"]["Tables"]["orders"]["Row"];
type AdminPromo = Database["public"]["Tables"]["promo_codes"]["Row"];
type AdminTicket = Database["public"]["Tables"]["support_tickets"]["Row"];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — GLOW" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/" });
  }, [loading, isAdmin, navigate]);

  if (!isAdmin)
    return (
      <div className="container py-20 text-center text-muted-foreground">Checking permissions…</div>
    );

  return (
    <div className="container mx-auto px-4 py-12">
      <p className="text-xs tracking-[0.3em] text-gold mb-2">CONTROL ROOM</p>
      <h1 className="font-display text-5xl mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
          <TabsTrigger value="tickets">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsAdmin />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
        <TabsContent value="promos">
          <PromosAdmin />
        </TabsContent>
        <TabsContent value="tickets">
          <TicketsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data ?? []) as AdminProduct[]));
  };
  useEffect(() => {
    refresh();
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")).trim(),
      slug: String(fd.get("slug")).trim().toLowerCase().replace(/\s+/g, "-"),
      brand: String(fd.get("brand") || "").trim() || null,
      description: String(fd.get("description") || "").trim() || null,
      price: Number(fd.get("price")),
      sale_price: fd.get("sale_price") ? Number(fd.get("sale_price")) : null,
      stock: Number(fd.get("stock") || 0),
      category_id: String(fd.get("category_id") || "") || null,
      image_url: String(fd.get("image_url") || "").trim() || null,
      featured: fd.get("featured") === "on",
      is_new: fd.get("is_new") === "on",
    };
    const op = editing
      ? supabase.from("products").update(payload).eq("id", editing.id)
      : supabase.from("products").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product created");
    setOpen(false);
    setEditing(null);
    refresh();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between mb-4">
        <h2 className="font-display text-2xl">Products ({products.length})</h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground">
              <Plus size={16} /> New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "New"} product</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input name="name" required defaultValue={editing?.name} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input name="slug" required defaultValue={editing?.slug} />
              </div>
              <div>
                <Label>Brand</Label>
                <Input name="brand" defaultValue={editing?.brand ?? ""} />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editing?.price}
                />
              </div>
              <div>
                <Label>Sale price</Label>
                <Input
                  name="sale_price"
                  type="number"
                  step="0.01"
                  defaultValue={editing?.sale_price ?? ""}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input name="stock" type="number" defaultValue={editing?.stock ?? 0} />
              </div>
              <div>
                <Label>Category</Label>
                <Select name="category_id" defaultValue={editing?.category_id ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input name="image_url" defaultValue={editing?.image_url ?? ""} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea name="description" rows={3} defaultValue={editing?.description ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={editing?.featured ?? false}
                />{" "}
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_new" defaultChecked={editing?.is_new ?? false} />{" "}
                New
              </label>
              <Button type="submit" className="col-span-2 bg-gradient-gold text-primary-foreground">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="luxe-card rounded-xl divide-y divide-border">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 rounded bg-secondary overflow-hidden shrink-0">
              {p.image_url && (
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                ${p.price} · stock {p.stock} · {p.categories?.name}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(p);
                setOpen(true);
              }}
            >
              <Edit size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => del(p.id)}
              className="text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const refresh = () =>
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  useEffect(() => {
    refresh();
  }, []);
  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("orders")
      .update({ status: status as Database["public"]["Enums"]["order_status"] })
      .eq("id", id);
    toast.success("Status updated");
    refresh();
  };
  return (
    <div className="mt-6 luxe-card rounded-xl divide-y divide-border">
      {orders.length === 0 ? (
        <p className="p-6 text-muted-foreground">No orders yet.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-gold">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {o.full_name} · {o.email} · {new Date(o.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="font-semibold">${Number(o.total).toFixed(2)}</p>
            <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))
      )}
    </div>
  );
}

function PromosAdmin() {
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const refresh = () =>
    supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPromos(data ?? []));
  useEffect(() => {
    refresh();
  }, []);
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("promo_codes").insert({
      code: String(fd.get("code")).trim().toUpperCase(),
      description: String(fd.get("description") || "") || null,
      discount_type: String(fd.get("discount_type")),
      discount_value: Number(fd.get("discount_value")),
      min_order: Number(fd.get("min_order") || 0),
      active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Promo created");
    (e.target as HTMLFormElement).reset();
    refresh();
  };
  const del = async (id: string) => {
    await supabase.from("promo_codes").delete().eq("id", id);
    refresh();
  };
  return (
    <div className="mt-6 grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="luxe-card rounded-xl divide-y divide-border">
        {promos.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-mono text-gold">{p.code}</p>
              <p className="text-xs text-muted-foreground">
                {p.discount_type === "percent"
                  ? `${p.discount_value}% off`
                  : `$${p.discount_value} off`}
                {(p.min_order ?? 0) > 0 && ` · min $${p.min_order}`} · {p.uses} uses
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => del(p.id)}
              className="text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
      <form onSubmit={create} className="luxe-card rounded-xl p-4 space-y-3 h-fit">
        <h3 className="font-display text-lg">New promo code</h3>
        <div>
          <Label>Code</Label>
          <Input name="code" required />
        </div>
        <div>
          <Label>Description</Label>
          <Input name="description" />
        </div>
        <div>
          <Label>Type</Label>
          <Select name="discount_type" defaultValue="percent">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percent</SelectItem>
              <SelectItem value="fixed">Fixed $</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Value</Label>
          <Input name="discount_value" type="number" step="0.01" required />
        </div>
        <div>
          <Label>Min order ($)</Label>
          <Input name="min_order" type="number" step="0.01" defaultValue="0" />
        </div>
        <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground">
          Create
        </Button>
      </form>
    </div>
  );
}

function TicketsAdmin() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  useEffect(() => {
    supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setTickets(data ?? []));
  }, []);
  return (
    <div className="mt-6 luxe-card rounded-xl divide-y divide-border">
      {tickets.length === 0 ? (
        <p className="p-6 text-muted-foreground">No support tickets.</p>
      ) : (
        tickets.map((t) => (
          <div key={t.id} className="p-4">
            <div className="flex justify-between mb-1">
              <p className="font-medium">{t.subject}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {t.name} · {t.email}
            </p>
            <p className="text-sm">{t.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
