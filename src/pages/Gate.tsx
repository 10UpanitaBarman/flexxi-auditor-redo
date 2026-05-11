import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import flexxiLogo from "@/assets/flexxi-logo.png";

const CLAY_WEBHOOK_URL =
  "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b2de7358-1b74-46cd-8f0d-885e3543927b";

async function sendToClayWithRetry(payload: Record<string, unknown>, maxAttempts = 3) {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(CLAY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) return { ok: true as const, status: res.status };
      lastError = new Error(`HTTP ${res.status}`);
      // Don't retry client errors (except 408/429)
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return { ok: false as const, status: res.status, error: lastError };
      }
    } catch (err) {
      lastError = err;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
    }
  }
  return { ok: false as const, status: 0, error: lastError };
}

export interface LeadInfo {
  fullName: string;
  workEmail: string;
  company: string;
  jobTitle: string;
}

interface GateProps {
  domain: string;
  onContinue: (info: LeadInfo) => void;
  onBack: () => void;
}

const fields: { key: keyof LeadInfo; label: string; placeholder: string; type?: string }[] = [
  { key: "fullName", label: "Full name", placeholder: "Jane Doe" },
  { key: "workEmail", label: "Work email", placeholder: "jane@company.com", type: "email" },
  { key: "company", label: "Company", placeholder: "Acme Inc." },
  { key: "jobTitle", label: "Job title", placeholder: "Head of Design" },
];

const Gate = ({ domain, onContinue, onBack }: GateProps) => {
  const [info, setInfo] = useState<LeadInfo>({
    fullName: "",
    workEmail: "",
    company: "",
    jobTitle: "",
  });

  const isValid =
    info.fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.workEmail.trim()) &&
    info.company.trim().length > 0 &&
    info.jobTitle.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Fire-and-forget send to Clay webhook
    try {
      fetch("https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b2de7358-1b74-46cd-8f0d-885e3543927b", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...info,
          domain,
          submitted_at: new Date().toISOString(),
          source: "aeo-auditor",
        }),
      }).catch((err) => console.error("Clay webhook failed:", err));
    } catch (err) {
      console.error("Clay webhook error:", err);
    }

    onContinue(info);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 md:p-10 shadow-2xl"
      >
        <button
          onClick={onBack}
          aria-label="Close"
          className="absolute right-4 top-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back
        </button>

        <p className="mb-3 text-sm text-muted-foreground">Auditing {domain}</p>
        <h1 className="font-heading text-2xl leading-tight tracking-tight text-foreground md:text-3xl">
          Before we crunch the numbers.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tell us a bit about yourself so we can tailor your results.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {fields.map((f) => (
            <div key={f.key} className="border-b border-border pb-2">
              <label className="block text-xs text-muted-foreground" htmlFor={f.key}>
                {f.label}
              </label>
              <input
                id={f.key}
                type={f.type ?? "text"}
                required
                maxLength={120}
                value={info[f.key]}
                onChange={(e) => setInfo((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1 w-full bg-transparent font-heading text-xl text-foreground outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={!isValid}
              style={{ padding: "0.875rem 2.5rem" }}
              className="cta-holo inline-flex items-center gap-2 rounded-full text-xs font-semibold tracking-[0.05em] text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            We use this to tailor your report. No spam.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Gate;
