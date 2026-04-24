import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type LoyaltyTier = "silver" | "gold" | "diamond";

export type LoyaltyData = {
  points: number;
  lifetime_points: number;
  tier: LoyaltyTier;
};

const TIER_THRESHOLDS = {
  silver: 0,
  gold: 1000,
  diamond: 5000,
} as const;

export function tierFor(lifetime: number): LoyaltyTier {
  if (lifetime >= TIER_THRESHOLDS.diamond) return "diamond";
  if (lifetime >= TIER_THRESHOLDS.gold) return "gold";
  return "silver";
}

export function nextTierProgress(lifetime: number) {
  if (lifetime >= TIER_THRESHOLDS.diamond)
    return { next: null as LoyaltyTier | null, remaining: 0, percent: 100 };
  if (lifetime >= TIER_THRESHOLDS.gold) {
    const span = TIER_THRESHOLDS.diamond - TIER_THRESHOLDS.gold;
    const done = lifetime - TIER_THRESHOLDS.gold;
    return { next: "diamond" as const, remaining: TIER_THRESHOLDS.diamond - lifetime, percent: (done / span) * 100 };
  }
  const span = TIER_THRESHOLDS.gold;
  return { next: "gold" as const, remaining: TIER_THRESHOLDS.gold - lifetime, percent: (lifetime / span) * 100 };
}

export function useLoyalty() {
  const { user } = useAuth();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }
    setLoading(true);
    const { data: row } = await supabase
      .from("loyalty_points")
      .select("points,lifetime_points,tier")
      .eq("user_id", user.id)
      .maybeSingle();
    if (row) setData(row as LoyaltyData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
