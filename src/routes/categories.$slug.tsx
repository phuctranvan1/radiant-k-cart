import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/categories/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      setCategory(cat);
      if (cat) {
        const { data } = await supabase.from("products").select("*").eq("category_id", cat.id);
        setProducts(data ?? []);
      }
    })();
  }, [slug]);

  if (!category) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">CATEGORY</p>
        <h1 className="font-display text-5xl mb-3">{category.name}</h1>
        {category.description && <p className="text-muted-foreground max-w-xl mx-auto">{category.description}</p>}
      </div>
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
