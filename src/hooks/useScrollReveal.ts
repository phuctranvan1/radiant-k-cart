import { useEffect } from "react";

/**
 * Adds `.is-visible` to any element with `.reveal-on-scroll` when it enters the viewport.
 * Uses a MutationObserver so elements added asynchronously (e.g. after data fetches) are
 * also observed. Respects prefers-reduced-motion (immediately reveals everything).
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      document
        .querySelectorAll<HTMLElement>(".reveal-on-scroll")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    const observe = (el: Element) => {
      if (el.classList.contains("reveal-on-scroll") && !el.classList.contains("is-visible")) {
        io.observe(el);
      }
    };

    // Observe elements already in the DOM
    document.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach(observe);

    // Observe elements added later (async data loads)
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          observe(el);
          el.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
