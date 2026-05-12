import { useRef, useEffect } from "react";

/**
 * Magnetic-pull effect. Listens to mousemove ONLY while the cursor is over
 * the element (via pointerenter/leave) and writes transform directly to
 * the DOM — no React state, no global listeners — to keep pages with many
 * magnetic buttons (e.g. product grids) buttery smooth.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  options: { strength?: number; enabled?: boolean } = {},
) {
  const { strength = 15, enabled = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let rect: DOMRect | null = null;

    const apply = (x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      if (!rect) return;
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = 100;
        const tx = (Math.max(-max, Math.min(max, dx)) / max) * strength;
        const ty = (Math.max(-max, Math.min(max, dy)) / max) * strength;
        apply(tx, ty);
      });
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.addEventListener("mousemove", onMove);
    };
    const onLeave = () => {
      el.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      apply(0, 0);
    };

    el.style.transition = "transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)";
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [enabled, strength]);

  return { ref };
}
