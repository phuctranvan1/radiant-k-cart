import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — GLOW" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(24)
        .then(({ data }) => setResults(data ?? []));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">DISCOVER</p>
        <h1 className="font-display text-5xl mb-6">Search</h1>
        <div className="relative max-w-xl mx-auto">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for serums, lipsticks, masks..."
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      {q && (
        <p className="text-sm text-muted-foreground mb-6">
          {results.length} result{results.length !== 1 ? "s" : ""} for "{q}"
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!q && (
        <div className="text-center py-20 text-muted-foreground">
          Try searching for "serum", "lip tint", "sunscreen", or your favorite K-beauty brand.
        </div>
      )}
    </div>
  );
}
