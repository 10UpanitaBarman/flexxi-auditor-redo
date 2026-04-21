import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { AuditResult, CrawlerStatus, Severity } from "@/types/audit";
import flexxiLogo from "@/assets/flexxi-logo.png";

interface ReportProps {
  data: AuditResult;
  onReset: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function totalScore(d: AuditResult) {
  return d.schema_score + d.crawler_score + d.entity_score + d.structure_score + d.nap_score;
}

function verdictLabel(score: number) {
  if (score <= 40) return { label: "Invisible", desc: "AI engines can't find or classify this site. No schema, likely blocking crawlers." };
  if (score <= 60) return { label: "Partial", desc: "Crawlers allowed and brand visible — but no schema and weak structure." };
  if (score <= 80) return { label: "Competitive", desc: "Schema present, entity clear, some structured content. Citable but not dominant." };
  return { label: "Citation-ready", desc: "Everything in place. Brand shows up when someone asks AI \"who does X?\"" };
}

function severityColor(severity: Severity | string): string {
  if (severity === "Critical") return "bg-red-500/20 text-red-400";
  if (severity === "High") return "bg-amber-500/20 text-amber-400";
  return "bg-muted text-muted-foreground";
}

function gapColor(gap: string): string {
  if (gap === "Critical") return "text-red-400";
  if (gap === "High") return "text-amber-400";
  if (gap === "Quick Win") return "text-foreground";
  if (gap === "Opportunity") return "text-foreground/70";
  return "text-muted-foreground";
}

function crawlerPill(status: CrawlerStatus) {
  if (status === "pass") return { label: "Allowed", cls: "bg-foreground/10 text-foreground" };
  if (status === "fail") return { label: "Blocked", cls: "bg-red-500/20 text-red-400" };
  return { label: "Partial", cls: "bg-amber-500/20 text-amber-400" };
}

function assessmentColor(assessment: string): string {
  if (assessment === "Good") return "text-foreground";
  if (assessment === "Risk") return "text-red-400";
  if (assessment === "Warning") return "text-amber-400";
  return "text-muted-foreground";
}

const signalMeta = [
  { key: "schema_score" as const, label: "Schema", desc: "FAQPage, Organization, or HowTo schema markup present" },
  { key: "crawler_score" as const, label: "AI Crawlers", desc: "GPTBot, ClaudeBot, PerplexityBot access allowed" },
  { key: "entity_score" as const, label: "Entity", desc: "Brand + category clarity in first 200 words" },
  { key: "structure_score" as const, label: "Structure", desc: "FAQ sections, clear headings, comparison content" },
  { key: "nap_score" as const, label: "NAP", desc: "Name, location, category consistency" },
];

function AnimatedBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-[1px] w-full bg-border">
      <motion.div
        className="h-full bg-foreground"
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </div>
  );
}

