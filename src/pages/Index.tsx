import { useState } from "react";
import { motion } from "framer-motion";

interface IndexProps {
  onSubmit?: (domain: string) => void;
}
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

const Index = ({ onSubmit }: IndexProps = {}) => {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="https://www.flexxi.studio/who-we-are" target="_blank" rel="noopener noreferrer" aria-label="Flexxi">
            <img src={flexxiLogo} alt="Flexxi" className="h-8 w-auto" />
          </a>
          <div className="flex items-center gap-6">
            <a
              href="https://www.flexxi.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Studio
            </a>
            <a
              href="https://meetings.hubspot.com/allie-vogel?uuid=8b27d2ba-0aac-4ab5-a591-203dd924bf87"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-holo inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground"
            >
              Book A Call <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-36">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 inline-flex"
          >
            <span className="text-sm font-medium text-foreground">AEO Auditor</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            How are you ranking
            <br />
            on AI Search?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            See how your brand shows up across ChatGPT, Gemini, Claude, and Perplexity -not just if you’re mentioned, but how you’re positioned. Free.
          </motion.p>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="input-holo mx-auto mt-10 flex max-w-xl items-center gap-0 rounded-full border border-foreground bg-card p-1.5 transition-all"
          >
            <span className="pl-4 text-base text-muted-foreground">https://</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yoursite.com"
              className="flex-1 bg-transparent px-2 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => url && onSubmit?.(url)}
              style={{ background: "hsl(0 0% 100%)" }}
              className="cta-holo group flex items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 text-sm font-semibold uppercase tracking-[0.1em] text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Run audit
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm text-muted-foreground"
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

      {/* Signals — Flexxi-style hover-reveal layout */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 border-b border-border pb-4"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-xl text-foreground md:text-2xl"
            >
              What we analyse
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col"
          >
            {signals.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="group grid grid-cols-[auto_1fr_minmax(0,12rem)] items-start gap-3 rounded-lg px-2 py-6 transition-colors hover:bg-card md:grid-cols-[auto_1fr_minmax(0,22rem)] md:gap-8 md:py-8"
              >
                <span className="pt-2 text-xs text-muted-foreground md:pt-5">{s.num}</span>
                <h3 className="font-heading text-3xl leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                  {s.title}
                </h3>
                <p className="pt-2 text-xs leading-relaxed text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:pt-3 md:text-sm">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Score ranges */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 border-b border-border pb-4"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-xl text-foreground md:text-2xl"
            >
              What your score means
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16"
          >
            <motion.h3
              variants={fadeUp}
              custom={0}
              className="font-heading text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl"
            >
              Know where
              <br />
              you stand
            </motion.h3>

            <div className="flex flex-col divide-y divide-border">
              {scoreRanges.map((r, i) => (
                <motion.div
                  key={r.range}
                  variants={fadeUp}
                  custom={i}
                  className="py-6 first:pt-0 last:pb-0"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-heading text-2xl text-foreground md:text-3xl">{r.range}</span>
                    <span className="tag">{r.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 md:py-48">
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            Get your free AEO assessment and elevate your brand.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex justify-center"
          >
            <a
              href="https://meetings.hubspot.com/allie-vogel?uuid=8b27d2ba-0aac-4ab5-a591-203dd924bf87"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-holo inline-flex items-center gap-2 rounded-full px-12 py-4 text-base font-semibold tracking-wide text-foreground"
            >
              Book an intro call
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 text-sm text-muted-foreground"
          >
            You can also send us an email 😉{" "}
            <a href="mailto:hello@flexxi.design" className="text-foreground">
              hello@flexxi.design
            </a>
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="https://www.flexxi.studio/who-we-are" target="_blank" rel="noopener noreferrer" aria-label="Flexxi">
            <img src={flexxiLogo} alt="Flexxi" className="h-6 w-auto opacity-60 transition-opacity hover:opacity-100" />
          </a>
          <span className="text-xs text-muted-foreground">© 2026 Flexxi</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
