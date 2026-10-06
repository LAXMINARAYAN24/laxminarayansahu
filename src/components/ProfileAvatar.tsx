import { useEffect, useState } from "react";
import { User, X } from "lucide-react";
const LOCAL_PROFILE = "/profile.jpg";
export function ProfileAvatar({ size = "default" }: { size?: "default" | "inline" } = {}) {
  const url = LOCAL_PROFILE;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const sizeCls = size === "inline" ? "h-28 w-28 md:h-36 md:w-36" : "h-48 w-48 md:h-56 md:w-56";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => url && setOpen(true)}
        aria-label="Open profile photo"
        className={`group relative ${sizeCls} overflow-hidden rounded-full border-2 border-border bg-card shadow-xl ring-4 ring-background transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-primary`}
      >
        {url ? (
          <img
            src={url}
            alt="Laxminarayan Sahu"
            className="h-full w-full object-cover object-[50%_30%] scale-110 transition-transform duration-500 group-hover:scale-[1.18]"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
            <User className="h-16 w-16 text-primary/70" />
          </div>
        )}
      </button>

      {open && url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={url}
            alt="Laxminarayan Sahu"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/20"
          />
        </div>
      )}
    </div>
  );
}
