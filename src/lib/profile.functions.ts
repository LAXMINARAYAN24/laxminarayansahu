import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin-only: generate a signed URL for an uploaded profile photo and
 * persist it into site_settings. The browser uploads the file directly
 * (RLS gates storage writes to admins); this fn then signs + saves.
 */
export const finalizeProfilePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { path: string }) => {
    if (!data || typeof data.path !== "string" || data.path.length === 0) {
      throw new Error("Invalid path");
    }
    if (data.path.length > 256) throw new Error("Path too long");
    return { path: data.path };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    // 10-year signed URL (max supported by Supabase signed URLs)
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("profile-photos")
      .createSignedUrl(data.path, TEN_YEARS);
    if (signErr || !signed) throw new Error(signErr?.message ?? "Could not sign URL");

    const { error: upErr } = await supabaseAdmin
      .from("site_settings")
      .upsert({
        key: "profile_photo",
        value: { url: signed.signedUrl, path: data.path },
        updated_by: userId,
      });
    if (upErr) throw new Error(upErr.message);

    return { url: signed.signedUrl };
  });

/** Public read: returns the current profile photo URL (or null). */
export const getProfilePhoto = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await sb
    .from("site_settings")
    .select("value")
    .eq("key", "profile_photo")
    .maybeSingle();
  const url = (data?.value as { url?: string | null } | null)?.url ?? null;
  return { url };
});
