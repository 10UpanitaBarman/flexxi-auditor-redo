import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { AuditResult, CrawlerStatus, EffortTag } from "@/types/audit";
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

function severityFromScore(score: number): { label: string; color: string } {
  if (score <= 4) return { label: "Critical", color: "bg-red-500/20 text-red-400" };
  if (score <= 10) return { label: "High", color: "bg-amber-500/20 text-amber-400" };
  if (score <= 15) return { label: "Medium", color: "bg-muted text-muted-foreground" };
  return { label: "Pass", color: "bg-foreground/10 text-foreground" };
}

function crawlerPill(status: CrawlerStatus) {
  if (status === "pass") return { label: "Allowed", cls: "bg-foreground/10 text-foreground" };
  if (status === "fail") return { label: "Blocked", cls: "bg-red-500/20 text-red-400" };
  return { label: "Partial", cls: "bg-amber-500/20 text-amber-400" };
}

function effortPill(tag: EffortTag) {
  const map: Record<EffortTag, string> = {
    quick: "Quick win",
    med: "Medium effort",
    long: "Long-term",
  };
  return map[tag];
}

const signalMeta: { key: keyof Pick<AuditResult, "schema_score" | "crawler_score" | "entity_score" | "structure_score" | "nap_score">; label: string; desc: string }[] = [
  { key: "schema_score", label: "Schema", desc: "FAQPage, Organization, or HowTo schema markup present" },
  { key: "crawler_score", label: "AI Crawlers", desc: "GPTBot, ClaudeBot, PerplexityBot access allowed" },
  { key: "entity_score", label: "Entity", desc: "Brand + category clarity in first 200 words" },
  { key: "structure_score", label: "Structure", desc: "FAQ sections, clear headings, comparison content" },
  { key: "nap_score", label: "NAP", desc: "Name, location, category consistency" },
];

const scoreRanges = [
  { num: "01", label: "Invisible", range: "0–40", desc: "AI engines can't find or classify this site" },
  { num: "02", label: "Partial", range: "41–60", desc: "Crawlers allowed but no schema, weak structure" },
  { num: "03", label: "Competitive", range: "61–80", desc: "Schema present, citable but not cited first" },
  { num: "04", label: "Citation-ready", range: "81–100", desc: "Brand appears when AI is asked \"who does X?\"" },
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

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPercent(Math.min(pct, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const issues = (() => {
    const list: { severity: string; color: string; title: string; why: string; effort: EffortTag }[] = [];
    signalMeta.forEach((s) => {
      const score = data[s.key];
      if (score <= 4) list.push({ severity: "Critical", color: "text-red-400", title: `${s.label} score critically low`, why: `Scored ${score}/20 — immediate action needed`, effort: "quick" });
      else if (score <= 10) list.push({ severity: "High", color: "text-amber-400", title: `${s.label} underperforming`, why: `Scored ${score}/20 — significant improvement possible`, effort: "med" });
    });
    data.flags.forEach((f) => list.push({ severity: "Medium", color: "text-muted-foreground", title: f, why: "Detected during AEO analysis", effort: "med" }));
    return list;
  })();

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky scroll progress */}
      <div className="fixed top-0 left-0 z-50 h-[2px] w-full bg-transparent">
        <div className="h-full bg-foreground transition-[width] duration-100" style={{ width: `${scrollPercent}%` }} />
      </div>

      {/* COVER */}
      <section className="relative grid-bg overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,hsl(0_0%_20%/0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
          >
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
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border md:grid-cols-5"
          >
            {[
              { label: "Domain", value: data.domain },
              { label: "Industry", value: data.niche },
              { label: "Top competitor", value: data.competitor },
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

      {/* SCORE OVERVIEW */}
      <section className="border-t border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Score range legend */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="mb-8 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Score Ranges
            </motion.p>
            <div className="divide-y divide-border">
              {scoreRanges.map((r, i) => (
                <motion.div
                  key={r.num}
                  variants={fadeUp}
                  custom={i}
                  className="grid grid-cols-[auto_1fr_auto_1fr] items-start gap-6 py-6 md:gap-8"
                >
                  <span className="text-xs text-muted-foreground font-medium">{r.num}</span>
                  <span className="font-heading text-xl text-foreground">{r.label}</span>
                  <span className="tag">{r.range}</span>
                  <span className="text-sm text-muted-foreground">{r.desc}</span>
                </motion.div>
              ))}
            </div>
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
                <motion.div
                  key={s.key}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
                  <p className="mt-3 font-heading text-4xl text-foreground">
                    {score}<span className="text-lg text-muted-foreground">/20</span>
                  </p>
                  <div className="mt-3">
                    <AnimatedBar value={score} max={20} />
                  </div>
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
        </div>
      </section>

      {/* SIGNAL FINDINGS */}
      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-sm uppercase tracking-[0.15em] text-muted-foreground"
          >
            Signal Findings
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="divide-y divide-border"
          >
            {signalMeta.map((s, i) => {
              const score = data[s.key];
              const sev = severityFromScore(score);
              return (
                <motion.div
                  key={s.key}
                  variants={fadeUp}
                  custom={i}
                  className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[auto_1fr_1fr] md:items-start md:gap-8"
                >
                  <span className="text-xs text-muted-foreground font-medium">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-2xl text-foreground">{score}/20</span>
                    <span className="font-heading text-lg text-foreground">{s.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${sev.color}`}>{sev.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Flags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 overflow-hidden rounded-2xl border border-red-500/20"
          >
            <div className="bg-red-500/10 px-6 py-4">
              <p className="text-sm font-semibold text-red-400">Top 3 AEO failures detected</p>
            </div>
            <div className="divide-y divide-border bg-background">
              {data.flags.map((f, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4">
                  <span className="text-xs text-muted-foreground font-medium">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-foreground">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Crawler access */}
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

          {/* Competitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Top competitor</p>
              <p className="mt-2 font-heading text-5xl tracking-tight text-foreground">{data.competitor}</p>
            </div>
            <div className="flex items-end">
              <p className="text-sm leading-relaxed text-muted-foreground">{data.competitor_reason}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="border-t border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Priority panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 overflow-hidden rounded-2xl border border-border bg-background"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-sm font-semibold text-foreground">What needs fixing</p>
              <span className="tag">{issues.length} issues</span>
            </div>
            <div className="divide-y divide-border">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4">
                  <span className={`mt-0.5 text-xs ${issue.color}`}>
                    {issue.severity === "Critical" ? "!!" : issue.severity === "High" ? "!" : "·"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{issue.title}</p>
                    <p className="text-[11px] text-muted-foreground">{issue.why}</p>
                  </div>
                  <span className="tag">{effortPill(issue.effort)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Numbered recommendations */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-sm uppercase tracking-[0.15em] text-muted-foreground"
          >
            Recommendations
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="divide-y divide-border"
          >
            {data.recommendations.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-8"
              >
                <span className="text-xs text-muted-foreground font-medium">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-heading text-xl text-foreground">{r.h}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.p}</p>
                </div>
                <span className="tag">{effortPill(r.tag)}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative grid-bg border-t border-border py-20 md:py-28">
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
              href="https://meetings.hubspot.com/allie-vogel"
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
          <img src={flexxiLogo} alt="Flexxi" className="h-6 w-auto opacity-60" />
          <button
            onClick={onReset}
            className="group text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Run another audit
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Report;
