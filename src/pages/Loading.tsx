import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingProps {
  domain: string;
}

const steps = [
  "Fetching homepage HTML",
  "Checking robots.txt for AI bots",
  "Scanning schema markup",
  "Analysing entity clarity",
  "Evaluating content structure",
  "Generating report",
];

const stepDelays = [0, 900, 1700, 2600, 3600, 4900];

const Loading = ({ domain }: LoadingProps) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = stepDelays.map((delay, i) =>
      setTimeout(() => setActiveStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-lg px-6"
      >
        <h1 className="font-heading text-4xl italic tracking-tight text-foreground md:text-5xl">
          {domain}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Running AEO analysis — usually under 25 seconds
        </p>

        <div className="mt-10 flex flex-col">
          {steps.map((step, i) => {
            const status = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 border-b border-border py-4 last:border-b-0"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {status === "active" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      status === "done"
                        ? "bg-foreground"
                        : status === "active"
                        ? "bg-amber-400"
                        : "border border-muted-foreground/30 bg-transparent"
                    }`}
                  />
                </span>
                <span
                  className={`text-sm ${
                    status === "pending"
                      ? "text-muted-foreground/40"
                      : status === "active"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;
