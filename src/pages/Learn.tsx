import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, FileText, Search, Shield, Zap } from "lucide-react";
import flexxiLogo from "@/assets/flexxi-logo.png";

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

const Learn = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Flexxi">
          <img src={flexxiLogo} alt="Flexxi" className="h-8 w-auto" />
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    </nav>

    <main className="pt-32">
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-12 border-b border-border pb-4">
            <motion.h1 variants={fadeUp} custom={0} className="font-heading text-xl text-foreground md:text-2xl">
              What we analyse
            </motion.h1>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="flex flex-col">
            {signals.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} custom={i} className="group grid grid-cols-[auto_1fr_minmax(0,12rem)] items-start gap-3 rounded-lg px-2 py-6 transition-colors hover:bg-card md:grid-cols-[auto_1fr_minmax(0,22rem)] md:gap-8 md:py-8">
                <span className="pt-2 text-xs text-muted-foreground md:pt-5">{s.num}</span>
                <h2 className="font-heading text-3xl leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">{s.title}</h2>
                <p className="pt-2 text-xs leading-relaxed text-muted-foreground opacity-100 md:pt-3 md:text-sm md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-12 border-b border-border pb-4">
            <motion.h2 variants={fadeUp} custom={0} className="font-heading text-xl text-foreground md:text-2xl">
              What your score means
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16">
            <motion.h3 variants={fadeUp} custom={0} className="font-heading text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Know where
              <br />
              you stand
            </motion.h3>

            <div className="flex flex-col divide-y divide-border">
              {scoreRanges.map((r, i) => (
                <motion.div key={r.range} variants={fadeUp} custom={i} className="py-6 first:pt-0 last:pb-0">
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

      <section className="relative py-32 md:py-48">
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Get your free AEO assessment and elevate your brand.
          </motion.h2>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-12 flex justify-center">
            <Link to="/" className="cta-holo inline-flex items-center gap-2 rounded-full px-12 py-4 text-base font-semibold tracking-wide text-foreground">
              Run an audit <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  </div>
);

export default Learn;
