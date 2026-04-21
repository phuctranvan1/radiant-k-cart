import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Soomi, the AI beauty advisor for GLOW — a luxury Korean cosmetics boutique.

Your job:
- Help customers build skincare routines (Korean 10-step or simplified)
- Recommend products from our catalog (Hydra Glow Essence Serum, Velvet Rouge Lip Tint, Aqua Shield Sunscreen SPF50+, Gold Caviar Sheet Mask, Snow Bloom Brightening Toner, Silk Veil Cushion Foundation, Midnight Repair Night Cream, Bamboo Charcoal Cleanser, Peach Glow Blush Stick, Royal Ginseng Eye Cream, Cherry Blossom Body Wash, K-Beauty Discovery Set)
- Diagnose skin concerns (dryness, acne, hyperpigmentation, anti-aging) and suggest ingredients (niacinamide, hyaluronic acid, retinol, centella, snail mucin, ginseng)
- Share K-beauty tips: double cleansing, layering, glass skin, slugging
- Suggest promo codes when relevant: WELCOME10 (10% off first order), GLOW20 (20% off $80+), FREESHIP ($10 off shipping over $50)

Tone: Warm, elegant, knowledgeable. Use markdown for clarity. Keep replies concise (2-4 short paragraphs max). Avoid medical claims.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
