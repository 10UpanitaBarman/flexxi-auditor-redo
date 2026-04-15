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

    const prompt = `You are an expert AEO (Answer Engine Optimisation) and digital presence auditor. You produce detailed, narrative-style audit reports similar to professional consulting deliverables.

TASK: Audit the website at this domain: ${domain}

Produce a comprehensive audit with the following JSON structure. Be specific, detailed, and reference real observations. Write as if presenting to a C-level executive.

SCORING (0-20 each, be strict):
- schema_score: FAQPage, Organization, HowTo, or other schema markup present
- crawler_score: GPTBot, PerplexityBot, ClaudeBot access in robots.txt
- entity_score: brand name + category clarity in first 200 words
- structure_score: FAQ sections, H2/H3 hierarchy, comparison content
- nap_score: name, location, category consistency

RETURN THIS EXACT JSON STRUCTURE:

{
  "headline": "One powerful sentence summarizing the overall finding — direct and impactful, like: 'Your product is excellent. Your digital presence is not.'",
  
  "key_findings": [
    "Finding 1: A detailed paragraph (3-5 sentences) about a specific critical issue found. Be concrete — mention exact pages, elements, or configurations observed. Explain why it matters in business terms.",
    "Finding 2: ...",
    "Finding 3: ...",
    "Finding 4: ...",
    "Finding 5: ..."
  ],
  
  "stats": [
    { "label": "Short stat label", "value": "Striking value or word" },
    { "label": "Another stat", "value": "Value" },
    { "label": "Another stat", "value": "Value" },
    { "label": "Another stat", "value": "Value" }
  ],
  
  "schema_score": 0,
  "crawler_score": 0,
  "entity_score": 0,
  "structure_score": 0,
  "nap_score": 0,
  "niche": "Industry category, 5 words max",
  
  "crawler_gptbot": "pass|fail|warn",
  "crawler_claudebot": "pass|fail|warn",
  "crawler_perplexity": "pass|fail|warn",
  "crawler_google": "pass|fail|warn",
  "robots_present": "pass|fail|warn",
  
  "detailed_findings": [
    {
      "severity": "Critical|High|Medium",
      "title": "Short finding title (e.g. 'Near-Invisible to Search Engines')",
      "summary": "2-3 paragraphs explaining the finding in detail. Be specific about what was observed, what the technical issue is, and why it matters. Include concrete examples from the actual site. Write like a senior consultant explaining to a business owner.",
      "evidence": [
        "Specific data point or observation 1",
        "Specific data point or observation 2",
        "Specific data point or observation 3"
      ],
      "impact": "One paragraph explaining the business impact — lost revenue, missed opportunities, competitive disadvantage."
    }
  ],
  
  "tech_stack": [
    {
      "layer": "Website Platform",
      "technology": "Name of technology detected",
      "assessment": "Good|Risk|Warning|Unknown",
      "notes": "Brief explanation of what was observed"
    }
  ],
  
  "competitive": [
    {
      "capability": "What's being compared (e.g. 'Schema Markup')",
      "client_status": "Current state for this domain",
      "best_in_class": "What top competitors do",
      "gap": "Critical|High|Medium|Opportunity|Quick Win"
    }
  ],
  
  "recommendations": [
    {
      "title": "Clear action title (e.g. 'Add Organization schema markup')",
      "severity": "Critical|High|Medium",
      "timeframe": "Specific timeframe (e.g. '1 hour', '1-2 days', '2-4 weeks')",
      "description": "2-3 sentences explaining what to do and why it matters. Be actionable and specific."
    }
  ]
}

REQUIREMENTS:
- Return exactly 5 key_findings, each a detailed paragraph
- Return exactly 4 stats with striking metrics
- Return 4-6 detailed_findings with full narratives
- Return 4-6 tech_stack rows
- Return 6-8 competitive positioning rows
- Return 8-10 recommendations ordered by priority
- All text should be professional, specific, and reference real observations about the site
- Do NOT use generic filler text — every finding must be specific to this domain
- Write impact statements in business terms (lost clients, missed revenue, competitive disadvantage)

Return ONLY valid JSON. No markdown. No preamble. Start with { and end with }.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 4096,
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
