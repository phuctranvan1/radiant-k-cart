import React, { createContext, useContext, useEffect } from "react";

const AuraContext = createContext<{ x: string; y: string }>({ x: "50%", y: "50%" });

/**
 * Tracks the cursor for the gold "aura" radial gradient. Writes CSS variables
 * directly to <html> via rAF — no React state, so it doesn't re-render the
 * entire app tree on every mousemove.
 */
export function AuraProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let nx = 50;
    let ny = 50;
    const onMove = (e: MouseEvent) => {
      nx = (e.clientX / window.innerWidth) * 100;
      ny = (e.clientY / window.innerHeight) * 100;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.documentElement.style.setProperty("--aura-x", `${nx}%`);
        document.documentElement.style.setProperty("--aura-y", `${ny}%`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AuraContext.Provider value={{ x: "50%", y: "50%" }}>{children}</AuraContext.Provider>
  );
}

export const useAura = () => useContext(AuraContext);
