import { useCallback, useEffect, useState } from "react";

const WISHLIST_KEY = "glow_wishlist";

export function useWishlist() {
  const [ids, setIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, isWishlisted };
}
