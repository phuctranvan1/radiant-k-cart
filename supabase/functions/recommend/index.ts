// AI-powered product recommendations using Lovable AI gateway
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Product {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  ingredients: string | null;
  category_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch source product
    const { data: source } = await supabase
      .from("products")
      .select("id,name,brand,description,ingredients,category_id")
      .eq("id", product_id)
      .maybeSingle();

    if (!source) {
      return new Response(JSON.stringify({ error: "product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch candidate pool (same category first, fall back to broad)
    const { data: candidates } = await supabase
      .from("products")
      .select("id,name,brand,description,ingredients,category_id")
      .neq("id", product_id)
      .limit(40);

    const pool = (candidates ?? []) as Product[];
    if (pool.length === 0) {
      return new Response(JSON.stringify({ ids: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Ask Lovable AI to pick complementary items via tool calling
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // fallback: just return same-category items
      const fallback = pool
        .filter((p) => p.category_id === source.category_id)
        .slice(0, 4)
        .map((p) => p.id);
      return new Response(JSON.stringify({ ids: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceLine = `${source.brand ?? ""} ${source.name} — ${(source.description ?? "").slice(0, 200)}`;
    const candidateList = pool
      .map(
        (p, i) =>
          `${i}. [${p.id}] ${p.brand ?? ""} ${p.name} — ${(p.description ?? "").slice(0, 120)}`,
      )
      .join("\n");

    const prompt = `Source product:\n${sourceLine}\n\nCandidates:\n${candidateList}\n\nPick 4 product IDs that best complement the source for a complete K-beauty routine. Prefer different product types (e.g. cleanser + serum + moisturizer + SPF) over duplicates.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a luxury K-beauty curator. Pick complementary products for a holistic routine.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_products",
              description: "Return the IDs of complementary products",
              parameters: {
                type: "object",
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 4,
                  },
                  reason: { type: "string" },
                },
                required: ["ids"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_products" } },
      }),
    });

    if (!aiRes.ok) {
      console.error("AI gateway error", aiRes.status, await aiRes.text());
      const fallback = pool
        .filter((p) => p.category_id === source.category_id)
        .slice(0, 4)
        .map((p) => p.id);
      return new Response(JSON.stringify({ ids: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    let ids: string[] = [];
    let reason = "";
    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        ids = (parsed.ids ?? []).filter((id: string) => pool.some((p) => p.id === id));
        reason = parsed.reason ?? "";
      } catch (_e) {
        // ignore
      }
    }

    if (ids.length === 0) {
      ids = pool
        .filter((p) => p.category_id === source.category_id)
        .slice(0, 4)
        .map((p) => p.id);
    }

    return new Response(JSON.stringify({ ids, reason, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
