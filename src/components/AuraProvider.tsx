import React, { createContext, useContext, useEffect, useState } from "react";

const AuraContext = createContext<{ x: string; y: string }>({ x: "50%", y: "50%" });

export function AuraProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert pixel coordinates to percentages for the CSS radial-gradient
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;

      setCoords({
        x: `${xPercent}%`,
        y: `${yPercent}%`,
      });

      // Update CSS variables directly for performance to avoid React render cycle for every mouse move
      document.documentElement.style.setProperty("--aura-x", `${xPercent}%`);
      document.documentElement.style.setProperty("--aura-y", `${yPercent}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return <AuraContext.Provider value={coords}>{children}</AuraContext.Provider>;
}

export const useAura = () => useContext(AuraContext);
