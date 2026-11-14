import * as stylex from "@stylexjs/stylex";
import type { GetStaticPaths, GetStaticProps, PageConfig } from "next";
import Head from "next/head";
import { Page } from "@/components/page";
import { Rule, TextLink } from "@/components/ui";
import { getAllPosts, getPostSummaries, type PostSummary } from "@/lib/articles";
import { renderMdx } from "@/lib/render-mdx";
import { formatDay } from "@/lib/site";
import { blogPosting, postImage } from "@/lib/structured-data";
import prose from "@/styles/prose.module.css";
import { colors, fonts, layout, motion } from "@/styles/tokens.stylex";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

type Props = {
  post: PostSummary;
  html: string;
  older: PostSummary | null;
  newer: PostSummary | null;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getAllPosts().map(post => post.href),
  fallback: false,
});

// Imports used only here (fs, MDX, react-dom/server) never reach the client bundle.
export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  const all = getAllPosts();
  const index = all.findIndex(p => p.slug === params?.slug);
  const raw = all[index];
  if (!raw) return { notFound: true };
  const posts = getPostSummaries(all);
  const html = await renderMdx(raw.content);

  return {
    props: {
      post: posts[index] as PostSummary,
      html,
      newer: posts[index - 1] ?? null,
      older: posts[index + 1] ?? null,
    },
  };
};

/** The lead image's srcset (PostImage marks it fetchPriority="high"), for a preload. */
function leadImage(html: string) {
  const img = html.match(/<img [^>]*fetchPriority="high"[^>]*>/)?.[0];
  const attr = (name: string) => img?.match(new RegExp(` ${name}="([^"]*)"`))?.[1]?.replaceAll("&amp;", "&");
  const srcSet = attr("srcSet");
  return srcSet ? { srcSet, sizes: attr("sizes") } : null;
}

