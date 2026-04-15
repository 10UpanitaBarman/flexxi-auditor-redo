import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "@/types/audit";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function runAEOAudit(domain: string): Promise<AuditResult> {
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

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { type: string; text?: string }) => (b as { type: "text"; text: string }).text)
    .join("");

  const match = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(match ? match[0] : text);
  return { ...parsed, domain };
}
