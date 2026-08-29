import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { Title } from "@/app/components/title";
import { colors } from "@/app/tokens.stylex";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/contact",
  },
  title: "Contact",
  description: "Contact Ali Alshehri — Software Engineer. Email and social profiles (GitHub, LinkedIn, X).",
  openGraph: {
    url: "https://ali-sh.com/contact",
    title: "Contact",
    description: "Contact Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia.",
  },
};

const contact: {
  method: string;
  link: string;
  label: string;
}[] = [
  {
    method: "Email",
    link: "mailto:ali0alshehri@outlook.com",
    label: "Ali0Alshehri@outlook.com",
  },
  {
    method: "X",
    link: "https://x.com/alicantcode",
    label: "@alicantcode",
  },
  {
    method: "GitHub",
    link: "https://github.com/AlshehriAli0",
    label: "git/AlshehriAli0",
  },
  {
    method: "LinkedIn",
    link: "https://www.linkedin.com/in/ali-alshehri-340b26284",
    label: "in/ali-alshehri",
  },
];

export const dynamic = "force-static";

export default async function InfoPage() {
  return (
    <main {...stylex.props(styles.main)}>
      <PageHeader title="Contact" />
      <section {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.intro)}>
          If you&apos;d like to get in touch, you can reach me using the following methods.
        </p>

        <div {...stylex.props(styles.grid)}>
          {contact.map(contactMethod => {
            return (
              <div {...stylex.props(styles.cell)} key={contactMethod.method}>
                <Title as="h2" variant="tertiary">
                  {contactMethod.method}
                </Title>
                <Link href={contactMethod.link} {...stylex.props(styles.contactLink)}>
                  {contactMethod.label}
                </Link>
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
  section: {
    paddingBottom: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(1, minmax(0, 1fr))",
      "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
    },
    gap: "1rem",
  },
  cell: {
    display: "flex",
    flexDirection: "column",
  },
  intro: {
    marginBottom: "1.5rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    color: colors.bodyInherited,
  },
  contactLink: {
    color: colors.body,
  },
});
