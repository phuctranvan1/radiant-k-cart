import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — GLOW" },
      {
        name: "description",
        content:
          "An editorial journey through Korean beauty: rituals, textures, and stories from Seoul's most coveted ateliers.",
      },
      { property: "og:title", content: "Lookbook — GLOW" },
      {
        property: "og:description",
        content: "Editorial stories, rituals & textures from Seoul's finest beauty houses.",
      },
    ],
  }),
  component: LookbookPage,
});

const stories = [
  {
    issue: "Issue 01",
    title: "Glass Skin",
    subtitle: "The luminous obsession",
    body: "From Apgujeong studios to global runways, the pursuit of translucent, glass-like skin has redefined modern beauty. A ritual of patience — six steps, ten minutes, one mirror.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&auto=format&fit=crop&q=85",
    tag: "RITUAL",
  },
  {
    issue: "Issue 02",
    title: "Hanok Hours",
    subtitle: "Slow beauty in Bukchon",
    body: "In wooden courtyards lit by paper lanterns, masters blend ginseng, hanbang herbs, and fermented essences passed through five generations.",
    image:
      "https://images.unsplash.com/photo-1583241800698-9c2e0b07f4f1?w=1600&auto=format&fit=crop&q=85",
    tag: "HERITAGE",
  },
  {
    issue: "Issue 03",
    title: "Seoul Night",
    subtitle: "Neon, nuance, restraint",
    body: "Editorial makeup that whispers. Bare lids, gradient lips, and a single luminous highlight catching the rain-slick neon of Hongdae.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600&auto=format&fit=crop&q=85",
    tag: "MAKEUP",
  },
];

function LookbookPage() {
  return (
    <div className="overflow-hidden">
      {/* Editorial cover */}
      <header className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div
          className="orb"
          style={{ top: "10%", left: "10%", width: 400, height: 400, background: "var(--gold)" }}
        />
        <div
          className="orb"
          style={{
            bottom: "5%",
            right: "15%",
            width: 320,
            height: 320,
            background: "var(--gold-deep)",
            animationDelay: "3s",
          }}
        />
        <div className="relative z-10 px-6 reveal">
          <p className="text-xs tracking-[0.5em] text-gold mb-6">VOLUME I · MMXXVI</p>
          <h1 className="font-display text-7xl md:text-9xl leading-[0.9] mb-6">
            <span className="text-gold-shine">The</span>
            <br />
            <em className="not-italic font-light">Lookbook</em>
          </h1>
          <div className="gold-divider w-32 mx-auto my-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-sm tracking-wide">
            An editorial archive of Korean beauty — its rituals, ateliers, and quiet philosophies.
          </p>
        </div>
      </header>

      {/* Stories */}
      <div className="container mx-auto px-4 max-w-7xl py-24 space-y-32">
        {stories.map((s, i) => {
          const reverse = i % 2 === 1;
          return (
            <article
              key={s.issue}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll`}
            >
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-sm ${
                  reverse ? "lg:order-2" : ""
                }`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  onLoad={(e) => e.currentTarget.classList.add("loaded")}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1500ms] ease-out"
                />
                <span className="absolute top-6 left-6 text-[10px] tracking-[0.4em] text-background bg-gold px-3 py-1.5 rounded-full">
                  {s.tag}
                </span>
              </div>
              <div className={`max-w-md ${reverse ? "lg:order-1 lg:ml-auto" : ""}`}>
                <p className="text-xs tracking-[0.4em] text-gold mb-4">{s.issue}</p>
                <h2 className="font-display text-5xl md:text-6xl leading-[0.95] mb-3">{s.title}</h2>
                <p className="font-display italic text-xl text-muted-foreground mb-6">
                  {s.subtitle}
                </p>
                <div className="gold-divider w-16 mb-6" />
                <p className="text-base leading-relaxed text-foreground/85 mb-8">{s.body}</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors"
                >
                  EXPLORE THE EDIT →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Closing manifesto */}
      <section className="relative py-32 text-center bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="container mx-auto px-6 max-w-3xl reveal-on-scroll">
          <p className="text-xs tracking-[0.5em] text-gold mb-6">MANIFESTO</p>
          <p className="font-display text-3xl md:text-5xl leading-tight italic">
            "Beauty is not a moment. It is a slow, deliberate ritual — a quiet dialogue between
            skin, light, and time."
          </p>
          <p className="text-sm tracking-[0.3em] text-muted-foreground mt-8">— THE GLOW EDITORS</p>
        </div>
      </section>
    </div>
  );
}
