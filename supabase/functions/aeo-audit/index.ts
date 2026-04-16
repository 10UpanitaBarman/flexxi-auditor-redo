import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScrapedSite {
  url: string;
  title?: string;
  description?: string;
  text?: string;
  html?: string;
  robotsTxt?: string;
  headings?: { h1: string[]; h2: string[]; h3: string[] };
  schemaBlocks?: string[];
  metaTags?: Record<string, string>;
  error?: string;
}

async function fetchRobotsTxt(domain: string): Promise<string> {
  try {
    const res = await fetch(`https://${domain}/robots.txt`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FlexxiAuditBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    return await res.text();
  } catch (e) {
    console.error("robots.txt fetch failed:", e);
    return "";
  }
}

async function scrapeWithApify(domain: string, apifyToken: string): Promise<ScrapedSite> {
  const url = `https://${domain}`;

  // Use Apify's Website Content Crawler (apify/website-content-crawler) in synchronous run mode.
  // We limit to 1 page (the homepage) for speed. The audit only needs entity/structure signals.
  const runUrl = `https://api.apify.com/v2/acts/apify~website-content-crawler/run-sync-get-dataset-items?token=${apifyToken}`;

  const input = {
    startUrls: [{ url }],
    maxCrawlPages: 1,
    maxCrawlDepth: 0,
    crawlerType: "cheerio", // fast, no JS rendering — good enough for SEO/AEO signals
    saveHtml: true,
    saveMarkdown: false,
    proxyConfiguration: { useApifyProxy: true },
  };

  try {
    const res = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Apify error:", res.status, t);
      return { url, error: `Apify scrape failed: ${res.status}` };
    }

    const items = await res.json();
    const page = Array.isArray(items) && items.length > 0 ? items[0] : null;
    if (!page) return { url, error: "Apify returned no pages" };

    const html: string = page.html || "";

    // Extract headings
    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])).slice(0, 10);
    const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1])).slice(0, 20);
    const h3 = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => stripTags(m[1])).slice(0, 30);

    // Extract JSON-LD schema blocks
    const schemaBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map((m) => m[1].trim())
      .slice(0, 10);

    // Extract meta tags
    const metaTags: Record<string, string> = {};
    for (const m of html.matchAll(/<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']*)["']/gi)) {
      metaTags[m[1]] = m[2];
    }

    return {
      url,
      title: page.metadata?.title || page.title || "",
      description: page.metadata?.description || metaTags["description"] || "",
      text: (page.text || "").slice(0, 8000),
      html: html.slice(0, 20000),
      headings: { h1, h2, h3 },
      schemaBlocks,
      metaTags,
    };
  } catch (e) {
    console.error("Apify scrape exception:", e);
    return { url, error: e instanceof Error ? e.message : "Unknown scrape error" };
  }
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

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

    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) throw new Error("APIFY_API_TOKEN is not configured");

    // Scrape site + robots.txt in parallel
    console.log(`Scraping ${domain}...`);
    const [scraped, robotsTxt] = await Promise.all([
      scrapeWithApify(domain, APIFY_API_TOKEN),
      fetchRobotsTxt(domain),
    ]);
    scraped.robotsTxt = robotsTxt;

    console.log(`Scrape complete. Title: "${scraped.title}", schema blocks: ${scraped.schemaBlocks?.length}, error: ${scraped.error || "none"}`);

    // Build the evidence block for the AI
    const evidence = `
ACTUAL SCRAPED DATA FOR ${domain}:

PAGE TITLE: ${scraped.title || "(none)"}
META DESCRIPTION: ${scraped.description || "(none)"}

H1 TAGS (${scraped.headings?.h1.length || 0}): ${JSON.stringify(scraped.headings?.h1 || [])}
H2 TAGS (${scraped.headings?.h2.length || 0}): ${JSON.stringify(scraped.headings?.h2 || [])}
H3 TAGS (${scraped.headings?.h3.length || 0}): ${JSON.stringify(scraped.headings?.h3 || [])}

SCHEMA.ORG JSON-LD BLOCKS FOUND: ${scraped.schemaBlocks?.length || 0}
${scraped.schemaBlocks?.length ? "SCHEMA CONTENT:\n" + scraped.schemaBlocks.join("\n---\n").slice(0, 4000) : "NO SCHEMA MARKUP DETECTED"}

META TAGS: ${JSON.stringify(scraped.metaTags || {}).slice(0, 2000)}

ROBOTS.TXT (${robotsTxt.length} chars):
${robotsTxt.slice(0, 3000) || "(no robots.txt found or empty)"}

HOMEPAGE TEXT EXCERPT (first 8000 chars):
${scraped.text || "(no text extracted)"}

${scraped.error ? `SCRAPE WARNING: ${scraped.error}` : ""}
`.trim();

    const prompt = `You are an expert AEO (Answer Engine Optimisation) and digital presence auditor. You produce detailed, narrative-style audit reports similar to professional consulting deliverables.

TASK: Audit the website at this domain: ${domain}

You have been given REAL SCRAPED DATA from the site below. Base every observation on this real data. Quote actual H1s, actual schema blocks, actual robots.txt rules. Do NOT make up or hallucinate observations.

${evidence}

Now produce a comprehensive audit with the following JSON structure. Reference the real data above.

SCORING (0-20 each, be strict, base on actual evidence):
- schema_score: count and quality of JSON-LD schema blocks above (0 blocks = 0-3, basic Organization = 8-12, FAQ+Org+more = 15-20)
- crawler_score: based on actual robots.txt rules — does it allow GPTBot, ClaudeBot, PerplexityBot, Googlebot?
- entity_score: is brand + category clear in actual H1 / title / first text?
- structure_score: count of H2/H3 in actual headings, presence of FAQ-like content
- nap_score: name/category consistency between actual title, H1, meta description

RETURN THIS EXACT JSON STRUCTURE:

{
  "headline": "One powerful sentence summarizing the overall finding — direct and impactful.",
  "key_findings": ["Finding 1: detailed paragraph quoting real evidence...", "...", "...", "...", "..."],
  "stats": [
    { "label": "Schema blocks", "value": "<actual count>" },
    { "label": "AI Visibility Score", "value": "<X>/100" },
    { "label": "<metric>", "value": "<value>" },
    { "label": "<metric>", "value": "<value>" }
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
      "title": "Short finding title",
      "summary": "2-3 paragraphs quoting real evidence from the scrape.",
      "evidence": ["Specific data point quoting actual scraped content", "...", "..."],
      "impact": "Business impact paragraph."
    }
  ],
  "tech_stack": [
    { "layer": "...", "technology": "...", "assessment": "Good|Risk|Warning|Unknown", "notes": "..." }
  ],
  "competitive": [
    { "capability": "...", "client_status": "...", "best_in_class": "...", "gap": "Critical|High|Medium|Opportunity|Quick Win" }
  ],
  "recommendations": [
    { "title": "...", "severity": "Critical|High|Medium", "timeframe": "...", "description": "..." }
  ]
}

REQUIREMENTS:
- Exactly 5 key_findings, each grounded in the scraped data
- Exactly 4 stats
- 4-6 detailed_findings with real evidence quotes
- 4-6 tech_stack rows
- 6-8 competitive positioning rows
- 8-10 recommendations ordered by priority
- Quote actual H1s, actual schema, actual robots.txt rules in evidence arrays
- If scrape returned an error, note it but still audit based on what was retrieved

Return ONLY valid JSON. No markdown. No preamble. Start with { and end with }.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 6000,
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
