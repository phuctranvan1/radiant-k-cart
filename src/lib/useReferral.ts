import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export type Referral = {
  code: string;
  referred_count: number;
  reward_points: number;
};

export function useReferral() {
  const { user } = useAuth();
  const [data, setData] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return setData(null);
    setLoading(true);
    const { data: row } = await supabase
      .from("referrals")
      .select("code,referred_count,reward_points")
      .eq("user_id", user.id)
      .maybeSingle();
    if (row) setData(row as Referral);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