const Report = ({ data, onReset }: ReportProps) => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const total = totalScore(data);
  const verdict = verdictLabel(total);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPercent(Math.min(pct, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll progress */}
      <div className="fixed top-0 left-0 z-50 h-[2px] w-full bg-transparent">
        <div className="h-full bg-foreground transition-[width] duration-100" style={{ width: `${scrollPercent}%` }} />
      </div>

      {/* Back button */}
      <button
        onClick={onReset}
        className="fixed top-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.15em] text-foreground backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
        aria-label="Back to home"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* ══════════════ COVER ══════════════ */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="relative mx-auto max-w-5xl px-6">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            AEO Audit Report — Prepared by Flexxi
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            AEO Audit
            <br />& Assessment
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border md:grid-cols-4"
          >
            {[
              { label: "Domain", value: data.domain },
              { label: "Industry", value: data.niche },
              { label: "Date", value: today },
              { label: "Total score", value: `${total}/100` },
            ].map((m) => (
              <div key={m.label} className="bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{m.label}</p>
                <p className="mt-1 font-heading text-lg text-foreground">{m.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ EXECUTIVE SUMMARY ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Executive Summary
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              The Bottom Line
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg leading-relaxed text-foreground/80 md:text-xl">
              {data.headline}
            </motion.p>
          </motion.div>

          {/* Key findings */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mt-16 divide-y divide-border">
            {data.key_findings.map((finding, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex gap-6 py-8">
                <span className="flex-shrink-0 font-heading text-lg text-muted-foreground">{i + 1}.</span>
                <p className="text-sm leading-relaxed text-muted-foreground">{finding}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {data.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-background p-5 text-center">
                <p className="font-heading text-3xl text-foreground">{s.value}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ DETAILED FINDINGS ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-16">
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Technical Deep Dive
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              Detailed Findings
            </motion.h2>
          </motion.div>

          <div className="space-y-8">
            {data.detailed_findings.map((finding, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* Finding header */}
                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <span className="text-xs font-medium text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${severityColor(finding.severity)}`}>
                    {finding.severity}
                  </span>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="font-heading text-2xl tracking-tight text-foreground">{finding.title}</h3>

                  {/* Summary paragraphs */}
                  <div className="mt-4 space-y-4">
                    {finding.summary.split("\n\n").map((p, pi) => (
                      <p key={pi} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                  </div>

                  {/* Evidence */}
                  {finding.evidence.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {finding.evidence.map((e, ei) => (
                        <div key={ei} className="flex items-start gap-3 rounded-xl bg-background px-4 py-3">
                          <span className="mt-0.5 text-xs text-muted-foreground">•</span>
                          <p className="text-sm text-foreground/80">{e}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Impact */}
                  <div className="mt-6 rounded-xl bg-secondary p-4">
                    <p className="text-sm leading-relaxed text-foreground/70">{finding.impact}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SCORE OVERVIEW ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-12">
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Signal Scores
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              AEO Score Breakdown
            </motion.h2>
          </motion.div>

          {/* 5 score cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {signalMeta.map((s, i) => {
              const score = data[s.key];
              return (
                <motion.div key={s.key} variants={fadeUp} custom={i} className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
                  <p className="mt-3 font-heading text-4xl text-foreground">
                    {score}<span className="text-lg text-muted-foreground">/20</span>
                  </p>
                  <div className="mt-3"><AnimatedBar value={score} max={20} /></div>
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Total band */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6 flex flex-col items-start gap-6 rounded-2xl bg-secondary p-8 md:flex-row md:items-center"
          >
            <p className="font-heading text-7xl tracking-tight text-foreground md:text-8xl">
              {total}<span className="text-3xl text-muted-foreground">/100</span>
            </p>
            <div className="flex-1">
              <p className="font-heading text-2xl italic text-foreground">{verdict.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{verdict.desc}</p>
            </div>
          </motion.div>

          {/* AI Crawler access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <p className="mb-6 text-sm uppercase tracking-[0.15em] text-muted-foreground">AI Crawler Access</p>
            <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
              {([
                { name: "GPTBot", status: data.crawler_gptbot },
                { name: "ClaudeBot", status: data.crawler_claudebot },
                { name: "PerplexityBot", status: data.crawler_perplexity },
                { name: "Googlebot", status: data.crawler_google },
                { name: "robots.txt", status: data.robots_present },
              ] as { name: string; status: CrawlerStatus }[]).map((c) => {
                const pill = crawlerPill(c.status);
                return (
                  <div key={c.name} className="flex items-center justify-between bg-card px-6 py-4">
                    <span className="text-sm text-foreground">{c.name}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${pill.cls}`}>{pill.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ TECHNOLOGY STACK ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-12">
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Under the Hood
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              Technology Stack
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-border"
          >
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1fr_1fr_auto_2fr] gap-4 bg-secondary px-6 py-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Layer</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Technology</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Status</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Notes</p>
            </div>
            <div className="divide-y divide-border">
              {data.tech_stack.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 bg-card px-6 py-4 md:grid-cols-[1fr_1fr_auto_2fr] md:gap-4 md:items-center">
                  <p className="text-sm font-medium text-foreground">{row.layer}</p>
                  <p className="text-sm text-foreground/80">{row.technology}</p>
                  <span className={`text-xs font-semibold uppercase ${assessmentColor(row.assessment)}`}>{row.assessment}</span>
                  <p className="text-sm text-muted-foreground">{row.notes}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ COMPETITIVE POSITIONING ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-12">
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Market Context
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              Competitive Positioning
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-border"
          >
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 bg-secondary px-6 py-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Capability</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{data.domain}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Best-in-Class</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Gap</p>
            </div>
            <div className="divide-y divide-border">
              {data.competitive.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 bg-card px-6 py-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:gap-4 md:items-center">
                  <p className="text-sm font-medium text-foreground">{row.capability}</p>
                  <p className="text-sm text-muted-foreground">{row.client_status}</p>
                  <p className="text-sm text-foreground/70">{row.best_in_class}</p>
                  <span className={`text-xs font-semibold uppercase ${gapColor(row.gap)}`}>{row.gap}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ RECOMMENDATIONS ══════════════ */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="mb-12">
            <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Action Plan
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl tracking-tight text-foreground md:text-5xl">
              Top Recommendations
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-6"
          >
            {data.recommendations.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center gap-4 px-6 py-5 md:px-8">
                  <span className="flex-shrink-0 font-heading text-2xl text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading text-xl text-foreground">{r.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${severityColor(r.severity)}`}>
                        {r.severity}
                      </span>
                      <span className="tag">{r.timeframe}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative border-t border-border py-20 md:py-28">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl tracking-tight text-foreground md:text-6xl"
          >
            Want Flexxi to fix
            <br />this for you?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-muted-foreground"
          >
            We build AEO infrastructure for design studios — schema, crawler access, entity clarity, and structured content.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8"
          >
            <a
              href="https://meetings.hubspot.com/allie-vogel?uuid=8b27d2ba-0aac-4ab5-a591-203dd924bf87"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-holo inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-foreground"
            >
              Book a call with Allie →
            </a>
            <p className="mt-4 text-xs text-muted-foreground">No commitment. We'll audit your site live on the call.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="https://www.flexxi.studio/who-we-are" target="_blank" rel="noopener noreferrer" aria-label="Flexxi">
            <img src={flexxiLogo} alt="Flexxi" className="h-6 w-auto opacity-60 transition-opacity hover:opacity-100" />
          </a>
          <button onClick={onReset} className="group text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← Run another audit
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Report;