export default function Post({ post, html, older, newer }: Props) {
  const lead = leadImage(html);
  return (
    <Page
      path={post.href}
      title={post.title}
      description={post.summary}
      image={postImage(post)}
      imageAlt={post.title}
      article={{ published: post.date, modified: post.updated, markdown: `${post.href}.md` }}
      jsonLd={blogPosting(post)}
    >
      {lead ? (
        <Head>
          <link rel="preload" as="image" imageSrcSet={lead.srcSet} imageSizes={lead.sizes} fetchPriority="high" />
        </Head>
      ) : null}
      <main id="main" tabIndex={-1} {...stylex.props(styles.main)}>
        <article>
          <header {...stylex.props(styles.header)}>
            <div {...stylex.props(styles.frame)}>
              <Rule />
            </div>
            <div {...stylex.props(styles.topRow)}>
              <TextLink href="/posts" arrow="←" style={styles.back}>
                All writing
              </TextLink>
            </div>
            <h1 {...stylex.props(styles.title)}>
              {post.title}
            </h1>
            <div {...stylex.props(styles.subhead)}>
              <p {...stylex.props(styles.byline)}>
                <time dateTime={post.date}>{formatDay(post.date)}</time>
                {post.updated !== post.date ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Updated <time dateTime={post.updated}>{formatDay(post.updated)}</time>
                    </span>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <span>{`${post.minutes}\u00a0min read`}</span>
              </p>
              {post.summary ? <p {...stylex.props(styles.dek)}>{post.summary}</p> : null}
            </div>
          </header>

          <div {...stylex.props(styles.body)}>
            <div
              className={`${prose.article} ${stylex.props(styles.prose).className ?? ""}`}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: MDX rendered to HTML at build time from our own posts
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {older || newer ? (
            <footer {...stylex.props(styles.footer)}>
              <Rule />
              <h2 {...stylex.props(styles.moreTitle)}>Keep reading</h2>
              <nav aria-label="More writing" {...stylex.props(styles.pager)}>
                {older ? <PagerLink post={older} direction="older" /> : null}
                {newer ? <PagerLink post={newer} direction="newer" divided={Boolean(older)} /> : null}
              </nav>
            </footer>
          ) : null}
        </article>
      </main>
    </Page>
  );
}

type PagerLinkProps = { post: PostSummary; direction: "older" | "newer"; divided?: boolean };

function PagerLink({ post, direction, divided = false }: PagerLinkProps) {
  const isNewer = direction === "newer";
  return (
    <a
      href={post.href}
      {...stylex.props(
        stylex.defaultMarker(),
        styles.pagerLink,
        isNewer && styles.pagerLinkNewer,
        divided && styles.pagerLinkDivided
      )}
    >
      <span {...stylex.props(styles.pagerKind)}>
        {isNewer ? "Newer post" : "Older post"}
        <span aria-hidden="true">{isNewer ? " →" : " ←"}</span>
      </span>
      <span {...stylex.props(styles.pagerTitle)}>{post.title}</span>
      <span {...stylex.props(styles.label, styles.pagerDate)}>
        <time dateTime={post.date}>{formatDay(post.date)}</time> · {`${post.minutes}\u00a0min`}
      </span>
    </a>
  );
}

const WIDE = "@media (min-width: 64rem)";
const MEDIUM = "@media (min-width: 48rem)";

const styles = stylex.create({
  main: {
    width: "100%",
    maxWidth: layout.max,
    marginInline: "auto",
    paddingInline: layout.gutter,
    paddingTop: "4.5rem",
    paddingBottom: "clamp(4rem, 8vw, 6rem)",
    color: colors.fg,
  },
  header: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "repeat(12, minmax(0, 1fr))" },
    columnGap: "clamp(1rem, 2vw, 2rem)",
    paddingBottom: "clamp(2.5rem, 6vw, 4.5rem)",
  },
  frame: { gridColumn: "1 / -1" },
  // The label's text sits where every section label sits: centered 1.75rem under the
  // rule (1.25rem padding, then a 1rem line). Its 44px hit area overhangs that by 14px.
  topRow: {
    gridColumn: "1 / -1",
    display: "flex",
    paddingTop: "0.375rem",
  },
  back: {
    fontSize: "0.9375rem",
  },
  // The cap line sits one page-title gap under the label band, which is where a 32rem
  // page title's cap line falls (its 0.8 line box puts the caps 0.0725em down, ~37px).
  // At a 0.95 line height the caps start 0.1475em into the box (0.1725em at 1, which
  // phones get because their titles wrap to more lines); 0.875rem is the hit area's
  // overhang below the label band.
  title: {
    gridColumn: "1 / -1",
    marginTop: {
      default: "calc(clamp(1.5rem, 4vw, 3rem) - 0.875rem - 0.1725em)",
      [WIDE]: "calc(clamp(1.5rem, 4vw, 3rem) - 0.875rem - 0.1475em)",
    },
    maxWidth: "15em",
    fontSize: "clamp(2.5rem, 6.5vw, 6rem)",
    lineHeight: { default: 1, [WIDE]: 0.95 },
    letterSpacing: "-0.04em",
    fontWeight: 560,
    fontVariationSettings: '"wght" calc(560 + var(--wdk))',
    textWrap: "balance",
    overflowWrap: "break-word",
    color: colors.fg,
  },
  // Date and reading time under the title on the left, the dek beside them, both on
  // the grid the article body uses.
  subhead: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "repeat(12, minmax(0, 1fr))" },
    columnGap: "clamp(1rem, 2vw, 2rem)",
    rowGap: "1rem",
    alignItems: "baseline",
    marginTop: "clamp(1.5rem, 3vw, 2.5rem)",
  },
  byline: {
    gridColumn: { default: "1 / -1", [WIDE]: "1 / span 4" },
    display: "flex",
    gap: "0.6rem",
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.02em",
    fontVariantNumeric: "tabular-nums",
    color: colors.fg,
  },
  dek: {
    gridColumn: { default: "1 / -1", [WIDE]: "5 / -1" },
    maxWidth: "40ch",
    fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)",
    lineHeight: 1.45,
    letterSpacing: "-0.012em",
    fontVariationSettings: '"wght" calc(400 + var(--wdk))',
    textWrap: "pretty",
    color: colors.dim,
  },
  body: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "repeat(12, minmax(0, 1fr))" },
    columnGap: "clamp(1rem, 2vw, 2rem)",
    rowGap: "2.5rem",
    // The sheet's top edge: the title and dek slide under this hairline as you read.
    paddingTop: { default: "2rem", [WIDE]: "clamp(2rem, 5vw, 4rem)" },
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.line,
  },
  prose: {
    gridColumn: { default: "1 / -1", [WIDE]: "5 / -1" },
  },
  // Under its rule, like every section label on the site.
  moreTitle: {
    paddingTop: "1rem",
    fontSize: "1rem",
    fontVariationSettings: '"wght" 520',
  },
  pagerKind: {
    fontSize: "0.9375rem",
    color: colors.dim,
  },
  footer: {
    marginTop: "clamp(5rem, 10vw, 8rem)",
  },
  pager: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [MEDIUM]: "repeat(2, minmax(0, 1fr))" },
  },
  pagerLink: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.875rem",
    paddingBlock: "2rem 2.25rem",
  },
  pagerLinkNewer: {
    gridColumn: { default: "auto", [MEDIUM]: "2" },
    alignItems: { default: "flex-start", [MEDIUM]: "flex-end" },
    textAlign: { default: "start", [MEDIUM]: "end" },
  },
  // Stacked on phones, a hairline between the two; side by side, the gutter is enough.
  pagerLinkDivided: {
    borderTopWidth: { default: "1px", [MEDIUM]: "0" },
    borderTopStyle: "solid",
    borderTopColor: colors.line,
  },
  pagerTitle: {
    maxWidth: "24ch",
    fontSize: "clamp(1.25rem, 1rem + 1vw, 1.75rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    fontWeight: 520,
    fontVariationSettings: '"wght" calc(520 + var(--wdk))',
    textWrap: "balance",
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.16em",
    textDecorationColor: {
      default: colors.lineStrong,
      [stylex.when.ancestor(":hover")]: colors.fg,
      [stylex.when.ancestor(":focus-visible")]: colors.fg,
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: "200ms",
    transitionTimingFunction: motion.out,
  },
  pagerDate: {
    color: colors.dim,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    lineHeight: 1,
    letterSpacing: "0.01em",
    fontVariantNumeric: "tabular-nums",
    color: colors.dim,
  },
});
