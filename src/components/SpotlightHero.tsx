import { useEffect, useRef, ReactNode } from "react";

/**
 * Wraps hero content with a mouse-following gold spotlight glow.
 * Falls back to a static gradient on touch / reduced-motion devices.
 */
export function SpotlightHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        ["--spot-x" as string]: "50%",
        ["--spot-y" as string]: "30%",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle 500px at var(--spot-x) var(--spot-y), oklch(0.78 0.14 80 / 0.18), transparent 65%)",
        }}
      />
      {children}
    </div>
  );
}
