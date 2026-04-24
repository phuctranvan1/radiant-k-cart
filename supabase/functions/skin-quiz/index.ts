import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skinType, concerns, goals, ageRange, sensitivity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get user from auth header (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await admin.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    // Fetch product catalog (lightweight) for AI grounding
    const { data: products } = await admin
      .from("products")
      .select("id,name,brand,description,price,sale_price")
      .limit(60);

    const catalog = (products ?? [])
      .map(
        (p) =>
          `- [${p.id}] ${p.brand ?? ""} ${p.name} — ${(p.description ?? "").slice(0, 80)} ($${p.sale_price ?? p.price})`,
      )
      .join("\n");

    const systemPrompt = `You are a senior Korean skincare consultant for GLOW. Analyze the user's skin profile and recommend a curated routine of 4-6 products from the catalog. Speak warmly, like a luxury department store specialist. Be specific about WHY each product fits.`;

    const userPrompt = `Skin profile:
- Type: ${skinType}
- Concerns: ${concerns.join(", ")}
- Goals: ${goals.join(", ")}
- Age: ${ageRange ?? "n/a"}
- Sensitivity: ${sensitivity ?? "normal"}

Catalog:
${catalog}

Return your analysis and the recommended product IDs.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "skin_routine",
              description: "Personalized routine recommendation",
              parameters: {
                type: "object",
                properties: {
                  analysis: {
                    type: "string",
                    description: "2-3 paragraph warm, expert analysis of the skin profile",
                  },
                  product_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 product UUIDs from the catalog, ordered by routine step",
                  },
                },
                required: ["analysis", "product_ids"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "skin_routine" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited, please retry shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiRes.status === 402)
        return new Response(JSON.stringify({ error: "Out of AI credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const tool = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = tool ? JSON.parse(tool.function.arguments) : { analysis: "", product_ids: [] };

    // Persist if logged in
    if (userId) {
      await admin.from("skin_quiz_results").insert({
        user_id: userId,
        skin_type: skinType,
        concerns,
        goals,
        age_range: ageRange,
        sensitivity,
        ai_analysis: args.analysis,
        recommended_product_ids: args.product_ids,
      });
    }

    return new Response(
      JSON.stringify({ analysis: args.analysis, product_ids: args.product_ids }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("skin-quiz error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
