import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Database } from "@/integrations/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const SITE_URL = "https://radiant-k-cart.lovable.app";

export const Route = createFileRoute("/categories/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("categories")
      .select("name,slug,description,image_url")
      .eq("slug", params.slug)
      .maybeSingle();
    return { category: data };
  },
  head: ({ loaderData, params }) => {
    const cat = loaderData?.category;
    const name = cat?.name ?? "Category";
    const title = `${name} — Luxury K-Beauty | GLOW`;
    const desc =
      cat?.description ??
      `Shop ${name.toLowerCase()} from premium Korean beauty brands. Curated by GLOW.`;
    const url = `${SITE_URL}/categories/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(cat?.image_url ? [{ property: "og:image", content: cat.image_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [category, setCategory] = useState<CategoryRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      setCategory(cat);
      if (cat) {
        const { data } = await supabase.from("products").select("*").eq("category_id", cat.id);
        setProducts(data ?? []);
      }
    })();
  }, [slug]);

  if (!category)
    return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">CATEGORY</p>
        <h1 className="font-display text-5xl mb-3">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground max-w-xl mx-auto">{category.description}</p>
        )}
      </div>
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
