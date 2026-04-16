import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTOR_URL = "https://api.apify.com/v2/acts/responsible_bookmark~ai-search-visibility-audit/run-sync-get-dataset-items";

type Severity = "Critical" | "High" | "Medium";
type Status = "pass" | "fail" | "warn";

// Map a 0-100 sub-score to our 0-20 scale
const to20 = (n: number) => Math.round(Math.max(0, Math.min(100, n || 0)) / 5);

function botStatus(allowedBots: string[], blockedBots: string[], bot: string): Status {
  const allowed = allowedBots?.some((b) => b.toLowerCase().includes(bot.toLowerCase()));
  const blocked = blockedBots?.some((b) => b.toLowerCase().includes(bot.toLowerCase()));
  if (blocked) return "fail";
  if (allowed) return "pass";
  return "warn";
}

function severityFromIssue(sev: string): Severity {
  if (sev === "critical") return "Critical";
  if (sev === "warning") return "High";
  return "Medium";
}

function gapFromImpact(impact: string): "Critical" | "High" | "Medium" | "Opportunity" | "Quick Win" {
  if (impact === "high") return "Critical";
  if (impact === "medium") return "High";
  return "Opportunity";
}

function timeframeFromPriority(priority: number): string {
  if (priority <= 1) return "Immediate";
  if (priority === 2) return "1-2 days";
  if (priority === 3) return "1 week";
  return "2-4 weeks";
}

function buildHeadline(score: number, gradeLabel: string, domain: string): string {
  if (score >= 85) return `${domain} is citation-ready. AI engines can find, parse, and quote you with confidence.`;
  if (score >= 70) return `${domain} is competitive in AI search — but a few clear gaps are leaving citations on the table.`;
  if (score >= 50) return `${domain} is partially visible to AI engines. The foundations are there; the structured signals are not.`;
  if (score >= 30) return `${domain} is barely showing up in AI search. Critical signals are missing across schema, content and entity.`;
  return `${domain} is effectively invisible to AI engines. This is fixable — but every day of inaction is a competitor gaining ground.`;
}

interface ActorAudit {
  overallGEOScore: number;
  grade: string;
  gradeLabel: string;
  categoryScores: {
    crawlability: number;
    entity: number;
    content: number;
    schema: number;
    authority: number;
    aiOptimisation: number;
  };
  crawlability: any;
  entity: any;
  content: any;
  schema: any;
  authority: any;
  aiOptimisation: any;
  issues: {
    critical: any[];
    warnings: any[];
    info: any[];
  };
}

