import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, BarChart3, FileText, Zap } from "lucide-react";
import flexxiLogo from "@/assets/flexxi-logo.png";

const sampleDomains = ["flexxi.design", "ueno.co", "work.co", "instrument.com", "raresupremacy.com"];

const scoreRanges = [
  { range: "0–40", label: "Invisible", desc: "AI engines can't find or classify this site. No schema, likely blocking crawlers." },
  { range: "41–60", label: "Partial", desc: "Crawlers allowed and brand visible — but no schema and weak structure." },
  { range: "61–80", label: "Competitive", desc: "Schema present, entity clear, some structured content. Citable but not dominant." },
  { range: "81–100", label: "Citation-ready", desc: "Everything in place. Brand shows up when someone asks AI \"who does X?\"" },
];

const signals = [
  { num: "01", icon: Shield, title: "AI Crawlers", desc: "GPTBot · ClaudeBot · Perplexity — we check whether your site allows or blocks AI bots from accessing your content." },
  { num: "02", icon: FileText, title: "Schema Markup", desc: "FAQPage · Organization · HowTo — we scan for structured data that helps AI engines understand what your site is about." },
  { num: "03", icon: Search, title: "Entity Clarity", desc: "Brand + category clarity — we evaluate how clearly your site communicates who you are and what you do." },
  { num: "04", icon: BarChart3, title: "Content Structure", desc: "FAQ · H2/H3 · comparison — we analyse your semantic HTML and content hierarchy for AI readability." },
  { num: "05", icon: Zap, title: "Citability Score", desc: "Overall likelihood of being cited by AI engines when users ask questions related to your industry." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Index = () => {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <img src={flexxiLogo} alt="Flexxi" className="h-8 w-auto" />
          <button className="cta-holo rounded-full px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
            Book a call
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative grid-bg overflow-hidden pt-32 pb-24 md:pt-48 md:pb-36">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 inline-flex"
          >
            <span className="tag">AEO Auditor</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            AEO Audit
            <br />
            in seconds.
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
            className="input-holo mx-auto mt-10 flex max-w-xl items-center gap-0 rounded-full border border-border bg-card p-1.5 transition-all focus-within:border-transparent"
          >
            <span className="pl-4 text-sm text-muted-foreground">https://</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yoursite.com"
              className="flex-1 bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Run audit <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Takes 15–30 seconds
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
                className="tag cursor-pointer"
              >
                {d}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Signals — numbered layout like Flexxi services */}
      <section className="border-t border-border bg-background py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm uppercase tracking-[0.15em] text-muted-foreground"
            >
              What We Analyse
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="divide-y divide-border"
          >
            {signals.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="group grid grid-cols-1 gap-4 py-10 first:pt-0 last:pb-0 md:grid-cols-[auto_1fr_1fr] md:gap-8 md:items-start"
              >
                <span className="text-xs text-muted-foreground font-medium">{s.num}</span>
                <h3 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:pt-2">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Score ranges */}
      <section className="border-t border-border bg-card py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-4xl tracking-tight text-foreground md:text-5xl"
            >
              What your
              <br />
              score means
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="max-w-sm text-sm text-muted-foreground"
            >
              Your total AEO score tells you how visible your brand is to AI engines — and what to fix.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {scoreRanges.map((r, i) => (
              <motion.div
                key={r.range}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-background p-6 transition-all border-gradient-card"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-heading text-2xl text-foreground">{r.range}</span>
                  <span className="tag">{r.label}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative grid-bg border-t border-border py-24 md:py-32">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl tracking-tight text-foreground md:text-6xl"
          >
            Ready to get cited?
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
            <button className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Run free audit
            </button>
            <button className="cta-holo rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
              Book a call
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <img src={flexxiLogo} alt="Flexxi" className="h-6 w-auto opacity-60" />
          <span className="text-xs text-muted-foreground">© 2026 Flexxi</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
