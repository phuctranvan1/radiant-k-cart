// AI Product Synergy - Finds the "Perfect Pair" for a product
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch source product
    const { data: source } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (!source) throw new Error("Product not found");

    // 2. Fetch candidates (broad pool)
    const { data: pool } = await supabase
      .from("products")
      .select("id,name,brand,description,ingredients")
      .neq("id", product_id)
      .limit(50);

    const candidates = (pool ?? []).map((p, i) =>
      `${i}. [${p.id}] ${p.brand} ${p.name} - ${p.description}`
    ).join("\n");

    const systemPrompt = `You are a luxury K-beauty chemist. Identify a "Perfect Pair" product that synergistically enhances the source product.
    Example: If source is Vitamin C, a perfect pair is a high-SPF sunscreen (protects Vitamin C and enhances glow).
    Example: If source is Retinol, a perfect pair is Hyaluronic Acid (reduces irritation).
    Only recommend products that are chemically compatible and beneficial together.`;

    const userPrompt = `Source Product: ${source.brand} ${source.name}
    Ingredients/Purpose: ${source.description}

    Candidates:
    ${candidates}

    Return the product ID and a sophisticated explanation of WHY they are a perfect pair.`;

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
              name: "suggest_synergy",
              description: "Suggest a synergistic product pair",
              parameters: {
                type: "object",
                properties: {
                  product_id: { type: "string" },
                  reason: { type: "string", description: "Luxury explanation of the synergy" },
                },
                required: ["product_id", "reason"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_synergy" } },
      }),
    });

    if (!aiRes.ok) throw new Error("AI gateway error");
    const aiData = await aiRes.json();
    const tool = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = tool ? JSON.parse(tool.function.arguments) : null;

    if (!result) throw new Error("No synergy found");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
