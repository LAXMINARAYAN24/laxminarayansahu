import nitkLogo from "@/assets/logo-nitk.png";
import iitjLogo from "@/assets/logo-iitj.png";
import spritLogo from "@/assets/logo-sprit.png";

export type Affiliation = {
  name: string;
  role: string;
  period: string;
  logo: string;
  href?: string;
};

export const affiliations: Affiliation[] = [
  {
    name: "NIT Karnataka",
    role: "B.Tech, Information Technology",
    period: "Aug 2023 – 2027",
    logo: nitkLogo,
    href: "https://www.nitk.ac.in/",
  },
  {
    name: "IIT Jodhpur",
    role: "Research Intern",
    period: "Summer 2026",
    logo: iitjLogo,
    href: "https://www.iitj.ac.in/",
  },
  {
    name: "Sprit Lab",
    role: "ML Intern",
    period: "2025",
    logo: spritLogo,
  },
];

export function Affiliations() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {affiliations.map((a) => {
        const Card = (
          <div
            className="reveal group relative flex h-full flex-col items-center rounded-2xl border border-border bg-card p-7 text-center transition-all hover:-translate-y-1 hover:border-primary/40"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex h-24 w-full items-center justify-center">
              <img
                src={a.logo}
                alt={`${a.name} logo`}
                loading="lazy"
                width={1024}
                height={1024}
                className="max-h-20 w-auto object-contain grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </div>
            <p className="mt-5 text-base font-semibold tracking-tight">{a.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">{a.period}</p>
          </div>
        );
        return a.href ? (
          <a key={a.name} href={a.href} target="_blank" rel="noreferrer" className="block">
            {Card}
          </a>
        ) : (
          <div key={a.name}>{Card}</div>
        );
      })}
    </div>
  );
}
