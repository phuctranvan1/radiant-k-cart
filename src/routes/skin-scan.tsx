import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/skin-scan")({
  head: () => ({
    meta: [
      { title: "AI Skin Scan — GLOW" },
      { name: "description", content: "Upload a selfie. Our AI reads your skin and curates a personalized routine in seconds." },
    ],
  }),
  component: SkinScan,
});

type Concern = { name: string; severity: string; note: string };
type Analysis = {
  overall_score: number;
  skin_type_guess: string;
  concerns: Concern[];
  summary: string;
  product_ids: string[];
};

function SkinScan() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string; brand: string | null; slug: string; image_url: string | null; price: number; sale_price: number | null }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!result?.product_ids?.length) return;
    supabase
      .from("products")
      .select("id,name,brand,slug,image_url,price,sale_price")
      .in("id", result.product_ids)
      .then(({ data }) => setProducts(data ?? []));
  }, [result]);

  const onFile = (f: File) => {
    if (f.size > 6_000_000) return toast.error("Image too large (max 6 MB)");
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
    setResult(null);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skin-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ image_data_url: image }),
      });
      if (!res.ok) {
        if (res.status === 429) toast.error("Too many requests. Try again shortly.");
        else if (res.status === 402) toast.error("Out of AI credits.");
        else toast.error("Scan failed");
        return;
      }
      const data = await res.json();
      if (data?.error) toast.error(data.error);
      else setResult(data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">AI VISION TECHNOLOGY</p>
        <h1 className="font-display text-5xl mb-3">AI Skin Scan</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Upload a clear, well-lit selfie. Our AI dermatology consultant analyzes your skin and curates 4 perfect products.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="luxe-card rounded-2xl p-6 border border-gold/20">
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition cursor-pointer flex items-center justify-center overflow-hidden bg-secondary/30"
          >
            {image ? (
              <img src={image} alt="Selfie" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gold" />
                <p className="font-display text-xl mb-1">Tap to upload selfie</p>
                <p className="text-xs text-muted-foreground">JPG / PNG, max 6 MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="flex-1">
              <Upload size={14} className="mr-2" /> Choose photo
            </Button>
            <Button
              onClick={analyze}
              disabled={!image || loading}
              className="flex-1 bg-gradient-gold text-primary-foreground"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Sparkles size={14} className="mr-2" />}
              {loading ? "Analyzing…" : "Analyze my skin"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            Photos stay on your device unless you submit them. Analysis is for guidance only — not a medical diagnosis.
          </p>
        </div>

        <div className="luxe-card rounded-2xl p-6">
          {!result && !loading && (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
              Your AI analysis will appear here.
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              Reading your skin…
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-xs tracking-[0.25em] text-gold">SKIN SCORE</p>
                  <p className="font-display text-6xl text-gold">{result.overall_score}</p>
                </div>
                <div className="pb-2">
                  <p className="text-xs text-muted-foreground">Skin type</p>
                  <p className="font-medium capitalize">{result.skin_type_guess}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{result.summary}</p>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground mb-2">CONCERNS</p>
                <div className="space-y-2">
                  {result.concerns.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                        {c.severity}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {products.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl mb-6 text-center">Your curated routine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group luxe-card rounded-xl overflow-hidden hover:shadow-gold transition"
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                  <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                  <p className="text-sm text-gold mt-1">${p.sale_price ?? p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
