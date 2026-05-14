import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { RoutineTimeline } from "@/components/RoutineTimeline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type RoutineStep = {
  step_number: number;
  product_id: string;
  timing: "AM" | "PM" | "Both";
  instruction: string;
};

type Routine = {
  id: string;
  routine_name: string;
  steps: RoutineStep[];
  created_at: string;
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

export const Route = createFileRoute("/routine")({
  component: RoutinePage,
});

function RoutinePage() {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutine() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: routineData } = await supabase
          .from("user_routines")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (routineData) {
          setRoutine(routineData as Routine);

          const productIds = routineData.steps.map((s: any) => s.product_id);
          const { data: productData } = await supabase
            .from("products")
            .select("id,name,slug,brand,price,sale_price,image_url,rating,is_new")
            .in("id", productIds);

          setProducts(productData ?? []);
        }
      } catch (e) {
        console.error("Error fetching routine:", e);
        toast.error("Failed to load your custom routine.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoutine();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-gold" size={40} />
          <p className="text-muted-foreground animate-pulse font-display">Curating your regimen...</p>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6">
          <h2 className="font-display text-3xl">No Routine Found</h2>
          <p className="text-muted-foreground">
            We haven't designed your personalized regimen yet. Take our skin quiz to get started.
          </p>
          <a href="/skin-quiz" className="inline-block bg-gradient-gold text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-gold transition-transform hover:scale-105">
            Start Skin Quiz
          </a>
        </div>
      </div>
    );
  }

  return <RoutineTimeline routineName={routine.routine_name} steps={routine.steps} products={products} />;
}
