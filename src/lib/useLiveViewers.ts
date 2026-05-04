import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks "currently viewing" count for a product using product_views table + realtime.
 * Returns a slightly inflated number for FOMO.
 */
export function useLiveViewers(productId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    let sessionId =
      typeof window !== "undefined" ? localStorage.getItem("glow_session_id") : null;
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("glow_session_id", sessionId);
    }

    // Upsert presence
    supabase
      .from("product_views")
      .upsert(
        { product_id: productId, session_id: sessionId, last_seen: new Date().toISOString() },
        { onConflict: "product_id,session_id" },
      )
      .then(() => {});

    const fetchCount = async () => {
      const sinceISO = new Date(Date.now() - 5 * 60_000).toISOString();
      const { count: c } = await supabase
        .from("product_views")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId)
        .gte("last_seen", sinceISO);
      // Add a tiny "social proof" baseline so it feels lively
      setCount((c ?? 0) + Math.floor(Math.random() * 6) + 2);
    };
    fetchCount();

    const heartbeat = setInterval(() => {
      supabase
        .from("product_views")
        .upsert(
          { product_id: productId, session_id: sessionId!, last_seen: new Date().toISOString() },
          { onConflict: "product_id,session_id" },
        )
        .then(() => {});
      fetchCount();
    }, 45_000);

    const channel = supabase
      .channel(`viewers:${productId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_views", filter: `product_id=eq.${productId}` },
        () => fetchCount(),
      )
      .subscribe();

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return count;
}
