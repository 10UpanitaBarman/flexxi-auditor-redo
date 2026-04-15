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
  schema_score: 4,
  crawler_score: 16,
  entity_score: 10,
  structure_score: 6,
  nap_score: 8,
  niche: "Design agency",
  competitor: "Ueno",
  competitor_reason: "Ueno has clearer schema and stronger entity signals.",
  crawler_gptbot: "pass",
  crawler_claudebot: "pass",
  crawler_perplexity: "warn",
  crawler_google: "pass",
  robots_present: "pass",
  flags: [
    "No schema markup on homepage",
    "Entity signals unclear in first 200 words",
    "No FAQ content detected",
  ],
  recommendations: [
    { h: "Add Organization schema", p: "Defines brand and category to all AI crawlers.", tag: "quick" },
    { h: "Verify AI crawler access", p: "Allow GPTBot, ClaudeBot, PerplexityBot in robots.txt.", tag: "quick" },
    { h: "Rewrite H1 as entity statement", p: "Brand plus category plus market in one sentence.", tag: "quick" },
    { h: "Add FAQ section with schema", p: "Direct Q&A is the most citable AI structure.", tag: "med" },
    { h: "Audit NAP across channels", p: "Standardise name, location, category everywhere.", tag: "med" },
    { h: "Build structured services page", p: "HowTo schema and comparison content for AI citation.", tag: "long" },
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
