import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { Sparkles, Package, Tag, Search as SearchIcon, Heart, ShoppingBag, User } from "lucide-react";

type ProductHit = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
};
type CategoryHit = { id: string; name: string; slug: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [categories, setCategories] = useState<CategoryHit[]>([]);
  const navigate = useNavigate();
  const { fmt } = useCurrency();

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    (window as unknown as { __openPalette?: () => void }).__openPalette = () => setOpen(true);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setProducts([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,brand,price,sale_price,image_url")
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(6);
      setProducts(data ?? []);
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  // Load categories once when opened
  useEffect(() => {
    if (!open || categories.length) return;
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [open, categories.length]);

  const go = (path: () => void) => {
    setOpen(false);
    setQuery("");
    path();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search products, brands, categories…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center text-sm text-muted-foreground">
            <SearchIcon className="mx-auto mb-2 opacity-40" size={20} />
            {query ? `No results for "${query}"` : "Start typing to search…"}
          </div>
        </CommandEmpty>

        {products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.brand ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/products/$slug", params: { slug: p.slug } }))}
                className="gap-3"
              >
                <div className="w-10 h-10 rounded bg-secondary overflow-hidden shrink-0">
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                </div>
                <span className="text-sm text-gold font-semibold whitespace-nowrap">
                  {fmt(p.sale_price ?? p.price)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {categories.length > 0 && (
          <>
            {products.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Categories">
              {categories.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => go(() => navigate({ to: "/categories/$slug", params: { slug: c.slug } }))}
                >
                  <Tag size={14} className="mr-2" />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick navigation">
          <CommandItem onSelect={() => go(() => navigate({ to: "/products" }))}>
            <Package size={14} className="mr-2" /> All products
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/lookbook" }))}>
            <Sparkles size={14} className="mr-2" /> Lookbook
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/wishlist" }))}>
            <Heart size={14} className="mr-2" /> Wishlist
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/cart" }))}>
            <ShoppingBag size={14} className="mr-2" /> Bag
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/account" }))}>
            <User size={14} className="mr-2" /> Account
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
