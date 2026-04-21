import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About GLOW — Our Story" }, { name: "description", content: "GLOW is a luxury Korean beauty boutique handpicking the finest from Seoul." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">OUR STORY</p>
        <h1 className="font-display text-5xl md:text-6xl">Beauty, distilled from Seoul</h1>
      </div>

      <div className="prose prose-invert max-w-none mb-16">
        <p className="text-lg text-muted-foreground leading-relaxed">
          GLOW began in a small atelier in Gangnam — a love letter to the precision, ritual, and quiet luxury that defines Korean beauty.
          Today, we curate the most coveted K-beauty essentials from celebrated houses and emerging Seoul ateliers, bringing each
          to your door with the same care we'd give a treasured heirloom.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mt-4">
          We believe beauty is not a routine — it's a ritual. Every serum, every cushion, every sheet mask we offer has been
          tested by our team and chosen for one reason: it makes us glow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Sparkles, t: "Curated, never compromised", d: "Each product is hand-selected for quality, performance, and provenance." },
          { icon: Heart, t: "Cruelty-free always", d: "We only partner with brands that share our reverence for life." },
          { icon: Award, t: "Authentic, guaranteed", d: "Sourced direct from authorized Seoul distributors." },
        ].map((v) => (
          <div key={v.t} className="luxe-card rounded-xl p-6 text-center">
            <v.icon className="mx-auto mb-3" size={28} style={{ color: "var(--gold)" }} />
            <h3 className="font-display text-xl mb-2">{v.t}</h3>
            <p className="text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="text-center luxe-card rounded-2xl p-12 border-gold">
        <h2 className="font-display text-3xl mb-4">Begin your ritual</h2>
        <p className="text-muted-foreground mb-6">Discover our curated edit of luxury K-beauty.</p>
        <Link to="/products"><Button size="lg" className="bg-gradient-gold text-primary-foreground">Shop the Collection</Button></Link>
      </div>
    </div>
  );
}
