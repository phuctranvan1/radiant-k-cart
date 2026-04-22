import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
    setIds((prev) => {
      const has = prev.includes(id);
      if (has) {
        toast("Removed from wishlist");
        return prev.filter((x) => x !== id);
      }
      toast.success("Saved to wishlist");
      return [...prev, id];
    });
  }, []);

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, isWishlisted };
}
