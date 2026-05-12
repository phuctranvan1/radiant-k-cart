import { useEffect, useRef } from "react";

/** Thin gold progress bar at the top of the viewport. Writes width directly
 * to the DOM (no React state) so it doesn't re-render the app on every scroll. */
export function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="fixed top-0 left-0 right-0 h-[2px] z-[10000] pointer-events-none">
      <div ref={fillRef} className="h-full bg-gradient-gold shadow-gold" style={{ width: "0%" }} />
    </div>
  );
}