function mapToAuditResult(domain: string, actorOutput: any) {
  const audit: ActorAudit = actorOutput.audit;
  if (!audit) throw new Error("Actor returned no audit object");

  const cats = audit.categoryScores;
  const robots = audit.crawlability?.details?.robotsTxt || {};
  const allowedBots: string[] = robots.allowedBots || [];
  const blockedBots: string[] = robots.blockedBots || [];

  // Scores (mapped to 0-20 each, summing to ~100)
  const schema_score = to20(cats.schema);
  const crawler_score = to20(cats.crawlability);
  const entity_score = to20(cats.entity);
  const structure_score = to20(cats.content);
  const nap_score = to20((cats.authority + cats.aiOptimisation) / 2);

  const total = schema_score + crawler_score + entity_score + structure_score + nap_score;

  // Crawler statuses
  const crawler_gptbot = botStatus(allowedBots, blockedBots, "GPTBot");
  const crawler_claudebot = botStatus(allowedBots, blockedBots, "ClaudeBot");
  const crawler_perplexity = botStatus(allowedBots, blockedBots, "PerplexityBot");
  const crawler_google = botStatus(allowedBots, blockedBots, "Googlebot") === "warn"
    ? (allowedBots.some((b) => b.toLowerCase().includes("google")) ? "pass" : "warn")
    : botStatus(allowedBots, blockedBots, "Googlebot");
  const robots_present: Status = robots.found ? "pass" : "fail";

  // Stats
  const schemaTypes: string[] = audit.schema?.details?.jsonLd?.types || [];
  const wordCount: number = audit.content?.details?.contentDepth?.wordCount || 0;
  const stats = [
    { label: "Overall GEO Score", value: `${audit.overallGEOScore}/100` },
    { label: "Schema Blocks", value: String(audit.schema?.details?.jsonLd?.count || 0) },
    { label: "Critical Issues", value: String(audit.issues?.critical?.length || 0) },
    { label: "Word Count", value: String(wordCount) },
  ];

  // Key findings (5) — narrative paragraphs from the actor data
  const orgSchema = audit.entity?.details?.organizationSchema;
  const headings = audit.content?.details?.headings;
  const faq = audit.content?.details?.faq;
  const llmsTxt = audit.crawlability?.details?.llmsTxt;
  const sitemap = audit.crawlability?.details?.sitemap;
  const aiOpt = audit.aiOptimisation?.details;

  const key_findings: string[] = [
    `Schema markup: ${audit.schema?.details?.jsonLd?.count || 0} JSON-LD blocks detected (${schemaTypes.join(", ") || "none"}). ${
      orgSchema?.found
        ? `Organization schema is ${Math.round((orgSchema.completeness || 0) * 100)}% complete${orgSchema.missing?.length ? ` — missing: ${orgSchema.missing.join(", ")}` : ""}.`
        : "No Organization schema found, which is the single most important signal for AI engines to identify and cite your brand."
    } This directly determines whether ChatGPT, Perplexity and Google AI Overview can confidently reference you.`,

    `AI crawler access: robots.txt ${robots.found ? "is present" : "was not found"}${
      allowedBots.length ? ` and explicitly allows ${allowedBots.length} AI bots (${allowedBots.slice(0, 5).join(", ")}${allowedBots.length > 5 ? "…" : ""})` : ""
    }${blockedBots.length ? `, but blocks ${blockedBots.join(", ")}` : ""}. ${
      llmsTxt?.found ? "An llms.txt file is also present — strong signal." : "No llms.txt file at the site root, which is becoming a baseline expectation for AI-friendly sites."
    }`,

    `Content structure: ${headings?.count || 0} headings detected (H1 count: ${headings?.h1Count || 0}). ${
      faq?.hasFAQContent || faq?.hasFAQSchema
        ? `FAQ content is present${faq.hasFAQSchema ? " with proper schema" : " but lacks FAQPage schema"}.`
        : "No FAQ content or FAQPage schema detected — you're missing the most citable content format in AI search."
    } First paragraph word count: ${audit.content?.details?.answerFirst?.wordCount || 0} (${audit.content?.details?.answerFirst?.isAnswerFirst ? "answer-first" : "not answer-first"}).`,

    `Entity signal: ${
      orgSchema?.found
        ? `Organization schema present with ${orgSchema.present?.length || 0} of ${(orgSchema.present?.length || 0) + (orgSchema.missing?.length || 0)} fields filled.`
        : "No Organization schema, so AI engines have no structured way to identify the brand."
    } ${
      audit.entity?.details?.sameAs?.totalCount
        ? `${audit.entity.details.sameAs.totalCount} sameAs references connect the brand to external authority sources (Wikidata, social profiles).`
        : "No sameAs references — the entity isn't linked to external authority sources, weakening its standing."
    } About page: ${audit.entity?.details?.aboutPage?.found ? "found" : "missing"}.`,

    `AI optimisation: question-format headings: ${aiOpt?.qaFormat?.count || 0}, comparison content: ${aiOpt?.comparisonContent?.hasComparisonText ? "yes" : "none"}, listicle content: ${aiOpt?.listicleContent?.found ? "yes" : "none"}, original data signals: ${aiOpt?.uniquenessSignals?.found ? "yes" : "none"}. ${
      sitemap?.found
        ? `Sitemap found with ${sitemap.urlCount} URLs${sitemap.hasLastmod ? " (with lastmod dates)" : " (no lastmod dates)"}.`
        : "No sitemap found, making site discovery harder for AI crawlers."
    }`,
  ];

  // Detailed findings — pull from issues + categories
  const detailed_findings: any[] = [];

  // Top critical issues first
  for (const issue of (audit.issues?.critical || []).slice(0, 2)) {
    detailed_findings.push({
      severity: "Critical" as Severity,
      title: issue.message,
      summary: issue.fixHint || "",
      evidence: [
        `Category: ${issue.category}`,
        `Estimated impact: ${issue.estimatedImpact}`,
        `Pages affected: ${(issue.pagesAffected || []).join(", ") || "site-wide"}`,
      ],
      impact: issue.fixHint || "Resolving this is a prerequisite for being citable by AI engines.",
    });
  }

  // Top warnings
  for (const issue of (audit.issues?.warnings || []).slice(0, 3)) {
    detailed_findings.push({
      severity: "High" as Severity,
      title: issue.message,
      summary: issue.fixHint || "",
      evidence: [
        `Category: ${issue.category}`,
        `Estimated impact: ${issue.estimatedImpact}`,
        `Pages affected: ${(issue.pagesAffected || []).join(", ") || "site-wide"}`,
      ],
      impact: issue.fixHint || "Addressing this will meaningfully improve AI visibility.",
    });
  }

  // Add a synthesized schema finding if not already covered
  if (!orgSchema?.found && !detailed_findings.some((f) => f.title.toLowerCase().includes("schema"))) {
    detailed_findings.push({
      severity: "Critical" as Severity,
      title: "Organization schema missing",
      summary: "The site has no Organization schema, which is the single most important structured-data signal for AI engines. Without it, ChatGPT, Perplexity and Google AI Overview cannot confidently identify your brand.",
      evidence: [
        `JSON-LD blocks found: ${audit.schema?.details?.jsonLd?.count || 0}`,
        `Schema types present: ${schemaTypes.join(", ") || "none"}`,
        "No Organization type detected",
      ],
      impact: "Every day without Organization schema is a day competitors are being cited by AI engines while you are not. Highest-impact, lowest-effort fix.",
    });
  }

  // Pad to at least 4 findings using info issues
  for (const issue of (audit.issues?.info || []).slice(0, 6 - detailed_findings.length)) {
    if (detailed_findings.length >= 6) break;
    detailed_findings.push({
      severity: "Medium" as Severity,
      title: issue.message,
      summary: issue.fixHint || "",
      evidence: [
        `Category: ${issue.category}`,
        `Estimated impact: ${issue.estimatedImpact}`,
      ],
      impact: issue.fixHint || "Worth addressing as part of broader AEO hygiene.",
    });
  }

  // Tech stack
  const jsRendering = audit.crawlability?.details?.jsRendering || {};
  const tech_stack = [
    {
      layer: "Schema Markup",
      technology: schemaTypes.length ? `JSON-LD (${schemaTypes.join(", ")})` : "None",
      assessment: schemaTypes.length >= 2 ? "Good" : schemaTypes.length === 1 ? "Warning" : "Risk",
      notes: `${audit.schema?.details?.jsonLd?.count || 0} blocks detected, average completeness ${Math.round((audit.schema?.details?.completeness?.average || 0) * 100)}%`,
    },
    {
      layer: "AI Crawler Access",
      technology: robots.found ? "robots.txt configured" : "No robots.txt",
      assessment: allowedBots.length >= 3 ? "Good" : robots.found ? "Warning" : "Risk",
      notes: `${allowedBots.length} bots allowed, ${blockedBots.length} blocked`,
    },
    {
      layer: "JS Rendering",
      technology: jsRendering.likelyJSDependent ? "JS-dependent SPA" : "Server-rendered",
      assessment: jsRendering.likelyJSDependent ? "Risk" : "Good",
      notes: `Body text: ${jsRendering.bodyTextLength || 0} chars, ${jsRendering.scriptTagCount || 0} scripts`,
    },
    {
      layer: "Sitemap",
      technology: sitemap?.found ? `XML sitemap (${sitemap.urlCount} URLs)` : "Not found",
      assessment: sitemap?.found ? (sitemap.hasLastmod ? "Good" : "Warning") : "Risk",
      notes: sitemap?.found ? (sitemap.hasLastmod ? "Includes lastmod dates" : "Missing lastmod dates") : "Add sitemap.xml",
    },
    {
      layer: "Security",
      technology: audit.authority?.details?.https?.isHttps ? "HTTPS" : "HTTP",
      assessment: audit.authority?.details?.https?.isHttps ? "Good" : "Risk",
      notes: audit.authority?.details?.https?.isHttps ? "Valid HTTPS in place" : "Site not served over HTTPS",
    },
    {
      layer: "llms.txt",
      technology: llmsTxt?.found ? "Present" : "Missing",
      assessment: llmsTxt?.found ? "Good" : "Warning",
      notes: llmsTxt?.found ? "AI guidance file detected" : "Add llms.txt to guide AI crawlers",
    },
  ];

  // Competitive positioning
  const competitive = [
    {
      capability: "Schema Markup",
      client_status: schemaTypes.length ? `${schemaTypes.length} types (${schemaTypes.join(", ")})` : "None",
      best_in_class: "Organization + WebSite + FAQPage + Product",
      gap: !schemaTypes.length ? "Critical" : schemaTypes.length < 3 ? "High" : "Quick Win",
    },
    {
      capability: "AI Crawler Access",
      client_status: `${allowedBots.length} bots allowed`,
      best_in_class: "All major AI bots explicitly allowed",
      gap: allowedBots.length >= 5 ? "Quick Win" : allowedBots.length >= 2 ? "Medium" : "High",
    },
    {
      capability: "FAQ Content",
      client_status: faq?.hasFAQSchema ? "FAQ + schema" : faq?.hasFAQContent ? "FAQ (no schema)" : "None",
      best_in_class: "Structured FAQ with FAQPage schema",
      gap: faq?.hasFAQSchema ? "Quick Win" : faq?.hasFAQContent ? "High" : "Critical",
    },
    {
      capability: "Entity Authority (sameAs)",
      client_status: `${audit.entity?.details?.sameAs?.totalCount || 0} references`,
      best_in_class: "5+ sameAs to Wikidata, social, industry sources",
      gap: (audit.entity?.details?.sameAs?.totalCount || 0) >= 5 ? "Quick Win" : (audit.entity?.details?.sameAs?.totalCount || 0) >= 2 ? "Medium" : "High",
    },
    {
      capability: "Answer-First Content",
      client_status: audit.content?.details?.answerFirst?.isAnswerFirst ? "Answer-first" : "Lead with marketing copy",
      best_in_class: "Direct answer in first 50 words",
      gap: audit.content?.details?.answerFirst?.isAnswerFirst ? "Quick Win" : "High",
    },
    {
      capability: "llms.txt",
      client_status: llmsTxt?.found ? "Present" : "Missing",
      best_in_class: "llms.txt at site root",
      gap: llmsTxt?.found ? "Quick Win" : "Medium",
    },
    {
      capability: "Sitemap Quality",
      client_status: sitemap?.found ? `${sitemap.urlCount} URLs${sitemap.hasLastmod ? " + lastmod" : ""}` : "Missing",
      best_in_class: "XML sitemap with lastmod + index",
      gap: sitemap?.found && sitemap.hasLastmod ? "Quick Win" : sitemap?.found ? "Medium" : "High",
    },
    {
      capability: "Comparison Content",
      client_status: aiOpt?.comparisonContent?.hasComparisonText ? "Present" : "None",
      best_in_class: "vs / comparison pages with tables",
      gap: aiOpt?.comparisonContent?.hasComparisonText ? "Quick Win" : "Opportunity",
    },
  ];

  // Recommendations — derive from issues
  const allIssues = [...(audit.issues?.critical || []), ...(audit.issues?.warnings || []), ...(audit.issues?.info || [])]
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, 10);

  const recommendations = allIssues.map((issue) => ({
    title: issue.message,
    severity: severityFromIssue(issue.severity),
    timeframe: timeframeFromPriority(issue.priority),
    description: issue.fixHint || `Address this ${issue.category} issue to improve your AEO score.`,
  }));

  // Niche guess from page type / title
  const niche = actorOutput.title ? `${actorOutput.title.split(/[—|·-]/)[0].trim()} site` : "Website";

  return {
    domain,
    headline: buildHeadline(audit.overallGEOScore, audit.gradeLabel, domain),
    key_findings,
    stats,
    schema_score,
    crawler_score,
    entity_score,
    structure_score,
    nap_score,
    niche: niche.slice(0, 40),
    crawler_gptbot,
    crawler_claudebot,
    crawler_perplexity,
    crawler_google,
    robots_present,
    detailed_findings,
    tech_stack,
    competitive,
    recommendations,
  };
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

    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) throw new Error("APIFY_API_TOKEN is not configured");

    const url = domain.startsWith("http") ? domain : `https://${domain}`;
    console.log(`Running AEO audit actor for ${url}...`);

    const res = await fetch(`${ACTOR_URL}?token=${APIFY_API_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startUrls: [{ url }] }),
      signal: AbortSignal.timeout(280000),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Apify actor error:", res.status, t);
      return new Response(JSON.stringify({ error: `Audit actor failed: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = await res.json();
    const actorOutput = Array.isArray(items) && items.length > 0 ? items[0] : null;
    if (!actorOutput || !actorOutput.audit) {
      console.error("Actor returned no usable output:", JSON.stringify(items).slice(0, 500));
      return new Response(JSON.stringify({ error: "Actor returned no audit data" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Audit complete. Overall score: ${actorOutput.audit.overallGEOScore}, grade: ${actorOutput.audit.grade}`);

    const result = mapToAuditResult(domain, actorOutput);
    return new Response(JSON.stringify(result), {
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
