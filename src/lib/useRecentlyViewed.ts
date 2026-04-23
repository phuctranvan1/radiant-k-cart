import { useCallback, useEffect, useState } from "react";

const RECENTLY_VIEWED_KEY = "glow_recently_viewed";
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setIds(JSON.parse(stored) as string[]);
      }
    } catch {
      setIds([]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
    }
  }, [ids, isMounted]);

  const addRecentlyViewed = useCallback((id: string) => {
    setIds((prev) => {
      const filtered = prev.filter((x) => x !== id);
      return [id, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { ids, addRecentlyViewed };
}
