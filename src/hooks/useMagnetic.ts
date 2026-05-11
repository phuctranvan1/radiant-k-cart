import { useState, useRef, useEffect, useCallback } from "react";

export function useMagnetic(options: { strength?: number; enabled?: boolean } = {}) {
  const { strength = 15, enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current || !enabled) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Limit the magnetic pull to a specific radius
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const pull = (distance / maxDistance) * strength;
        // We move a fraction of the distance to create the "pull" effect
        // but cap it so it doesn't jump too far
        setPosition({
          x: (distanceX / maxDistance) * strength,
          y: (distanceY / maxDistance) * strength,
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    },
    [strength, enabled],
  );

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (enabled) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, enabled]);

  return {
    ref,
    position,
    resetPosition,
  };
}
