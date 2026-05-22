import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mail, Phone, Github, Linkedin, ExternalLink, ArrowUpRight,
  Code2, Trophy, GraduationCap, Sparkles, Sun, Moon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Portfolio,
  head: () => ({
    meta: [
      { title: "Laxminarayan Sahu — Software Developer & AI Builder" },
      { name: "description", content: "Interactive portfolio of Laxminarayan Sahu, B.Tech IT student at NIT Karnataka building AI, full-stack and computer vision projects." },
    ],
  }),
});

type Project = {
  name: string;
  period: string;
  blurb: string;
  stack: string[];
  tag: "AI" | "Full-Stack" | "Vision" | "Security";
};

const projects: Project[] = [
  { name: "VOICEVIZ", period: "Jan – Mar 2026", blurb: "AI SQL workspace with voice-to-query input, schema exploration, secure multi-user auth, and interactive chatbot visualizations.", stack: ["React", "TypeScript", "Vite", "Tailwind", "Supabase"], tag: "AI" },
  { name: "ABMHE Image Enhancement", period: "Jan – Apr 2026", blurb: "Adaptive Block-based Multi-Histogram Equalization using overlapping sub-blocks and Hanning windows for smooth, artifact-free contrast.", stack: ["Python", "PyTorch", "OpenCV"], tag: "Vision" },
  { name: "Steg-Drop", period: "Jan – Apr 2026", blurb: "In-memory steganography tool hiding data in textured regions via Canny edges, secured with AES-256-GCM and PBKDF2.", stack: ["Python", "FastAPI", "OpenCV", "pycryptodome"], tag: "Security" },
  { name: "AI Job Tracker", period: "Jan – Jun 2025", blurb: "AI-driven career portal with Gemini-powered CV optimization, role recommendations, and end-to-end application tracking.", stack: ["Node.js", "Express", "MongoDB", "EJS"], tag: "Full-Stack" },
];

const skills = {
  Languages: ["C/C++", "Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  Frameworks: ["React", "Node.js", "Express.js", "MongoDB", "Supabase", "Tailwind CSS"],
  Tools: ["Git", "GitHub", "VS Code"],
};

const filters = ["All", "AI", "Full-Stack", "Vision", "Security"] as const;
type Filter = (typeof filters)[number];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  };
  return { theme, toggle };
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function Portfolio() {
  const { theme, toggle } = useTheme();
  useReveal();
  const progress = useScrollProgress();
  const [filter, setFilter] = useState<Filter>("All");
  const heroRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.tag === filter)),
    [filter],
  );

  // Mouse-follow glow in hero
  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      {/* Scroll progress */}
      <div
        className="fixed left-0 top-0 z-50 h-0.5 origin-left"
        style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
      />

      {/* Glow backdrop */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[80vh]"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-sm font-semibold tracking-tight">
            LS<span className="text-primary">.</span>
          </a>
          <ul className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <li><a href="#work" className="hover:text-foreground transition-colors">Work</a></li>
            <li><a href="#skills" className="hover:text-foreground transition-colors">Skills</a></li>
            <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 hover:border-primary/60 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href="mailto:sahulucky2411@gmail.com"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:border-primary/60 transition-colors"
            >
              Get in touch <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="top"
        ref={heroRef}
        onMouseMove={onHeroMove}
        className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-24 pb-32 md:pt-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70 transition-opacity"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--primary) 22%, transparent), transparent 60%)",
          }}
        />
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Available for internships & collaborations
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
          Laxminarayan
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            Sahu.
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          B.Tech Information Technology student at <span className="text-foreground">NIT Karnataka</span>,
          building thoughtful software across AI, full-stack, and computer vision.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            View selected work <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/LAXMINARAYAN24"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "4+", v: "Projects shipped" },
            { k: "5427", v: "JEE Main AIR" },
            { k: "10+", v: "Technologies" },
            { k: "2026", v: "Graduating" },
          ].map((s) => (
            <div key={s.v} className="reveal rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-2xl font-semibold tracking-tight" style={{ backgroundImage: "var(--gradient-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {s.k}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Selected Work</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Things I&apos;ve been building.</h2>
          </div>
          <Code2 className="hidden h-8 w-8 text-muted-foreground md:block" />
        </div>

        {/* Filters */}
        <div className="reveal mb-8 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-transparent text-primary-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
                style={active ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" } : undefined}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Toolkit</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Technologies I work with.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group} className="reveal rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-sm font-medium text-primary">{group}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {items.map((s) => (
                  <span key={s} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-transform hover:scale-105">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="reveal">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">About</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Curious engineer with a bias for shipping.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              I&apos;m an IT undergrad at NIT Karnataka exploring the intersection of AI,
              systems, and beautiful interfaces. I enjoy turning research-flavored ideas
              into things you can actually use — from image-processing pipelines to
              voice-driven SQL tools.
            </p>
          </div>
          <div className="grid gap-4">
            <InfoCard icon={<GraduationCap className="h-5 w-5 text-primary" />} title="Education">
              <p className="font-medium">National Institute of Technology Karnataka, Surathkal</p>
              <p className="text-sm text-muted-foreground">B.Tech, Information Technology · Aug 2023 – Present</p>
            </InfoCard>
            <InfoCard icon={<Trophy className="h-5 w-5 text-primary" />} title="Achievements">
              <p className="text-sm">All India Rank <span className="font-semibold">5427 (General)</span> in JEE Main 2023 — among 1.2M+ candidates.</p>
            </InfoCard>
            <InfoCard icon={<Sparkles className="h-5 w-5 text-primary" />} title="Experience">
              <p className="font-medium">Scaler — AI Training (Freelance)</p>
              <p className="text-sm text-muted-foreground">Generated structured training data to enhance model alignment & reliability.</p>
            </InfoCard>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-32">
        <div
          className="reveal relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: "var(--gradient-glow)" }}
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Contact</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              Let&apos;s build<br />something good.
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <ContactLink href="mailto:sahulucky2411@gmail.com" icon={<Mail className="h-4 w-4" />} label="sahulucky2411@gmail.com" />
              <ContactLink href="tel:+919826557187" icon={<Phone className="h-4 w-4" />} label="+91 98265 57187" />
              <ContactLink href="https://github.com/LAXMINARAYAN24" icon={<Github className="h-4 w-4" />} label="GitHub" />
              <ContactLink href="https://linkedin.com/in/LAXMINARAYAN" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Laxminarayan Sahu. Crafted with care.
        </div>
      </footer>
    </main>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 6}deg`);
    el.style.setProperty("--rx", `${-y * 6}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="reveal tilt-card group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">{p.name}</h3>
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.tag}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{p.period}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
      <p className="relative mt-5 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
      <div className="relative mt-6 flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <span key={s} className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            {s}
          </span>
        ))}
      </div>
    </article>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="reveal rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}<span>{title}</span>
      </div>
      <div className="mt-3 space-y-1">{children}</div>
    </div>
  );
}

function ContactLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
    >
      {icon} {label}
    </a>
  );
}
