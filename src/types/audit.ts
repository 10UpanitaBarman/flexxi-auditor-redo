export type CrawlerStatus = "pass" | "fail" | "warn";
export type EffortTag = "quick" | "med" | "long";

export interface Recommendation {
  h: string;
  p: string;
  tag: EffortTag;
}

export interface AuditResult {
  domain: string;
  schema_score: number;
  crawler_score: number;
  entity_score: number;
  structure_score: number;
  nap_score: number;
  niche: string;
  competitor: string;
  competitor_reason: string;
  crawler_gptbot: CrawlerStatus;
  crawler_claudebot: CrawlerStatus;
  crawler_perplexity: CrawlerStatus;
  crawler_google: CrawlerStatus;
  robots_present: CrawlerStatus;
  flags: [string, string, string];
  recommendations: Recommendation[];
}
