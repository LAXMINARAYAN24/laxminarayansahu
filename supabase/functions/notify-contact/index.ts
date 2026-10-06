import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_TO_EMAIL = Deno.env.get("NOTIFY_TO_EMAIL");
const NOTIFY_FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "onboarding@resend.dev";
const WEBHOOK_SECRET = Deno.env.get("CONTACT_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const providedSecret = req.headers.get("x-webhook-secret");

  if (!WEBHOOK_SECRET || providedSecret !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!RESEND_API_KEY || !NOTIFY_TO_EMAIL) {
    return new Response("Server misconfigured", { status: 500 });
  }

  let payload: {
    type?: string;
    schema?: string;
    table?: string;
    record?: Record<string, unknown>;
  } | null;

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (
    payload?.type !== "INSERT" ||
    payload.schema !== "public" ||
    payload.table !== "contact_messages"
  ) {
    return new Response("Unsupported event", { status: 400 });
  }
  const { id, name, email, message } = payload.record ?? {};
  if (
    typeof id !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(id) ||
    typeof name !== "string" ||
    name.trim().length < 1 ||
    name.length > 100 ||
    typeof email !== "string" ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.length > 2000
  ) {
    return new Response("Invalid contact record", { status: 400 });
  }

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-contact/${id}`,
      },
      body: JSON.stringify({
        from: NOTIFY_FROM_EMAIL,
        to: NOTIFY_TO_EMAIL,
        reply_to: email,
        subject: `New portfolio message from ${name.replace(/[\r\n]/g, " ")}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!emailRes.ok) {
      console.error("Email provider rejected notification", {
        status: emailRes.status,
        messageId: id,
      });
      return new Response("Failed to send email", { status: 502 });
    }

    return new Response("OK");
  } catch {
    console.error("Email provider request failed", { messageId: id });
    return new Response("Email service unavailable", { status: 502 });
  }
});
