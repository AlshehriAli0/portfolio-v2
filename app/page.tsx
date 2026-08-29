import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { Title } from "@/app/components/title";
import { colors } from "@/app/tokens.stylex";
import { getAllPosts } from "@/lib/articles";
import { ArticleLink } from "./components/article-link";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/",
  },
  description:
    "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with Next.js, React & TypeScript.",
  openGraph: {
    url: "https://ali-sh.com/",
    title: "Ali Alshehri — Software Engineer",
    description:
      "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with Next.js, React & TypeScript.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Alshehri — Software Engineer",
    description:
      "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with React & TypeScript.",
  },
};

export const dynamic = "force-static";

export default async function Home() {
  const posts = await getAllPosts({
    includeDrafts: process.env.NODE_ENV === "development",
  });

  return (
    <main {...stylex.props(styles.main)}>
      <section {...stylex.props(styles.hero)}>
        <h1 {...stylex.props(styles.heroTitle)}>
          {"HI, I'm Ali Alshehri."}
          <span {...stylex.props(styles.heroSubtitle)}>A software engineer based in khobar.</span>
        </h1>
        <p {...stylex.props(styles.heroBody)}>
          I love building software that feels good to use, the kind people actually want to come back to.
        </p>
        <Link href="/info" {...stylex.props(stylex.defaultMarker(), styles.cta)} prefetch={true}>
          More Information <span {...stylex.props(styles.arrow, styles.arrowShort)}>→</span>
        </Link>
      </section>

      <section {...stylex.props(styles.writing)}>
        <Title as="h2" variant="secondary" style={styles.writingTitle}>
          Recent Writing
        </Title>
        <div>
          {posts.slice(0, 2).map(post => {
            return (
              <ArticleLink
                key={post?.meta.title}
                href={post.href}
                title={post.meta.title}
                date={post?.date}
                summary={post.meta.summary}
              />
            );
          })}
        </div>
        <Link href="/posts" {...stylex.props(stylex.defaultMarker(), styles.cta)} prefetch={true}>
          View More Posts <span {...stylex.props(styles.arrow, styles.arrowLong)}>→</span>
        </Link>
      </section>

      <section {...stylex.props(styles.outro)}>
        <p {...stylex.props(styles.outroBody)}>
          You can find my personal projects on my{" "}
          <Link href="https://github.com/AlshehriAli0" {...stylex.props(styles.inlineLink)} prefetch={false}>
            GitHub
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

const styles = stylex.create({
  main: {
    paddingLeft: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
    paddingRight: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
  },
  hero: {
    paddingBottom: "3.5rem",
    marginBottom: "3.5rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.borderStrong,
  },
  heroTitle: {
    marginBottom: "1rem",
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
    fontVariationSettings: '"wght" 600',
    color: colors.heading,
  },
  heroSubtitle: {
    display: "block",
    paddingTop: "0.25rem",
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontVariationSettings: '"wght" 400',
    color: colors.muted,
  },
  heroBody: {
    fontSize: { default: "1.125rem", "@media (min-width: 768px)": "1.25rem" },
    lineHeight: { default: 1.5, "@media (min-width: 768px)": "1.75rem" },
    color: colors.body,
  },
  cta: {
    marginTop: "2rem",
    display: "inline-block",
    borderRadius: "9999px",
    paddingLeft: "2rem",
    paddingRight: "2rem",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    fontFamily: "var(--font-monospace)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontVariationSettings: '"wght" 600',
    color: colors.ctaText,
    backgroundColor: { default: colors.ctaBg, ":hover": colors.ctaBgHover },
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  arrow: {
    display: "inline-block",
    transitionProperty: "transform",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  arrowShort: {
    transform: {
      default: null,
      [stylex.when.ancestor(":hover")]: "translate(0.375rem, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1)",
    },
  },
  arrowLong: {
    transform: {
      default: null,
      [stylex.when.ancestor(":hover")]: "translate(0.5rem, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1)",
    },
  },
  writing: {
    paddingTop: "2.5rem",
    paddingBottom: "4rem",
  },
  writingTitle: {
    marginBottom: "2rem",
  },
  outro: {
    paddingBottom: "4rem",
  },
  outroBody: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    color: colors.body,
  },
  inlineLink: {
    textDecorationLine: "underline",
  },
});
