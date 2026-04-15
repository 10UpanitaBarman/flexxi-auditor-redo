import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, BarChart3, FileText, Zap } from "lucide-react";

const sampleDomains = ["flexxi.design", "ueno.co", "work.co", "instrument.com", "raresupremacy.com"];

const scoreRanges = [
  { range: "0–40", label: "Invisible", color: "destructive", desc: "AI engines can't find or classify this site." },
  { range: "41–60", label: "Partial", color: "muted-foreground", desc: "Crawlers allowed, brand visible — but weak structure." },
  { range: "61–80", label: "Competitive", color: "foreground", desc: "Schema present, entity clear. Citable but not dominant." },
  { range: "81–100", label: "Citation-ready", color: "primary", desc: "Brand shows up when someone asks AI \"who does X?\"" },
];

const signals = [
  { icon: Shield, title: "AI Crawlers", desc: "GPTBot · ClaudeBot · Perplexity — are they allowed in?" },
  { icon: FileText, title: "Schema Markup", desc: "FAQPage · Organization · HowTo — structured data presence." },
  { icon: Search, title: "Entity Clarity", desc: "Brand + category clarity for AI understanding." },
  { icon: BarChart3, title: "Content Structure", desc: "FAQ · H2/H3 · comparison — semantic HTML signals." },
  { icon: Zap, title: "Citability Score", desc: "Overall likelihood of being cited by AI engines." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Index = () => {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="font-heading text-xl tracking-tight text-foreground">
            AEO <span className="text-gradient-primary">Auditor</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">by Flexxi</span>
            <button className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
              Book a call
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative grid-bg overflow-hidden pt-32 pb-24 md:pt-48 md:pb-36">
        {/* Glow orb */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5"
          >
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Powered by Claude AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            AEO Audit{" "}
            <span className="italic text-gradient-primary">in seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Enter any website URL. We analyse the homepage, score 5 AEO signals,
            and generate a full report — ready to send to a prospect.
          </motion.p>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mx-auto mt-10 flex max-w-xl items-center gap-0 rounded-full border border-border bg-card p-1.5 transition-all focus-within:border-primary/50 focus-within:glow-primary"
          >
            <span className="pl-4 text-sm text-muted-foreground">https://</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yoursite.com"
              className="flex-1 bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Run audit <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Takes 15–30 seconds · <span className="font-medium text-foreground">Claude Sonnet</span>
          </motion.p>

          {/* Sample domains */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {sampleDomains.map((d) => (
              <button
                key={d}
                onClick={() => setUrl(d)}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {d}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Signals */}
      <section className="border-t border-border bg-background py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-4xl tracking-tight text-foreground md:text-5xl"
            >
              5 signals we <span className="text-gradient-primary">analyse</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-muted-foreground"
            >
              Each signal is scored individually, then combined into your total AEO score.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {signals.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-border bg-card p-6 transition-all border-glow"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Score ranges */}
      <section className="border-t border-border bg-card py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-4xl tracking-tight text-foreground md:text-5xl"
            >
              What your <span className="text-gradient-primary">score</span> means
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            {scoreRanges.map((r, i) => (
              <motion.div
                key={r.range}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-6 rounded-2xl border border-border bg-background p-6 transition-all border-glow"
              >
                <span className="font-heading text-2xl text-muted-foreground">{r.range}</span>
                <div>
                  <h3 className="font-heading text-lg text-foreground">{r.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative grid-bg border-t border-border py-24 md:py-32">
        <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl tracking-tight text-foreground md:text-6xl"
          >
            Ready to get <span className="italic text-gradient-primary">cited?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-muted-foreground"
          >
            Run a free audit now, or book a call to discuss your AEO strategy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Run free audit →
            </button>
            <button className="rounded-full border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
              Book a call
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <span className="font-heading text-sm text-muted-foreground">
            AEO Auditor <span className="text-foreground">by Flexxi</span>
          </span>
          <span className="text-xs text-muted-foreground">© 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
