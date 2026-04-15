import { supabase } from "@/integrations/supabase/client";
import type { AuditResult } from "@/types/audit";

export async function runAEOAudit(domain: string): Promise<AuditResult> {
  const { data, error } = await supabase.functions.invoke("aeo-audit", {
    body: { domain },
  });

  if (error) throw error;
  return data as AuditResult;
}
