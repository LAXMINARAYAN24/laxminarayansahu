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

  let payload: any;

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const record = payload?.record ?? {};

  const name = record.name ?? "Unknown";
  const email = record.email ?? "unknown@example.com";
  const message = record.message ?? "";

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: NOTIFY_FROM_EMAIL,
      to: NOTIFY_TO_EMAIL,
      reply_to: email,
      subject: `New portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error(err);
    return new Response("Failed to send email", { status: 502 });
  }

  return new Response("OK");
});