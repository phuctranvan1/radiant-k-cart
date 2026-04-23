import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth";

const WISHLIST_KEY = "glow_wishlist";

export function useWishlist() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [ids, setIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setIds(JSON.parse(stored) as string[]);
      }
    } catch {
      setIds([]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    }
  }, [ids, isMounted]);

  const requireAuth = useCallback(() => {
    if (loading) return false;
    if (!user) {
      toast.error("Please sign in to use your wishlist", {
        action: {
          label: "Sign in",
          onClick: () =>
            navigate({
              to: "/auth",
              search: { redirect: window.location.pathname + window.location.search },
            }),
        },
      });
      return false;
    }
    return true;
  }, [user, loading, navigate]);

  const toggle = useCallback(
    (id: string) => {
      if (!requireAuth()) return;
      setIds((prev) => {
        const has = prev.includes(id);
        if (has) {
          toast("Removed from wishlist");
          return prev.filter((x) => x !== id);
        }
        toast.success("Saved to wishlist");
        return [...prev, id];
      });
    },
    [requireAuth],
  );

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, isWishlisted };
}
