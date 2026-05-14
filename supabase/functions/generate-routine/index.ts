// AI-Powered Routine Builder - Generates a structured skincare regimen
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
  category_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skinProfile, user_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch catalog for grounding
    const { data: products } = await supabase
      .from("products")
      .select("id,name,brand,description,category_id")
      .limit(60);

    const catalog = (products ?? [])
      .map((p) => `- [${p.id}] ${p.brand ?? ""} ${p.name} — ${p.description ?? ""}`)
      .join("\n");

    const systemPrompt = `You are a luxury K-beauty dermatologist. Create a structured skincare routine based on the user's profile.
    Order products correctly (cleansers first, then actives/serums, then moisturizers, SPF last).
    Differentiate between AM and PM rituals.
    Use the provided catalog for product selection.`;

    const userPrompt = `User Skin Profile:
    - Type: ${skinProfile.type}
    - Concerns: ${skinProfile.concerns.join(", ")}
    - Goals: ${skinProfile.goals.join(", ")}
    - Age: ${skinProfile.ageRange}
    - Sensitivity: ${skinProfile.sensitivity}

    Catalog:
    ${catalog}

    Return a structured JSON routine.`;

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
              name: "create_routine",
              description: "Generate a structured daily skincare routine",
              parameters: {
                type: "object",
                properties: {
                  routine_name: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_number: { type: "number" },
                        product_id: { type: "string" },
                        timing: { type: "string", enum: ["AM", "PM", "Both"] },
                        instruction: { type: "string", description: "How to use this product in the routine" },
                      },
                      required: ["step_number", "product_id", "timing", "instruction"],
                    },
                  },
                },
                required: ["routine_name", "steps"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_routine" } },
      }),
    });

    if (!aiRes.ok) throw new Error("AI gateway error");
    const aiData = await aiRes.json();
    const tool = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const routine = tool ? JSON.parse(tool.function.arguments) : null;

    if (!routine) throw new Error("Failed to generate routine");

    // 2. Persist routine if user_id is provided
    if (user_id) {
      await supabase.from("user_routines").upsert({
        user_id,
        routine_name: routine.routine_name,
        steps: routine.steps,
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify(routine), {
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
