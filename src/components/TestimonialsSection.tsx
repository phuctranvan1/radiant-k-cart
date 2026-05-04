import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Mia K.",
    location: "New York, USA",
    avatar: "MK",
    rating: 5,
    text: "The Beauty of Joseon serum transformed my skin in two weeks. GLOW's curation is genuinely unmatched — everything arrives beautifully packaged and authentic.",
    product: "Beauty of Joseon Serum",
  },
  {
    name: "Sophie L.",
    location: "Paris, France",
    avatar: "SL",
    rating: 5,
    text: "I've tried dozens of K-beauty stores and GLOW is in a league of its own. The COSRX products I ordered arrived in perfect condition with a handwritten note. Stunning experience.",
    product: "COSRX Snail Essence",
  },
  {
    name: "Yuna P.",
    location: "Seoul, Korea",
    avatar: "YP",
    rating: 5,
    text: "Even living in Korea I shop at GLOW for their curation. They find the hidden gems before everyone else. The skin quiz recommended a Sulwhasoo set that's now my holy grail.",
    product: "Sulwhasoo First Care Set",
  },
  {
    name: "Amara D.",
    location: "London, UK",
    avatar: "AD",
    rating: 5,
    text: "Ordered the LANEIGE lip mask and Innisfree set as a gift. The packaging was gorgeous and delivery was lightning fast. I ended up buying a set for myself too!",
    product: "LANEIGE Lip Sleeping Mask",
  },
];

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 reveal-on-scroll">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">LOVED WORLDWIDE</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
          Stories from our <span className="text-gold-shine italic">community</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            className={`reveal-on-scroll stagger-${(i % 4) + 1} luxe-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden`}
          >
            {/* Subtle orb */}
            <div
              className="orb"
              style={{
                width: 100,
                height: 100,
                background: "var(--gold)",
                top: "-30px",
                right: "-20px",
                opacity: 0.08,
              }}
            />

            <Quote size={20} className="shrink-0" style={{ color: "var(--gold)", opacity: 0.6 }} />

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>

            <p className="text-[10px] tracking-widest text-gold/70 uppercase font-medium">
              {t.product}
            </p>

            <div className="flex items-center gap-0.5 mt-auto">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={11} className="fill-current" style={{ color: "var(--gold)" }} />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
