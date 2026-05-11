const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLAY_WEBHOOK_URL =
  "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b2de7358-1b74-46cd-8f0d-885e3543927b";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    // Basic validation
    if (
      !payload ||
      typeof payload.fullName !== "string" ||
      typeof payload.workEmail !== "string" ||
      typeof payload.company !== "string" ||
      typeof payload.jobTitle !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxAttempts = 3;
    let lastStatus = 0;
    let lastError: string | null = null;

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
        lastStatus = res.status;

        if (res.ok) {
          return new Response(JSON.stringify({ ok: true, status: res.status }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        lastError = await res.text().catch(() => "");
        // Don't retry on 4xx (except 408/429)
        if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
      }
    }

    console.error("Clay webhook failed:", lastStatus, lastError);
    return new Response(
      JSON.stringify({ ok: false, status: lastStatus, error: lastError }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("clay-lead error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
