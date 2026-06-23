import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  Mail, Phone, Github, Linkedin, ExternalLink, ArrowUpRight,
  Code2, Trophy, GraduationCap, Sparkles, Sun, Moon, Download,
  X, Loader2, CheckCircle2, Calendar,
} from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Affiliations } from "@/components/Affiliations";
import nitkLogo from "@/assets/logo-nitk.png";
import iitjLogo from "@/assets/logo-iitj.png";
import spritLogo from "@/assets/logo-sprit.png";

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
  details: string;
  stack: string[];
  tag: "AI" | "Full-Stack" | "Vision" | "Security";
  links?: { label: string; href: string }[];
  accent: string; // gradient for placeholder
};

const projects: Project[] = [
  {
    name: "VOICEVIZ",
    period: "Jan – Mar 2026",
    blurb: "AI SQL workspace with voice-to-query input, schema exploration, secure multi-user auth, and interactive chatbot visualizations.",
    details: "VOICEVIZ turns natural speech into SQL. It listens to a question, infers the user's intent against the live database schema, generates a safe query, and renders the result as a chart or table. Multi-user auth and per-workspace RLS keep data isolated; an in-chat assistant explains queries and suggests follow-ups.",
    stack: ["React", "TypeScript", "Vite", "Tailwind", "Supabase", "Web Speech API"],
    tag: "AI",
    links: [{ label: "GitHub", href: "https://github.com/LAXMINARAYAN24" }],
    accent: "from-cyan-500 via-sky-500 to-fuchsia-500",
  },
  {
    name: "ABMHE Image Enhancement",
    period: "Jan – Apr 2026",
    blurb: "Adaptive Block-based Multi-Histogram Equalization using overlapping sub-blocks and Hanning windows for smooth, artifact-free contrast.",
    details: "ABMHE splits the image into overlapping blocks, computes a local histogram per block, equalizes adaptively, and blends back using Hanning windows to eliminate block boundaries. Beats classic CLAHE on low-light and high-dynamic-range medical samples in side-by-side tests.",
    stack: ["Python", "PyTorch", "OpenCV", "NumPy"],
    tag: "Vision",
    links: [{ label: "GitHub", href: "https://github.com/LAXMINARAYAN24" }],
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    name: "Steg-Drop",
    period: "Jan – Apr 2026",
    blurb: "In-memory steganography tool hiding data in textured regions via Canny edges, secured with AES-256-GCM and PBKDF2.",
    details: "Steg-Drop never touches disk. Files are encrypted with AES-256-GCM (PBKDF2 key derivation), then embedded into high-texture regions of a cover image — picked via Canny edge density — making detection by statistical steganalysis significantly harder than uniform LSB.",
    stack: ["Python", "FastAPI", "OpenCV", "pycryptodome"],
    tag: "Security",
    links: [{ label: "GitHub", href: "https://github.com/LAXMINARAYAN24" }],
    accent: "from-rose-500 via-orange-500 to-amber-500",
  },
  {
    name: "AI Job Tracker",
    period: "Jan – Jun 2025",
    blurb: "AI-driven career portal with Gemini-powered CV optimization, role recommendations, and end-to-end application tracking.",
    details: "An end-to-end job hunt cockpit. Uploads parse résumés with Gemini, score them against job descriptions, suggest rewrites, and recommend matching roles. A Kanban board tracks every application from saved to offer with reminders and notes.",
    stack: ["Node.js", "Express", "MongoDB", "EJS", "Gemini API"],
    tag: "Full-Stack",
    links: [{ label: "GitHub", href: "https://github.com/LAXMINARAYAN24" }],
    accent: "from-violet-500 via-purple-500 to-indigo-500",
  },
];

