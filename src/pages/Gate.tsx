import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import flexxiLogo from "@/assets/flexxi-logo.png";

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
    onContinue(info);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button onClick={onBack} aria-label="Flexxi">
            <img src={flexxiLogo} alt="Flexxi" className="h-8 w-auto" />
          </button>
          <button
            onClick={onBack}
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Back
          </button>
        </div>
      </nav>

      <section className="px-6 pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-3 text-sm text-muted-foreground">Auditing {domain}</p>
            <h1 className="font-heading text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Tell us a bit about yourself so we can tailor your results.
            </h1>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onSubmit={handleSubmit}
            className="mt-10 space-y-8"
          >
            {fields.map((f) => (
              <div key={f.key} className="border-b border-border pb-3">
                <label className="block text-sm text-muted-foreground" htmlFor={f.key}>
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
                  className="mt-2 w-full bg-transparent font-heading text-2xl text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!isValid}
                style={{ padding: "0.875rem 2.5rem" }}
                className="cta-holo inline-flex items-center gap-2 rounded-full text-xs font-semibold tracking-[0.05em] text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Get my assessment <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              We use this to tailor your report. No spam.
            </p>
          </motion.form>
        </div>
      </section>
    </div>
  );
};

export default Gate;
