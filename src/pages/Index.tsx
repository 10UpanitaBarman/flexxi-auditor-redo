import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface IndexProps {
  onSubmit?: (domain: string) => void;
}
import { ArrowRight } from "lucide-react";
import flexxiLogo from "@/assets/flexxi-logo.png";

const sampleDomains = ["flexxi.design", "ueno.co", "work.co", "instrument.com", "raresupremacy.com"];

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
            className="input-holo mx-auto mt-10 flex max-w-xl items-center gap-0 rounded-full border border-foreground bg-card px-1.5 transition-all"
          >
            <span className="pl-4 text-base text-muted-foreground">https://</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yoursite.com"
              className="flex-1 bg-transparent px-2 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            className="mt-6 flex justify-center"
          >
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Link to="/learn" className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline">
              Learn what we analyse
            </Link>
          </motion.div>
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
