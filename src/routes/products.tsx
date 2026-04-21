import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products — GLOW" },
      { name: "description", content: "Browse our full edit of luxury Korean cosmetics." },
    ],
  }),
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  rating: number | null;
  is_new: boolean | null;
  category_id: string | null;
};
type Category = { id: string; name: string; slug: string };

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(100);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => setProducts(data ?? []));
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || p.category_id === category;
      const effective = p.sale_price ?? p.price;
      const matchPrice = effective <= maxPrice;
      return matchSearch && matchCat && matchPrice;
    });
    if (sort === "price-low")
      list = [...list].sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    else if (sort === "price-high")
      list = [...list].sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    else if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [products, search, category, sort, maxPrice]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">THE COLLECTION</p>
        <h1 className="font-display text-5xl">All Products</h1>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6 luxe-card rounded-xl p-6 h-fit">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Max price: <span className="text-gold">${maxPrice}</span>
            </label>
            <Slider
              value={[maxPrice]}
              onValueChange={(v) => setMaxPrice(v[0])}
              min={10}
              max={100}
              step={5}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Sort
            </label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <div>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} products</p>
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No products match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
