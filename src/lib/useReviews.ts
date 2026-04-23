import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  image_urls: string[] | null;
  texture: string | null;
  scent: string | null;
  finish: string | null;
  skin_type: string | null;
  helpful_count: number;
  verified_buyer: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
};

export function useReviews(product_id: string | undefined) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!product_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product_id)
      .order("helpful_count", { ascending: false })
      .order("created_at", { ascending: false });

    const list = (data ?? []) as Review[];
    // Fetch author profiles
    const userIds = [...new Set(list.map((r) => r.user_id))];
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      list.forEach((r) => {
        const p = map.get(r.user_id);
        r.author_name = p?.display_name ?? "GLOW Member";
        r.author_avatar = p?.avatar_url ?? null;
      });
    }
    setReviews(list);

    if (user) {
      const { data: votes } = await supabase
        .from("review_votes")
        .select("review_id")
        .eq("user_id", user.id)
        .in(
          "review_id",
          list.map((r) => r.id),
        );
      setVotedIds(new Set(votes?.map((v) => v.review_id) ?? []));
    }
    setLoading(false);
  }, [product_id, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitReview = async (input: {
    rating: number;
    title?: string;
    content: string;
    texture?: string;
    scent?: string;
    finish?: string;
    skin_type?: string;
  }) => {
    if (!user || !product_id) {
      toast.error("Please sign in to leave a review");
      return false;
    }
    const { error } = await supabase.from("reviews").upsert(
      {
        product_id,
        user_id: user.id,
        rating: input.rating,
        title: input.title || null,
        content: input.content,
        texture: input.texture || null,
        scent: input.scent || null,
        finish: input.finish || null,
        skin_type: input.skin_type || null,
      },
      { onConflict: "product_id,user_id" },
    );
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("Thank you for your review ✨");
    await refresh();
    return true;
  };

  const toggleHelpful = async (review_id: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    const has = votedIds.has(review_id);
    if (has) {
      await supabase
        .from("review_votes")
        .delete()
        .eq("review_id", review_id)
        .eq("user_id", user.id);
    } else {
      await supabase.from("review_votes").insert({ review_id, user_id: user.id });
    }
    await refresh();
  };

  const summary = (() => {
    if (reviews.length === 0) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      dist[r.rating - 1]++;
    });
    return { avg: sum / reviews.length, total: reviews.length, dist };
  })();

  return { reviews, loading, refresh, submitReview, toggleHelpful, votedIds, summary };
}
