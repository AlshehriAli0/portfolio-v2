import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { Title } from "@/app/components/title";
import { colors } from "@/app/tokens.stylex";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/info",
  },
  title: "Information",
  description:
    "Information about Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. Experience, background, and contact details.",
  openGraph: {
    url: "https://ali-sh.com/info",
    title: "Information",
    description: "Information about Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia.",
  },
};

const experience: {
  company: string;
  role: string;
  start: Date;
  end: Date | null;
  logo: string;
}[] = [
  {
    company: "Netzero",
    role: "Software Engineer",
    start: new Date("2024-10-01"),
    end: null,
    logo: "/netzero.png",
  },
  {
    company: "Netzero",
    role: "Software Engineering Intern",
    start: new Date("2024-07-01"),
    end: new Date("2024-10-01"),
    logo: "/netzero.png",
  },
  {
    company: "Wavez",
    role: "Full-Stack Developer",
    start: new Date("2024-05-01"),
    end: null,
    logo: "/wavez.png",
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function calcDuration(start: Date, end: Date | null) {
  const to = end ?? new Date();
  const months = (to.getFullYear() - start.getFullYear()) * 12 + (to.getMonth() - start.getMonth()) + 1;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}

export const dynamic = "force-static";

export default async function InfoPage() {
  return (
    <main {...stylex.props(styles.main)}>
      <PageHeader title="Information" />
      <section {...stylex.props(styles.bio)}>
        <p {...stylex.props(styles.bioP)}>Hey, I&apos;m Ali, a software engineer.</p>
        <p {...stylex.props(styles.bioP)}>
          I&apos;ve worked across a lot of different projects over the years, web, mobile, and backend, building and
          scaling them through real challenges. That experience has shaped a lot of how I think about software.
        </p>
        <p {...stylex.props(styles.bioP)}>
          These days I&apos;m mostly in the mobile world. I enjoy building native-feeling experiences on React Native
          and I&apos;ve been spending a good amount of time creating my own packages and contributing to libraries I use
          daily, including some major ones like react-native-screens.
        </p>
        <p {...stylex.props(styles.bioP)}>
          I&apos;m genuinely excited about AI and where it&apos;s going. But I care just as much about the craft.
          Leveraging the best tools available is great, but quality and maintainability are things I won&apos;t trade
          away.
        </p>

        <p {...stylex.props(styles.bioP)}>
          If you&apos;re interested in working together, feel free to reach out to me here:{" "}
          <Link href="mailto:ali0alshehri@outlook.com" {...stylex.props(styles.bioLink)}>Ali0Alshehri@outlook.com</Link>.
        </p>
      </section>

      <section>
        <Title as="h2" variant="secondary" style={styles.experienceTitle}>
          Experience
        </Title>

        <div>
          {experience.map(exp => {
            return (
              <div {...stylex.props(styles.row)} key={`${exp.company}-${exp.role}`}>
                <Image
                  width={56}
                  height={56}
                  src={exp.logo}
                  alt={`${exp.company} logo`}
                  {...stylex.props(styles.logo)}
                />
                <div {...stylex.props(styles.details)}>
                  <span {...stylex.props(styles.company)}>{exp.company}</span>
                  <span {...stylex.props(styles.role)}>{exp.role}</span>
                  <span {...stylex.props(styles.dates)}>
                    {formatDate(exp.start)} → {exp.end ? formatDate(exp.end) : "Present"}
                    <span {...stylex.props(styles.duration)}>
                      · {calcDuration(exp.start, exp.end)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}


const styles = stylex.create({
  main: {
    paddingLeft: {
      default: "1.5rem",
      "@media (min-width: 768px)": "0px",
    },
    paddingRight: {
      default: "1.5rem",
      "@media (min-width: 768px)": "0px",
    },
  },
  row: {
    display: "flex",
    gap: "1rem",
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    // ponytail: was divide-y on the parent; the divider rides on the child instead
    borderTopWidth: { default: "1px", ":first-child": "0px" },
    borderTopStyle: "solid",
    borderTopColor: colors.border,
  },
  details: {
    gridColumn: "span 9 / span 9",
    display: "flex",
    flexDirection: "column",
  },
  // Was `prose prose-lg dark:prose-invert`. Only the paragraphs below are inside it,
  // so the typography plugin's descendant rules are written out directly here.
  bio: {
    paddingBottom: "2rem",
    maxWidth: "65ch",
    fontSize: "1.125rem",
    lineHeight: 1.7777778,
    color: colors.prose,
  },
  bioP: {
    marginTop: { default: "1.3333333em", ":first-child": "0px" },
    marginBottom: { default: "1.3333333em", ":last-child": "0px" },
  },
  bioLink: {
    color: colors.proseLink,
    textDecorationLine: "underline",
    fontVariationSettings: '"wght" 500',
  },
  experienceTitle: {
    marginTop: "2rem",
    marginBottom: "1rem",
  },
  logo: {
    height: "3.5rem",
    width: "3.5rem",
    borderRadius: "0.75rem",
  },
  company: {
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    fontVariationSettings: '"wght" 600',
    color: colors.strong,
  },
  role: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    color: colors.body,
  },
  dates: {
    gridColumn: "span 2 / span 2",
    marginTop: "1rem",
    display: "block",
    fontFamily: "var(--font-monospace)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontVariationSettings: '"wght" 500',
    letterSpacing: "-0.05em",
    color: colors.muted,
  },
  duration: {
    marginLeft: "0.5rem",
    color: colors.faint,
  },
});
