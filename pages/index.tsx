import * as stylex from "@stylexjs/stylex";
import type { GetStaticProps, PageConfig } from "next";
import { Page } from "@/components/page";
import { Container, Rows, Rule, Section, TextLink } from "@/components/ui";
import { getPostSummaries, type PostSummary } from "@/lib/articles";
import { copy, formatDay, site } from "@/lib/site";
import { webPage } from "@/lib/structured-data";
import { colors, motion } from "@/styles/tokens.stylex";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

type Props = { posts: PostSummary[] };

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: getPostSummaries() },
});

// One line, sized by ink: at weight 300 and -0.058em tracking the ink of "Ali Alshehri"
// runs from 0.007em to 4.189em, so 4.182em fills the column edge to edge (the margin
// below cancels the 0.007em). 100cqw is the hero's own width, so a classic scrollbar
// can't push the ink past the edge. One line keeps the name big without taking the
// first screen: at 1440×900 it's about a quarter of the height.
const NAME_SIZE = "calc(100cqw / 4.182)";

export default function Home({ posts }: Props) {
  return (
    <Page path="/" sayHello jsonLd={[webPage("/", `${site.name} — ${site.role}`, site.description)]}>
      <main id="main" tabIndex={-1}>
        <Container>
          <section {...stylex.props(styles.hero)} aria-label="Intro">
            <Rule />
            <h1 {...stylex.props(styles.name)} aria-label="Ali Alshehri">
              <span aria-hidden="true" {...stylex.props(styles.clip)}>
                <span data-slide="" {...stylex.props(styles.slide)}>
                  Ali Alshehri
                </span>
              </span>
            </h1>

            <div {...stylex.props(styles.intro)}>
              <div {...stylex.props(styles.who)}>
                <p {...stylex.props(styles.lede)}>{copy.homeLede}</p>
              </div>

              <section aria-labelledby="latest-label" {...stylex.props(styles.latest)}>
                <div {...stylex.props(styles.latestHead)}>
                  <h2 id="latest-label" {...stylex.props(styles.latestTitle)}>
                    Latest writing
                  </h2>
                  <TextLink href="/posts" style={styles.small}>
                    All posts
                  </TextLink>
                </div>
                <Rows
                  rows={posts.map(p => ({
                    key: p.slug,
                    title: p.title,
                    meta: `${formatDay(p.date)} · ${p.minutes}\u00a0min`,
                    href: p.href,
                  }))}
                />
              </section>
            </div>
          </section>

          <Section id="about" label="About">
            <p {...stylex.props(styles.statement)}>
              <span {...stylex.props(styles.statementLead)}>{aboutLead}</span>
              {aboutRest}
            </p>
            <TextLink href="/info" style={styles.more}>
              More about me
            </TextLink>
          </Section>

        </Container>
      </main>
    </Page>
  );
}

const slideUp = stylex.keyframes({
  from: { transform: "translateY(102%)" },
  to: { transform: "none" },
});

// The name gains weight as it scrolls away. CSS scroll timeline, zero JS.
const thicken = stylex.keyframes({
  from: { fontVariationSettings: '"wght" calc(300 + var(--wdk))', letterSpacing: "-0.058em" },
  // Tighter tracking holds the heavier ink to the same 4.182em, so it never crosses the
  // edge. Without it the ink grows 7.8% at 760 (measured), well past the column.
  to: { fontVariationSettings: '"wght" calc(760 + var(--wdk))', letterSpacing: "-0.0877em" },
});

const scrollDriven = "@supports (animation-timeline: scroll())";
const WIDE = "@media (min-width: 1024px)";

// The statement's first sentence leads in the text colour; the rest follows in dim.
const [aboutLead, aboutRest] = (() => {
  const end = copy.about.indexOf(". ") + 1;
  return [copy.about.slice(0, end), copy.about.slice(end)];
})();

const styles = stylex.create({
  hero: {
    containerType: "inline-size",
    paddingTop: "4.5rem",
    paddingBottom: "clamp(4rem, 9vw, 7rem)",
  },
  name: {
    paddingTop: "clamp(1.25rem, 2.5vw, 2.25rem)",
    fontSize: NAME_SIZE,
    // "Ali Alshehri" has no descenders, so the line can sit this close.
    lineHeight: 0.74,
    letterSpacing: "-0.058em",
    marginLeft: "-0.007em",
    fontVariationSettings: '"wght" calc(300 + var(--wdk))',
    whiteSpace: "nowrap",
    animationName: {
      default: null,
      [scrollDriven]: { default: null, "@media (prefers-reduced-motion: no-preference)": thicken },
    },
    animationTimingFunction: "linear",
    animationFillMode: "both",
    animationTimeline: "scroll(root)",
    animationRange: "0 28svh",
  },
  clip: {
    display: "block",
    overflow: "clip",
    // The baseline sits just under a 0.74 line box; this keeps the "s" overshoot.
    paddingBottom: "0.04em",
  },
  slide: {
    display: "block",
    animationName: slideUp,
    animationDuration: "650ms",
    animationTimingFunction: motion.out,
    animationFillMode: "both",
  },
  // Who on the left, what's here on the right; stacked on phones and tablets.
  intro: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "minmax(0, 5fr) minmax(0, 7fr)" },
    columnGap: "clamp(2rem, 5vw, 6rem)",
    rowGap: "2.5rem",
    marginTop: "clamp(1.75rem, 3.5vw, 3rem)",
  },
  who: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "clamp(1.25rem, 2.5vw, 2rem)",
  },
  lede: {
    maxWidth: "30ch",
    fontSize: "clamp(1.1875rem, 1.75vw, 1.625rem)",
    // Narrow columns wrap more, so phones get a little more leading.
    lineHeight: { default: 1.4, [WIDE]: 1.32 },
    letterSpacing: "-0.018em",
    fontVariationSettings: '"wght" calc(400 + var(--wdk))',
    textWrap: "pretty",
    color: colors.fg,
  },
  latest: {
    minWidth: 0,
  },
  latestHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginTop: { default: 0, [WIDE]: "-0.6rem" },
  },
  latestTitle: {
    fontSize: "1rem",
    fontVariationSettings: '"wght" 520',
  },
  small: {
    fontSize: "0.9375rem",
  },
  // A lead paragraph, not display type: two sentences read at about 45 characters a
  // line (38ch), 22px on phones up to 32px at 1440, with leading loose enough for five
  // lines and the slight negative tracking text this size wants.
  statement: {
    maxWidth: "38ch",
    color: colors.dim,
    fontSize: "clamp(1.375rem, 1rem + 1.1vw, 2rem)",
    lineHeight: { default: 1.4, [WIDE]: 1.34 },
    letterSpacing: "-0.015em",
    fontVariationSettings: '"wght" calc(420 + var(--wdk))',
    textWrap: "pretty",
  },
  statementLead: {
    color: colors.fg,
  },
  more: {
    marginTop: "clamp(1.5rem, 3vw, 2.5rem)",
    fontSize: "1.0625rem",
  },
});
