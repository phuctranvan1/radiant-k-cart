// AI Vision skin analysis from a selfie image
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { image_data_url } = await req.json();
    if (!image_data_url) {
      return new Response(JSON.stringify({ error: "image_data_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: products } = await supabase
      .from("products")
      .select("id,name,brand,description,price,sale_price")
      .limit(60);
    const catalog = (products ?? [])
      .map(
        (p) =>
          `- [${p.id}] ${p.brand ?? ""} ${p.name} — ${(p.description ?? "").slice(0, 80)}`,
      )
      .join("\n");

    const system = `You are an expert Korean dermatology consultant. Analyze a user's selfie and identify visible skin concerns (oiliness, acne, redness, hyperpigmentation, dryness, fine lines, dullness, pores). Be encouraging and never alarmist. Recommend 4 products from the catalog tailored to what you observe.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the skin in this selfie. Catalog:\n${catalog}\n\nReturn a structured analysis.`,
              },
              { type: "image_url", image_url: { url: image_data_url } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "skin_analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Skin health 0-100" },
                  skin_type_guess: { type: "string" },
                  concerns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        severity: { type: "string", enum: ["mild", "moderate", "noticeable"] },
                        note: { type: "string" },
                      },
                      required: ["name", "severity", "note"],
                    },
                  },
                  summary: { type: "string", description: "2-3 warm sentences" },
                  product_ids: { type: "array", items: { type: "string" }, maxItems: 4 },
                },
                required: ["overall_score", "skin_type_guess", "concerns", "summary", "product_ids"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "skin_analysis" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI", aiRes.status, t);
      if (aiRes.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiRes.status === 402)
        return new Response(JSON.stringify({ error: "Out of credits" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("AI gateway error");
    }
    const j = await aiRes.json();
    const tool = j.choices?.[0]?.message?.tool_calls?.[0];
    const args = tool ? JSON.parse(tool.function.arguments) : null;
    return new Response(JSON.stringify(args ?? { error: "no analysis" }), {
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