const skills = {
  Languages: ["C/C++", "Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  Frameworks: ["React", "Node.js", "Express.js", "MongoDB", "Supabase", "Tailwind CSS"],
  Tools: ["Git", "GitHub", "VS Code"],
};

const filters = ["All", "AI", "Full-Stack", "Vision", "Security"] as const;
type Filter = (typeof filters)[number];

type TimelineEntry = {
  year: string;
  kind: "education" | "project" | "achievement" | "experience";
  title: string;
  subtitle: string;
  logo?: string;
};

const timeline: TimelineEntry[] = [
  { year: "2023", kind: "achievement", title: "JEE Main 2023", subtitle: "All India Rank 5427 among 1.2M+ candidates" },
  { year: "2023", kind: "education", title: "Joined NIT Karnataka", subtitle: "B.Tech, Information Technology — Aug 2023", logo: nitkLogo },
  { year: "2025", kind: "project", title: "AI Job Tracker", subtitle: "Gemini-powered CV optimization & application tracker" },
  { year: "2025", kind: "experience", title: "Scaler — AI Training (Freelance)", subtitle: "Structured training data for model alignment" },
  { year: "2025", kind: "experience", title: "Sprit Lab — ML Intern", subtitle: "Applied ML research & prototyping", logo: spritLogo },
  { year: "2026", kind: "experience", title: "IIT Jodhpur — Research Intern", subtitle: "Summer research internship", logo: iitjLogo },
  { year: "2026", kind: "project", title: "VOICEVIZ", subtitle: "Voice-to-SQL workspace with visualizations" },
  { year: "2026", kind: "project", title: "ABMHE Image Enhancement", subtitle: "Adaptive multi-histogram equalization" },
  { year: "2026", kind: "project", title: "Steg-Drop", subtitle: "In-memory AES-256-GCM steganography" },
  { year: "2027", kind: "education", title: "Graduating", subtitle: "B.Tech IT — NIT Karnataka", logo: nitkLogo },
];

function useGlobalTheme() {
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

function useReveal(deps: unknown[] = []) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
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

function useSectionTheme(initial: "light" | "dark") {
  const [t, setT] = useState<"light" | "dark">(initial);
  const toggle = () => setT((p) => (p === "light" ? "dark" : "light"));
  return { t, toggle, cls: t === "light" ? "theme-light" : "theme-dark" };
}

function Portfolio() {
  const { theme, toggle } = useGlobalTheme();
  const progress = useScrollProgress();
  const [filter, setFilter] = useState<Filter>("All");
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Per-section theme: hero defaults light, rest default dark
  const heroTheme = useSectionTheme("light");
  const workTheme = useSectionTheme("dark");
  const skillsTheme = useSectionTheme("dark");
  const timelineTheme = useSectionTheme("dark");
  const aboutTheme = useSectionTheme("dark");
  const contactTheme = useSectionTheme("dark");

  useReveal([filter]);

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.tag === filter)),
    [filter],
  );

  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div
        className="fixed left-0 top-0 z-50 h-0.5 origin-left"
        style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-sm font-semibold tracking-tight">
            LS
          </a>
          <ul className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <li><a href="#work" className="hover:text-foreground transition-colors">Work</a></li>
            <li><a href="#affiliations" className="hover:text-foreground transition-colors">Affiliations</a></li>
            <li><a href="#timeline" className="hover:text-foreground transition-colors">Timeline</a></li>
            <li><a href="#skills" className="hover:text-foreground transition-colors">Skills</a></li>
            <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
          </ul>
          <div className="flex items-center gap-2">
            <a
              href="/resume.pdf"
              download
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:border-primary/60 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Resume
            </a>
            <button
              onClick={toggle}
              aria-label="Toggle global theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 hover:border-primary/60 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="top"
        ref={heroRef}
        onMouseMove={onHeroMove}
        className={`${heroTheme.cls} relative overflow-hidden transition-colors duration-500`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(500px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--primary) 22%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-32 md:pt-32 relative">
          <SectionThemeToggle theme={heroTheme.t} onToggle={heroTheme.toggle} />
          <div className="mb-8 flex justify-start">
            <ProfileAvatar />
          </div>
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
              Sahu
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
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors"
            >
              <Download className="h-4 w-4" /> Download résumé
            </a>
            <a
              href="https://github.com/LAXMINARAYAN24"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: "4+", v: "Projects shipped" },
              { k: "5427", v: "JEE Main AIR" },
              { k: "10+", v: "Technologies" },
              { k: "2027", v: "Graduating" },
            ].map((s) => (
              <div key={s.v} className="reveal rounded-2xl border border-border bg-card/60 p-5">
                <div className="text-2xl font-semibold tracking-tight" style={{ backgroundImage: "var(--gradient-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  {s.k}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className={`${workTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-24 relative">
          <SectionThemeToggle theme={workTheme.t} onToggle={workTheme.toggle} />
          <div className="reveal mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Selected Work</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Things I&apos;ve been building.</h2>
            </div>
            <Code2 className="hidden h-8 w-8 text-muted-foreground md:block" />
          </div>

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
              <ProjectCard key={p.name} p={p} onOpen={() => setOpenProject(p)} />
            ))}
          </div>
        </div>
      </section>

      {/* Affiliations */}
      <section id="affiliations" className={`${workTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-24 relative">
          <div className="reveal mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Affiliations</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Where I&apos;ve studied & built.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              The institutions and labs that have shaped my journey so far.
            </p>
          </div>
          <Affiliations />
        </div>
      </section>


      {/* Timeline */}
      <section id="timeline" className={`${timelineTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-24 relative">
          <SectionThemeToggle theme={timelineTheme.t} onToggle={timelineTheme.toggle} />
          <div className="reveal mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Journey</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A timeline of milestones.</h2>
          </div>
          <Timeline entries={timeline} />
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className={`${skillsTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-24 relative">
          <SectionThemeToggle theme={skillsTheme.t} onToggle={skillsTheme.toggle} />
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
        </div>
      </section>

      {/* About */}
      <section id="about" className={`${aboutTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-24 relative">
          <SectionThemeToggle theme={aboutTheme.t} onToggle={aboutTheme.toggle} />
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
                <p className="text-sm text-muted-foreground">B.Tech, Information Technology · Aug 2023 – 2027</p>
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
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={`${contactTheme.cls} transition-colors duration-500`}>
        <div className="mx-auto max-w-6xl px-6 py-32 relative">
          <SectionThemeToggle theme={contactTheme.t} onToggle={contactTheme.toggle} />
          <div
            className="reveal relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
            <div className="relative grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Contact</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  Let&apos;s build<br />something good.
                </h2>
                <div className="mt-8 flex flex-col gap-3">
                  <ContactLink href="mailto:sahulucky2411@gmail.com" icon={<Mail className="h-4 w-4" />} label="sahulucky2411@gmail.com" />
                  <ContactLink href="tel:+919826557187" icon={<Phone className="h-4 w-4" />} label="+91 98265 57187" />
                  <ContactLink href="https://github.com/LAXMINARAYAN24" icon={<Github className="h-4 w-4" />} label="GitHub" />
                  <ContactLink href="https://linkedin.com/in/LAXMINARAYAN" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
                </div>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Laxminarayan Sahu — Crafted with care</span>
          <Link to="/auth" className="hover:text-foreground transition-colors">Admin</Link>
        </div>
      </footer>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </main>
  );
}

function SectionThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle section theme"
      title="Toggle this section's theme"
      className="absolute right-6 top-6 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
    >
      {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">Section</span>
    </button>
  );
}

function ProjectCard({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
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
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onOpen}
      className="reveal tilt-card group relative overflow-hidden rounded-2xl border border-border bg-card p-7 text-left transition-colors hover:border-primary/40 cursor-pointer"
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
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="relative mt-5 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
      <div className="relative mt-6 flex flex-wrap gap-2">
        {p.stack.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            {s}
          </span>
        ))}
        {p.stack.length > 4 && (
          <span className="rounded-full px-2.5 py-1 text-[11px] text-primary">+{p.stack.length - 4} more</span>
        )}
      </div>
    </button>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-0 border border-border bg-card p-0 shadow-lg rounded-2xl overflow-hidden max-h-[90vh] sm:rounded-2xl"
        >
          {project && (
            <div className="flex flex-col max-h-[90vh]">
              {/* Hero screenshot placeholder */}
              <div className={`relative h-56 w-full bg-gradient-to-br ${project.accent}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.25),transparent_40%)]" />
                <div className="absolute inset-0 flex items-end justify-between p-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/80">{project.tag}</div>
                    <div className="mt-1 text-3xl font-semibold tracking-tight text-white drop-shadow-sm">{project.name}</div>
                    <div className="text-xs text-white/80">{project.period}</div>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-7">
                <p className="text-sm leading-relaxed text-muted-foreground">{project.details}</p>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Tech Stack</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.stack.map((s) => (
                      <span key={s} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {project.links && project.links.length > 0 && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {project.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground"
                        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                      >
                        <ExternalLink className="h-4 w-4" /> {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const years = Array.from(new Set(entries.map((e) => e.year)));
  const [selected, setSelected] = useState<string>("All");
  const visible = selected === "All" ? entries : entries.filter((e) => e.year === selected);

  const kindColor: Record<TimelineEntry["kind"], string> = {
    education: "from-cyan-500 to-sky-500",
    project: "from-fuchsia-500 to-violet-500",
    achievement: "from-amber-500 to-orange-500",
    experience: "from-emerald-500 to-teal-500",
  };

  return (
    <div>
      <div className="reveal mb-8 flex flex-wrap gap-2">
        {(["All", ...years] as const).map((y) => {
          const active = selected === y;
          return (
            <button
              key={y}
              onClick={() => setSelected(y)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "border-transparent text-primary-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
              style={active ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" } : undefined}
            >
              {y}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="timeline-line absolute left-4 top-0 bottom-0 w-px md:left-1/2" />
        <ul className="space-y-8">
          {visible.map((e, idx) => {
            const left = idx % 2 === 0;
            return (
              <li key={`${e.year}-${e.title}`} className="reveal relative">
                <div className={`md:flex ${left ? "md:flex-row" : "md:flex-row-reverse"} items-start gap-6`}>
                  <div className="hidden md:block md:w-1/2" />
                  <div className="relative md:w-1/2">
                    <div className={`absolute left-4 md:left-auto ${left ? "md:-left-3" : "md:-right-3"} top-3 h-6 w-6 rounded-full border-2 border-background bg-gradient-to-br ${kindColor[e.kind]} shadow-lg`} />
                    <div className="ml-12 md:ml-0 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-start gap-3">
                        {e.logo && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 p-1">
                            <img src={e.logo} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{e.year}</span>
                            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                              {e.kind}
                            </span>
                          </div>
                          <p className="mt-2 font-semibold tracking-tight">{e.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{e.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof form;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (error) {
      setStatus("error");
      setServerError("Couldn't send your message. Please try again.");
      return;
    }
    setStatus("success");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-background/40 p-6 backdrop-blur" noValidate>
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Send a message</p>
      <div className="mt-4 space-y-3">
        <div>
          <Input
            placeholder="Your name"
            value={form.name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            className="bg-background/60"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <Input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={!!errors.email}
            className="bg-background/60"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <Textarea
            placeholder="What would you like to build together?"
            value={form.message}
            maxLength={2000}
            rows={5}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            aria-invalid={!!errors.message}
            className="bg-background/60 resize-none"
          />
          {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
        </div>
      </div>

      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Thanks! Your message has been sent.
        </div>
      )}
      {serverError && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
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
