import { palette } from "@/styles/palette";

export const site = {
  name: "Ali Alshehri",
  url: "https://ali-sh.com",
  email: "ali0alshehri@outlook.com",
  handle: "@alicantcode",
  role: "Software Engineer",
  locale: "en_US",
  /** The meta description and the one-paragraph "who is Ali" answer: facts only, from the pages below. */
  description:
    "Ali Alshehri is a software engineer at Sarj AI who cares about performance and the small details. He contributes to open source, including react-native-screens and react-native-healthkit, and writes about what he builds.",
} as const;

/** Every absolute URL on the site: no trailing slash except the root itself. */
export const absoluteUrl = (path: string) => (path === "/" ? `${site.url}/` : `${site.url}${path}`);

/** Copy shared by the pages, JSON-LD and the agent-readable files (llms.txt), so they can't drift. */
export const copy = {
  homeLede:
    "Software engineer who cares about performance and the small details. I write about what I build and the problems I get stuck\u00a0on.",
  about:
    "I’ve built web and mobile products end to end. Outside of work, I contribute to open source, build my own packages, and sometimes experiment with random stuff just to see how it works.",
  infoLede: "I’ve built web and mobile products end to end, from the first version through to scaling them.",
  writingLede: "Where I write about what I build, what I learn and whatever else is on my mind.",
} as const;

/** Open-source libraries named on /info; the download counts are the ones shown there. */
export const openSource = [
  {
    name: "react-native-screens",
    url: "https://github.com/software-mansion/react-native-screens",
    downloads: "14M+ weekly downloads",
  },
  {
    name: "react-native-healthkit",
    url: "https://github.com/kingstinct/react-native-healthkit",
    downloads: "560K+ weekly downloads",
  },
] as const;

/** Page background per theme, for the theme-color meta tags, the theme script and the manifest. */
export const themeBg = palette.bg;

export const socials = [
  { label: "Email", value: "ali0alshehri@outlook.com", href: "mailto:ali0alshehri@outlook.com" },
  { label: "GitHub", value: "AlshehriAli0", href: "https://github.com/AlshehriAli0" },
  { label: "X", value: "@alicantcode", href: "https://x.com/alicantcode" },
  { label: "LinkedIn", value: "in/ali-alshehri", href: "https://www.linkedin.com/in/ali-alshehri-340b26284" },
] as const;

export const nav = [
  { href: "/info", label: "Info" },
  { href: "/posts", label: "Writing" },
  { href: "/contact", label: "Contact" },
] as const;

type Role = { company: string; role: string; start: string; end: string | null };

/** Newest first. Consecutive roles at the same company render as one group. */
export const experience: Role[] = [
  { company: "Sarj AI", role: "Software Engineer", start: "2026-11-01", end: null },
  { company: "Netzero", role: "Software Engineer II", start: "2026-06-01", end: "2026-11-01" },
  { company: "Netzero", role: "Software Engineer", start: "2024-07-01", end: "2026-06-01" },
  { company: "Wavez", role: "Full-Stack Developer", start: "2024-05-01", end: null },
];

/**
 * Official marks. Icons are each company's own site icon, saved at 96px (2x the largest
 * tile). A wordmark is a one-colour SVG drawn in the text colour, as the company's own
 * site header does, so it works on either theme.
 */
export type Logo = { src: string; kind: "icon" | "wordmark"; url: string };

export const logos: Record<string, Logo> = {
  "Sarj AI": { src: "/logos/sarj-ai.svg", kind: "wordmark", url: "https://sarj.ai" },
  Wavez: { src: "/logos/wavez.webp", kind: "icon", url: "https://wavez.sa" },
  Netzero: { src: "/logos/netzero.webp", kind: "icon", url: "https://netzero.sa" },
};

export type CompanyGroup = { company: string; start: string; end: string | null; roles: Role[] };

/** Folds consecutive roles at one company into a group spanning their whole tenure. */
export function groupByCompany(roles: Role[]): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  for (const r of roles) {
    const last = groups.at(-1);
    if (last?.company !== r.company) {
      groups.push({ company: r.company, start: r.start, end: r.end, roles: [r] });
      continue;
    }
    last.roles.push(r);
    if (r.start < last.start) last.start = r.start;
    if (last.end !== null && (r.end === null || r.end > last.end)) last.end = r.end;
  }
  return groups;
}

// Dates are ISO days (parsed as UTC midnight), so format in UTC or they shift a day west of GMT.
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatMonth = (iso: string) => monthYear.format(new Date(iso));
export const formatDay = (iso: string) => dayMonthYear.format(new Date(iso));

/** "2024-10": the machine-readable month for a `<time dateTime>`. */
export const isoMonth = (iso: string) => iso.slice(0, 7);

export function duration(start: string, end: string | null) {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date();
  const months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  // Count both the first and last month (Jul 2024 – Nov 2026 is 2 yr 5 mo), the way
  // LinkedIn does, so a role that started this month reads as 1 mo.
  const total = months + 1;
  const y = Math.floor(total / 12);
  const m = total % 12;
  // No-break spaces keep each number with its unit.
  if (y === 0) return `${m}\u00a0mo`;
  return m === 0 ? `${y}\u00a0yr` : `${y}\u00a0yr ${m}\u00a0mo`;
}

export const pad = (n: number) => String(n).padStart(2, "0");
