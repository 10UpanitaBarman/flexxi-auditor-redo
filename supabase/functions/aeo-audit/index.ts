import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return new Response(JSON.stringify({ error: "domain is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an AEO (Answer Engine Optimisation) auditor for design and branding agencies.

TASK: Audit the website at this domain: ${domain}

Score each signal 0-20. Be strict. Partial implementation scores half.

SIGNALS:
- schema_score: FAQPage, Organization, or HowTo schema present (0-20)
- crawler_score: GPTBot, PerplexityBot, ClaudeBot not blocked in robots.txt (0-20)
- entity_score: brand name + category clearly stated in first 200 words (0-20)
- structure_score: FAQ sections, clear H2/H3 headings, comparison content (0-20)
- nap_score: name, location, and category consistent across page (0-20)

ALSO RETURN:
- niche: industry/service category, 5 words max
- competitor: one well-known competitor AI engines cite more often
- competitor_reason: one sentence why, max 20 words
- crawler_gptbot: "pass", "fail", or "warn"
- crawler_claudebot: "pass", "fail", or "warn"
- crawler_perplexity: "pass", "fail", or "warn"
- crawler_google: "pass", "fail", or "warn"
- robots_present: "pass", "fail", or "warn"
- flags: exactly 3 specific AEO failures found, each under 12 words
- recommendations: exactly 6 objects with:
    h: recommendation title (max 6 words)
    p: description (max 20 words)
    tag: "quick" | "med" | "long"

Return ONLY valid JSON. No markdown. No preamble. Start with { and end with }.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);

    return new Response(JSON.stringify({ ...parsed, domain }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aeo-audit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
