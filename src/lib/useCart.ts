import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

const GUEST_KEY = "glow_guest_cart";

export type CartLine = {
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
    slug: string;
    stock: number;
  };
};

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      const { data } = await supabase
        .from("cart_items")
        .select("product_id, quantity, products(id,name,price,sale_price,image_url,slug,stock)")
        .eq("user_id", user.id);
      setItems(
        (data ?? []).map((r: any) => ({
          product_id: r.product_id,
          quantity: r.quantity,
          product: r.products,
        }))
      );
    } else {
      const raw = typeof window !== "undefined" ? localStorage.getItem(GUEST_KEY) : null;
      const guest: { product_id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
      if (guest.length === 0) { setItems([]); setLoading(false); return; }
      const ids = guest.map((g) => g.product_id);
      const { data } = await supabase
        .from("products")
        .select("id,name,price,sale_price,image_url,slug,stock")
        .in("id", ids);
      setItems(guest.map((g) => ({ ...g, product: data?.find((p) => p.id === g.product_id) })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (product_id: string, quantity = 1) => {
    if (user) {
      const existing = items.find((i) => i.product_id === product_id);
      if (existing) {
        await supabase.from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("user_id", user.id).eq("product_id", product_id);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id, quantity });
      }
    } else {
      const raw = localStorage.getItem(GUEST_KEY);
      const guest: { product_id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
      const existing = guest.find((g) => g.product_id === product_id);
      if (existing) existing.quantity += quantity;
      else guest.push({ product_id, quantity });
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    }
    toast.success("Added to cart");
    await refresh();
  };

  const updateQty = async (product_id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(product_id);
    if (user) {
      await supabase.from("cart_items").update({ quantity })
        .eq("user_id", user.id).eq("product_id", product_id);
    } else {
      const raw = localStorage.getItem(GUEST_KEY);
      const guest: { product_id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
      const existing = guest.find((g) => g.product_id === product_id);
      if (existing) existing.quantity = quantity;
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    }
    await refresh();
  };

  const removeItem = async (product_id: string) => {
    if (user) {
      await supabase.from("cart_items").delete()
        .eq("user_id", user.id).eq("product_id", product_id);
    } else {
      const raw = localStorage.getItem(GUEST_KEY);
      const guest: { product_id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest.filter((g) => g.product_id !== product_id)));
    }
    await refresh();
  };

  const clearCart = async () => {
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id);
    else localStorage.removeItem(GUEST_KEY);
    setItems([]);
  };

  const subtotal = items.reduce(
    (s, i) => s + ((i.product?.sale_price ?? i.product?.price ?? 0) * i.quantity), 0
  );
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, loading, addItem, updateQty, removeItem, clearCart, subtotal, count, refresh };
}
