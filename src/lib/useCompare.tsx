import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

const KEY = "glow_compare";
const MAX = 4;

type Ctx = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isCompared: (id: string) => boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CompareCtx = createContext<Ctx>({
  ids: [],
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  isCompared: () => false,
  open: false,
  setOpen: () => {},
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, mounted]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        toast("Removed from compare");
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX) {
        toast.error(`You can compare up to ${MAX} products`);
        return prev;
      }
      toast.success("Added to compare");
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);
  const isCompared = useCallback((id: string) => ids.includes(id), [ids]);

  return (
    <CompareCtx.Provider value={{ ids, toggle, remove, clear, isCompared, open, setOpen }}>
      {children}
    </CompareCtx.Provider>
  );
}

export const useCompare = () => useContext(CompareCtx);
