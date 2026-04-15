export type CrawlerStatus = "pass" | "fail" | "warn";
export type EffortTag = "quick" | "med" | "long";
export type Severity = "Critical" | "High" | "Medium";

export interface DetailedFinding {
  severity: Severity;
  title: string;
  summary: string;
  evidence: string[];
  impact: string;
}

export interface TechStackRow {
  layer: string;
  technology: string;
  assessment: string;
  notes: string;
}

export interface CompetitorRow {
  capability: string;
  client_status: string;
  best_in_class: string;
  gap: "Critical" | "High" | "Medium" | "Opportunity" | "Quick Win";
}

export interface Recommendation {
  title: string;
  severity: Severity;
  timeframe: string;
  description: string;
}

export interface KeyStat {
  label: string;
  value: string;
}

export interface AuditResult {
  domain: string;

  // Executive summary
  headline: string;
  key_findings: string[];
  stats: KeyStat[];

  // Scores (0-20 each)
  schema_score: number;
  crawler_score: number;
  entity_score: number;
  structure_score: number;
  nap_score: number;
  niche: string;

  // Crawler statuses
  crawler_gptbot: CrawlerStatus;
  crawler_claudebot: CrawlerStatus;
  crawler_perplexity: CrawlerStatus;
  crawler_google: CrawlerStatus;
  robots_present: CrawlerStatus;

  // Detailed findings
  detailed_findings: DetailedFinding[];

  // Tech stack
  tech_stack: TechStackRow[];

  // Competitive positioning
  competitive: CompetitorRow[];

  // Recommendations
  recommendations: Recommendation[];
}
