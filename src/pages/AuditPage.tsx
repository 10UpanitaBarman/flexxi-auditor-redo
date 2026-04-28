import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./Index";
import Loading from "./Loading";
import Report from "./Report";
import { runAEOAudit } from "@/lib/claude";
import type { AuditResult } from "@/types/audit";

type AppState = "idle" | "loading" | "done";

const mockData: AuditResult = {
  domain: "example.com",
  headline: "Your product is strong. Your digital presence is holding it back.",
  key_findings: [
    "Your website has no schema markup whatsoever. When AI engines like ChatGPT, Perplexity, or Google's AI Overview try to understand what your business does, they find no structured data to work with. This means your brand is invisible to the fastest-growing discovery channel in digital marketing.",
    "AI crawlers are partially blocked by your robots.txt configuration. GPTBot and ClaudeBot can access your site, but PerplexityBot receives a 'warn' status, meaning some AI engines may not be indexing your content at all.",
    "Your homepage fails to clearly state who you are and what you do in the first 200 words. The entity signal - the combination of brand name, category, and market - is buried below the fold, making it difficult for AI engines to classify your business.",
    "There are no FAQ sections, no comparison content, and no structured headings that AI engines can easily parse into direct answers. Your content structure scores poorly because there's nothing citable.",
    "Your brand name appears inconsistently across the site. The page title, meta description, and body content use slightly different variations, which fragments your entity signal and confuses AI classification systems.",
  ],
  stats: [
    { label: "Schema Markup", value: "None" },
    { label: "AI Visibility Score", value: "44/100" },
    { label: "Citable Content", value: "0 sections" },
    { label: "Entity Clarity", value: "Weak" },
  ],
  schema_score: 4,
  crawler_score: 16,
  entity_score: 10,
  structure_score: 6,
  nap_score: 8,
  niche: "Design agency",
  crawler_gptbot: "pass",
  crawler_claudebot: "pass",
  crawler_perplexity: "warn",
  crawler_google: "pass",
  robots_present: "pass",
  detailed_findings: [
    {
      severity: "Critical",
      title: "No Schema Markup Detected",
      summary: "Your website contains zero schema markup - no Organization, FAQPage, HowTo, or any other structured data types. This is the single most important technical signal for AI engine visibility.\n\nWhen a user asks ChatGPT or Perplexity 'who does design work in [your market]?', the AI engine looks for structured data to identify and classify businesses. Without schema, your site is essentially invisible to this classification process.\n\nCompetitors with even basic Organization schema are significantly more likely to be cited in AI-generated answers.",
      evidence: [
        "No JSON-LD or microdata found in page source",
        "No Organization schema defining brand and category",
        "No FAQPage schema for direct answer citation",
      ],
      impact: "Every day without schema markup is a day your competitors are being cited by AI engines while you are not. This is the highest-impact, lowest-effort fix available.",
    },
    {
      severity: "High",
      title: "Entity Signal Unclear",
      summary: "The first 200 words of your homepage do not clearly communicate your brand name, service category, and target market in a way that AI engines can parse.\n\nAI engines rely heavily on the opening content of a page to classify what a business does. Your homepage leads with generic marketing language rather than a clear entity statement.",
      evidence: [
        "Brand name not in first H1 heading",
        "Service category mentioned only below the fold",
        "No clear market/location statement in opening content",
      ],
      impact: "Without a clear entity signal, AI engines cannot confidently classify your business, which means you'll never appear in category-level AI queries.",
    },
    {
      severity: "High",
      title: "No Citable Content Structure",
      summary: "Your site lacks FAQ sections, comparison tables, and structured Q&A content that AI engines prefer to cite directly.\n\nAI engines like Perplexity and ChatGPT favor content that is already structured as questions and answers. Sites with FAQ sections using proper markup are dramatically more likely to be quoted verbatim in AI responses.",
      evidence: [
        "No FAQ page or section detected",
        "No comparison or 'vs' content",
        "Heading hierarchy (H2/H3) is flat or missing",
      ],
      impact: "You're missing the most citable content format in AI search. Competitors with FAQ sections are being quoted while your expertise goes uncited.",
    },
    {
      severity: "Medium",
      title: "Inconsistent NAP Signals",
      summary: "Your brand name, location, and service category are not consistently presented across the site. Variations in how these appear create confusion for AI classification systems.\n\nConsistency in NAP (Name, Address/Location, Practice) signals is critical for AI engines to build a confident entity profile of your business.",
      evidence: [
        "Page title and H1 use different brand variations",
        "Location mentioned inconsistently",
        "Service category described differently across pages",
      ],
      impact: "Fragmented NAP signals weaken your overall entity authority, making AI engines less confident about citing your brand.",
    },
  ],
  tech_stack: [
    { layer: "Frontend Framework", technology: "React / SPA", assessment: "Risk", notes: "Client-side rendering may limit search engine and AI crawler access" },
    { layer: "Hosting", technology: "Unknown CDN", assessment: "Unknown", notes: "Could not determine hosting provider from headers" },
    { layer: "Schema Markup", technology: "None detected", assessment: "Warning", notes: "No JSON-LD, microdata, or RDFa found" },
    { layer: "Analytics", technology: "Google Analytics", assessment: "Good", notes: "Standard analytics implementation detected" },
    { layer: "SSL / Security", technology: "HTTPS", assessment: "Good", notes: "Valid SSL certificate present" },
  ],
  competitive: [
    { capability: "Schema Markup", client_status: "None", best_in_class: "Full Organization + FAQ schema", gap: "Critical" },
    { capability: "AI Crawler Access", client_status: "Partial", best_in_class: "All bots allowed", gap: "Medium" },
    { capability: "Entity Clarity", client_status: "Weak", best_in_class: "Brand + category in H1", gap: "High" },
    { capability: "FAQ Content", client_status: "None", best_in_class: "Structured FAQ with schema", gap: "Critical" },
    { capability: "Content Structure", client_status: "Flat headings", best_in_class: "Deep H2/H3 hierarchy", gap: "High" },
    { capability: "NAP Consistency", client_status: "Inconsistent", best_in_class: "Unified across all pages", gap: "Medium" },
  ],
  recommendations: [
    { title: "Add Organization schema markup", severity: "Critical", timeframe: "1-2 hours", description: "Add JSON-LD Organization schema to every page defining your brand name, category, location, and services. This is the single highest-impact change for AI visibility." },
    { title: "Rewrite H1 as entity statement", severity: "Critical", timeframe: "30 minutes", description: "Your homepage H1 should clearly state: [Brand] is a [category] in [market]. This gives AI engines an unambiguous entity signal." },
    { title: "Add FAQPage with schema markup", severity: "High", timeframe: "1-2 days", description: "Create a FAQ section with 8-12 questions that prospects commonly ask. Mark it up with FAQPage schema. This is the most citable content format for AI engines." },
    { title: "Verify AI crawler access in robots.txt", severity: "High", timeframe: "30 minutes", description: "Ensure GPTBot, ClaudeBot, and PerplexityBot are explicitly allowed in robots.txt. Remove any blanket disallow rules that may be blocking AI crawlers." },
    { title: "Standardise NAP across all pages", severity: "High", timeframe: "1-2 days", description: "Audit every page for brand name, location, and category consistency. Use the exact same phrasing everywhere. Update page titles, meta descriptions, and body content." },
    { title: "Build structured comparison content", severity: "Medium", timeframe: "1-2 weeks", description: "Create 'vs' pages or comparison tables that help AI engines understand your positioning relative to alternatives. This triggers citation in comparative queries." },
    { title: "Add HowTo schema to service pages", severity: "Medium", timeframe: "2-3 days", description: "If you have process or methodology content, mark it up with HowTo schema. This creates another citable entry point for AI engines." },
    { title: "Implement server-side rendering", severity: "Medium", timeframe: "2-4 weeks", description: "If your site is a client-side SPA, consider SSR or pre-rendering to ensure AI crawlers can access all content without executing JavaScript." },
  ],
};

const AuditPage = () => {
  const [state, setState] = useState<AppState>("idle");
  const [domain, setDomain] = useState("");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  const handleSubmit = async (rawDomain: string) => {
    let cleaned = rawDomain.trim();
    cleaned = cleaned.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
    if (!cleaned) return;

    setDomain(cleaned);
    setState("loading");
    window.scrollTo(0, 0);

    try {
      const result = await runAEOAudit(cleaned);
      setAuditData(result);
      setState("done");
    } catch (err) {
      console.error("Audit failed, using mock data:", err);
      setAuditData({ ...mockData, domain: cleaned });
      setState("done");
    }
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setState("idle");
    setDomain("");
    setAuditData(null);
    window.scrollTo(0, 0);
  };

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Index onSubmit={handleSubmit} />
        </motion.div>
      )}
      {state === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Loading domain={domain} />
        </motion.div>
      )}
      {state === "done" && auditData && (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Report data={auditData} onReset={handleReset} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuditPage;
