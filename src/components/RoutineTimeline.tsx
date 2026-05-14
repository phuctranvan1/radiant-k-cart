import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/useCart";

type RoutineStep = {
  step_number: number;
  product_id: string;
  timing: "AM" | "PM" | "Both";
  instruction: string;
};

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
};

interface RoutineTimelineProps {
  routineName: string;
  steps: RoutineStep[];
  products: Product[];
}

export function RoutineTimeline({ routineName, steps, products }: RoutineTimelineProps) {
  const { addToBag } = useCart();

  const amSteps = steps.filter((s) => s.timing === "AM" || s.timing === "Both");
  const pmSteps = steps.filter((s) => s.timing === "PM" || s.timing === "Both");

  const addAllToBag = () => {
    const uniqueIds = [...new Set(steps.map((s) => s.product_id))];
    uniqueIds.forEach((id) => {
      const p = products.find((prod) => prod.id === id);
      if (p) addToBag(p);
    });
  };

  const renderSteps = (list: RoutineStep[]) => (
    <div className="space-y-8 relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/30 to-transparent" />
      {list.map((step, i) => {
        const p = products.find((prod) => prod.id === step.product_id);
        return (
          <div key={i} className="relative pl-12 reveal-on-scroll">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-gold flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-gold">{step.step_number}</span>
            </div>
            <div className="luxe-card rounded-2xl p-4 md:p-6 hover:shadow-gold transition-all duration-500 group">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {p && (
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-secondary">
                    <img src={p.image_url || ""} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display text-lg text-primary-foreground">
                      {p ? `${p.brand} ${p.name}` : "Product not found"}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {step.instruction}
                  </p>
                  {p && (
                    <Button
                      size="sm"
                      className="btn-luxe bg-gradient-gold text-primary-foreground h-8 px-4 text-xs"
                      onClick={() => addToBag(p)}
                    >
                      Add to Bag
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16 reveal-on-scroll">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 glass rounded-full text-[10px] tracking-[0.3em] text-gold">
          <Sparkles size={12} /> YOUR CUSTOM REGIMEN
        </div>
        <h1 className="font-display text-4xl md:text-6xl mb-6">{routineName}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A curated sequence of products designed specifically for your skin profile.
          Follow these steps consistently for optimal results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8 px-4">
            <div className="p-2 rounded-full bg-gold/10 text-gold">
              <Sun size={20} />
            </div>
            <h2 className="font-display text-2xl">AM Ritual</h2>
          </div>
          {renderSteps(amSteps)}
        </div>

        <div className la- la- "space-y-6">
          <div className="flex items-center gap-3 mb-8 px-4">
            <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
              <Moon size={20} />
            </div>
            <h2 className="font-display text-2xl">PM Ritual</h2>
          </div>
          {renderSteps(pmSteps)}
        </div>
      </div>

      <div className="mt-20 text-center reveal-on-scroll">
        <Button
          size="lg"
          className="btn-luxe bg-gradient-gold text-primary-foreground px-10 shadow-gold hover:scale-105 transition-transform"
          onClick={addAllToBag}
        >
          Add Entire Routine to Bag <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
}
