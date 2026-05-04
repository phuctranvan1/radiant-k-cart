import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency";
import { QUIZ_PRODUCT_IDS_KEY } from "@/components/ForYouSection";

export const Route = createFileRoute("/skin-quiz")({
  head: () => ({
    meta: [
      { title: "Skin Quiz — Personal Routine | GLOW" },
      {
        name: "description",
        content:
          "Take our 6-question skin quiz and let our AI consultant craft a personalized K-beauty routine for you.",
      },
    ],
  }),
  component: SkinQuizPage,
});

const STEPS = [
  {
    key: "skinType",
    title: "What's your skin type?",
    options: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
    multi: false,
  },
  {
    key: "concerns",
    title: "What concerns you most?",
    options: ["Dullness", "Acne", "Fine lines", "Dark spots", "Pores", "Redness", "Dehydration"],
    multi: true,
  },
  {
    key: "goals",
    title: "What's your dream result?",
    options: ["Glass skin", "Anti-aging", "Even tone", "Hydration", "Oil control", "Glow"],
    multi: true,
  },
  {
    key: "ageRange",
    title: "Your age range?",
    options: ["Under 20", "20-29", "30-39", "40-49", "50+"],
    multi: false,
  },
  {
    key: "sensitivity",
    title: "Sensitivity level?",
    options: ["Not sensitive", "Mildly sensitive", "Very sensitive"],
    multi: false,
  },
] as const;

type Answers = {
  skinType?: string;
  concerns: string[];
  goals: string[];
  ageRange?: string;
  sensitivity?: string;
};

type ResultProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
};

function SkinQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ concerns: [], goals: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; products: ResultProduct[] } | null>(
    null,
  );
  const { fmt } = useCurrency();

  const current = STEPS[step];
  const value = answers[current.key as keyof Answers];
  const canNext = current.multi
    ? Array.isArray(value) && value.length > 0
    : typeof value === "string" && value.length > 0;

  const select = (opt: string) => {
    setAnswers((prev) => {
      if (current.multi) {
        const arr = (prev[current.key as "concerns" | "goals"] || []) as string[];
        return {
          ...prev,
          [current.key]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
        };
      }
      return { ...prev, [current.key]: opt };
    });
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skin-quiz", {
        body: {
          skinType: answers.skinType,
          concerns: answers.concerns,
          goals: answers.goals,
          ageRange: answers.ageRange,
          sensitivity: answers.sensitivity,
        },
      });
      if (error) throw error;
      const ids: string[] = data.product_ids || [];
      const { data: products } = await supabase
        .from("products")
        .select("id,name,slug,brand,price,sale_price,image_url")
        .in("id", ids);
      // preserve AI ordering
      const ordered = ids
        .map((id) => products?.find((p) => p.id === id))
        .filter(Boolean) as ResultProduct[];
      setResult({ analysis: data.analysis, products: ordered });
      // Persist quiz product IDs for the "For You" feed
      localStorage.setItem(QUIZ_PRODUCT_IDS_KEY, JSON.stringify(ids.slice(0, 8)));
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate your routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-20">
        <div className="text-center mb-12 reveal">
          <p className="text-xs tracking-[0.5em] text-gold mb-4">YOUR PERSONAL ROUTINE</p>
          <h1 className="font-display text-5xl md:text-6xl mb-4">
            <span className="text-gold-shine">Curated</span> for you
          </h1>
          <div className="gold-divider w-24 mx-auto" />
        </div>

        <div className="luxe-card p-8 rounded-2xl mb-12 reveal">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="text-gold flex-shrink-0 mt-1" size={20} />
            <p className="text-sm tracking-[0.3em] text-gold uppercase">Expert Analysis</p>
          </div>
          <p className="text-base leading-relaxed text-foreground/85 whitespace-pre-line">
            {result.analysis}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.products.map((p, i) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group relative reveal-on-scroll"
            >
              <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-gold text-primary-foreground text-xs font-bold flex items-center justify-center shadow-gold">
                {i + 1}
              </div>
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-3">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
              </div>
              {p.brand && (
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {p.brand}
                </p>
              )}
              <h3 className="font-display text-base leading-tight mt-1">{p.name}</h3>
              <p className="text-sm text-gold font-semibold mt-1">{fmt(p.sale_price ?? p.price)}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setStep(0);
              setAnswers({ concerns: [], goals: [] });
            }}
          >
            Retake the quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-20">
      <div className="text-center mb-10 reveal">
        <p className="text-xs tracking-[0.5em] text-gold mb-4">SKIN CONSULTATION</p>
        <h1 className="font-display text-5xl md:text-6xl mb-4">
          The <em className="not-italic font-light text-gold-shine">Glow</em> Quiz
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Six gentle questions. One AI-curated routine handpicked just for your skin.
        </p>
        <div className="gold-divider w-20 mx-auto mt-6" />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-gradient-gold" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="luxe-card p-8 md:p-10 rounded-2xl">
        <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-3">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="font-display text-3xl md:text-4xl mb-8">{current.title}</h2>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => {
            const isSelected = current.multi
              ? ((answers[current.key as "concerns" | "goals"] || []) as string[]).includes(opt)
              : answers[current.key as keyof Answers] === opt;
            return (
              <button
                key={opt}
                onClick={() => select(opt)}
                className={`relative p-4 rounded-lg border text-sm text-left transition-all ${
                  isSelected
                    ? "border-gold bg-gold/5 text-foreground shadow-gold"
                    : "border-border hover:border-gold/40"
                }`}
              >
                {isSelected && (
                  <Check
                    size={14}
                    className="absolute top-2 right-2 text-gold"
                    style={{ color: "var(--gold)" }}
                  />
                )}
                {opt}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="bg-gradient-gold text-primary-foreground"
            >
              Continue <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={!canNext || loading}
              className="bg-gradient-gold text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Reveal my routine <Sparkles size={16} className="ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
