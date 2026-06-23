import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { finalizeProfilePhoto, getProfilePhoto } from "@/lib/profile.functions";
import { useAdmin } from "@/hooks/useAdmin";

export function ProfileAvatar({ size = "default" }: { size?: "default" | "inline" } = {}) {
  const { isAdmin } = useAdmin();
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const finalize = useServerFn(finalizeProfilePhoto);
  const fetchPhoto = useServerFn(getProfilePhoto);

  useEffect(() => {
    fetchPhoto().then((r) => setUrl(r.url)).catch(() => {});
  }, [fetchPhoto]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const res = await finalize({ data: { path } });
      setUrl(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const sizeCls =
    size === "inline"
      ? "h-20 w-20 md:h-28 md:w-28"
      : "h-40 w-40 md:h-48 md:w-48";
  const iconBtnCls =
    size === "inline" ? "h-7 w-7" : "h-10 w-10";

  return (
    <div className="relative inline-block">
      <div className={`relative ${sizeCls} overflow-hidden rounded-full border-2 border-border bg-card shadow-xl ring-4 ring-background`}>
        {url ? (
          <img
            src={url}
            alt="Laxminarayan Sahu"
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
            <User className="h-16 w-16 text-primary/70" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Replace photo"
            aria-label="Replace profile photo"
            className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </>
      )}

      {error && (
        <p className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
