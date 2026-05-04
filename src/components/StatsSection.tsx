import { useEffect, useRef, useState } from "react";
import { Users, Package, Star, Globe } from "lucide-react";

const STATS = [
  { icon: Users, value: 42000, suffix: "+", label: "Happy customers" },
  { icon: Package, value: 350, suffix: "+", label: "Curated products" },
  { icon: Star, value: 4.9, suffix: "", label: "Average rating", decimals: 1 },
  { icon: Globe, value: 60, suffix: "+", label: "Countries served" },
];

function useCountUp(target: number, decimals: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, decimals, active]);
  return value;
}

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  decimals = 0,
  active,
}: (typeof STATS)[0] & { active: boolean }) {
  const display = useCountUp(value, decimals, active);
  return (
    <div className="hover-float flex flex-col items-center gap-3 py-8 px-4 reveal-on-scroll">
      <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-1">
        <Icon className="text-primary-foreground" size={22} />
      </div>
      <p className="font-display text-4xl md:text-5xl text-gold-shine">
        {decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground tracking-wide">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative border-y border-border/40 overflow-hidden bg-card/20 py-4"
    >
      <div
        className="orb"
        style={{
          width: 320,
          height: 320,
          background: "var(--gold)",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.1,
        }}
      />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
