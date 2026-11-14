import * as stylex from "@stylexjs/stylex";
import type { CSSProperties, ReactNode } from "react";
import { colors, fonts, layout, motion } from "@/styles/tokens.stylex";

const slideUp = stylex.keyframes({
  from: { transform: "translateY(105%)" },
  to: { transform: "none" },
});

export function Container({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.container)}>{children}</div>;
}

/** A plain-English label: small sans, sentence case. Mono is kept for data (dates, handles). */
export function Label({ children, style }: { children: ReactNode; style?: stylex.StyleXStyles }) {
  return <span {...stylex.props(styles.label, style)}>{children}</span>;
}

/** Sets `text` with `phrase` kept on one line (hyphenated names shouldn't break at a hyphen). */
export function KeepTogether({ text, phrase }: { text: string; phrase: string }) {
  const [before, ...rest] = text.split(phrase);
  if (rest.length === 0) return text;
  return (
    <>
      {before}
      <span {...stylex.props(styles.nowrap)}>{phrase}</span>
      {rest.join(phrase)}
    </>
  );
}

/** The "+" registration mark that sits where two hairlines meet. */
export function Cross({ side }: { side: "left" | "right" }) {
  return <span aria-hidden="true" {...stylex.props(styles.cross, side === "left" ? styles.crossL : styles.crossR)} />;
}

/** A full-width hairline with a registration cross at each end. */
export function Rule() {
  return (
    <div aria-hidden="true" {...stylex.props(styles.rule)}>
      <Cross side="left" />
      <Cross side="right" />
    </div>
  );
}

/** A section on a hairline, headed by its name and an optional link on the right. */
export function Section({
  label,
  aside,
  id,
  tight = false,
  children,
}: {
  label: string;
  aside?: ReactNode;
  id?: string;
  /** For a hairline list: it starts just under the label instead of a full step down. */
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-label` : undefined} {...stylex.props(styles.section)}>
      <Rule />
      <header {...stylex.props(styles.sectionHead, tight && styles.sectionHeadTight)}>
        <h2 id={id ? `${id}-label` : undefined} {...stylex.props(styles.label, styles.heading)}>
          {label}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

/** A text link that reads as one at rest: underlined, with an optional arrow that nudges on hover. */
export function TextLink({
  href,
  children,
  arrow = "→",
  style,
}: {
  href: string;
  children: ReactNode;
  arrow?: "→" | "↗" | "←" | null;
  style?: stylex.StyleXStyles;
}) {
  const external = href.startsWith("http");
  const back = arrow === "←";
  const mark = arrow ? (
    <span
      aria-hidden="true"
      {...stylex.props(
        styles.textLinkArrow,
        back && styles.textLinkArrowBack,
        arrow === "↗" && styles.textLinkArrowOut
      )}
    >
      {arrow}
    </span>
  ) : null;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      {...stylex.props(stylex.defaultMarker(), styles.textLink, style)}
    >
      {back ? mark : null}
      <span {...stylex.props(styles.textLinkText)}>{children}</span>
      {back ? null : mark}
      {external ? <span className="sr-only"> (opens in new tab)</span> : null}
    </a>
  );
}

/**
 * Page title: the frame rule, then one word set large. `em` is the width of the word's
 * ink in ems, so on narrow screens the size is solved for the column and the last glyph
 * lands on its edge. It's capped so the page's content always starts on the first screen.
 *
 * Every page shares one geometry: the title's cap top sits a fixed step under the rule, the
 * `lede` (and any `side` content after it) starts with its cap height on that same line, and
 * the rule below comes a fixed step after whichever ends lower. Side by side on wide screens,
 * stacked below otherwise, a fixed step under the title.
 */
export function PageTitle({
  title,
  em,
  lsb,
  lede,
  side,
}: {
  title: string;
  em: number;
  /** left side bearing of the first glyph, in em, so its stem sits on the grid line */
  lsb: number;
  /** the first line of the field beside the title */
  lede?: ReactNode;
  /** anything that follows the lede */
  side?: ReactNode;
}) {
  // cqw is the header's own width, so a classic scrollbar can't push the word past the edge.
  const size = `min(calc(100cqw / ${em}), 15rem)`;
  return (
    <header {...stylex.props(styles.pageHead)}>
      <Rule />
      <div {...stylex.props(styles.titleRow)} style={{ "--title": size } as CSSProperties}>
        <h1 {...stylex.props(styles.pageTitle, styles.fit(lsb))}>
          <span {...stylex.props(styles.clip)}>
            <span data-slide="" {...stylex.props(styles.slide)}>
              {title}
            </span>
          </span>
        </h1>
        {lede ? (
          <div {...stylex.props(styles.side)}>
            <p {...stylex.props(styles.lede, side ? styles.ledeMore : null)}>{lede}</p>
            {side}
          </div>
        ) : null}
      </div>
    </header>
  );
}

type RowData = {
  key: string;
  title: string;
  detail?: string;
  /** A line of description under the title (post summaries). */
  summary?: string;
  meta?: string;
  href?: string;
  /** view-transition-name to share with the destination's title (set by the client script on navigation) */
  morph?: string;
};

/**
 * Hairline list. Rows that go somewhere carry a full-strength arrow at rest, so they read
 * as links on touch too; rows that don't have none. Hovering one row dims
 * its siblings (see `.rows` in globals.css) and nudges its arrow. Pure CSS.
 */
/** `ruled={false}` drops the top hairline when a crosshair Rule already sits above the list. */
export function Rows({
  rows,
  size = "md",
  ruled = true,
}: {
  rows: RowData[];
  size?: "md" | "lg";
  ruled?: boolean;
}) {
  return (
    <ul {...withClass("rows", ruled && styles.rows)}>
      {rows.map(row => {
        const external = row.href?.startsWith("http");
        const inner = (
          <>
            <span {...stylex.props(styles.rowMain)}>
              <span
                data-morph={row.morph}
                {...stylex.props(
                  styles.rowTitle,
                  size === "lg" && styles.rowTitleLg,
                  row.href ? styles.rowTitleLink : null
                )}
              >
                {row.title}
              </span>
              {row.detail ? <span {...stylex.props(styles.rowDetail)}>{row.detail}</span> : null}
            </span>
            {row.summary ? <span {...stylex.props(styles.rowSummary)}>{row.summary}</span> : null}
            {row.meta ? (
              <span
                {...stylex.props(styles.rowMeta, size === "lg" && styles.rowMetaLg, !row.href && styles.rowMetaWide)}
              >
                {row.meta}
              </span>
            ) : null}
            {row.href ? (
              <span
                aria-hidden="true"
                {...stylex.props(
                  styles.rowArrow,
                  size === "lg" && styles.rowArrowLg,
                  external && styles.rowArrowExternal
                )}
              >
                <ArrowIcon />
              </span>
            ) : null}
          </>
        );
        return (
          <li key={row.key} {...withClass("row", styles.rowItem)}>
            {row.href ? (
              <a
                href={row.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                {...stylex.props(stylex.defaultMarker(), styles.row, styles.rowLink)}
              >
                {inner}
                {external ? <span className="sr-only"> (opens in new tab)</span> : null}
              </a>
            ) : (
              <div {...stylex.props(styles.row)}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A drawn arrow, sized by font-size: the text faces' arrows are too small to read as a control. */
export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor">
      <path d="M3 12h17M14 6l6 6-6 6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** stylex.props plus a plain class name (for the `.rows`/`.row` rule in globals.css). */
function withClass(name: string, style: stylex.StyleXStyles) {
  const props = stylex.props(style);
  return { ...props, className: `${name} ${props.className ?? ""}` };
}

// Hover effects only where hover is real: a tap on touch would leave them stuck on.
const hover = "@media (hover: hover) and (pointer: fine)";
// Arrows leave faster than they arrive, so a quick pass over a list never lags.
const arrowEnter = "220ms";
const arrowExit = "160ms";
const wide = "@media (min-width: 1024px)";

// Press feedback for links: dims instantly on press, eases back over 200ms on release.
const press = {
  opacity: { default: null, ":active": 0.6 },
  transitionProperty: "opacity",
  transitionDuration: { default: "200ms", ":active": "0ms" },
} as const;

const styles = stylex.create({
  container: {
    width: "100%",
    maxWidth: layout.max,
    marginInline: "auto",
    paddingInline: layout.gutter,
  },
  label: {
    fontSize: "0.875rem",
    lineHeight: 1.4,
    letterSpacing: "-0.005em",
    fontVariationSettings: '"wght" 450',
  },
  heading: {
    fontSize: "1rem",
    fontVariationSettings: '"wght" 520',
    color: colors.fg,
  },
  nowrap: { whiteSpace: "nowrap" },
  cross: {
    position: "absolute",
    top: "-5px",
    width: "9px",
    height: "9px",
    pointerEvents: "none",
    backgroundImage: `linear-gradient(${colors.lineStrong}, ${colors.lineStrong}), linear-gradient(${colors.lineStrong}, ${colors.lineStrong})`,
    backgroundSize: "1px 100%, 100% 1px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  crossL: { left: "-5px" },
  crossR: { right: "-5px" },
  rule: {
    position: "relative",
    height: "1px",
    backgroundColor: colors.line,
  },
  section: {
    paddingBottom: "clamp(4.5rem, 10vw, 8.5rem)",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    minHeight: "3.5rem",
    paddingTop: "0.25rem",
    marginBottom: "clamp(1.5rem, 4vw, 3.25rem)",
  },
  sectionHeadTight: {
    marginBottom: "0.75rem",
  },
  textLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4em",
    minHeight: "2.75rem",
    color: colors.fg,
    cursor: "pointer",
    ...press,
  },
  // Underlined at rest: touch has no hover, so the line is the cue. Hover darkens it.
  textLinkText: {
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.25em",
    textDecorationColor: {
      default: colors.lineStrong,
      [stylex.when.ancestor(":hover")]: colors.fg,
      [stylex.when.ancestor(":focus-visible")]: colors.fg,
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: "200ms",
  },
  textLinkArrow: {
    transitionProperty: "transform",
    transitionDuration: {
      default: arrowExit,
      [hover]: { default: arrowExit, [stylex.when.ancestor(":hover")]: arrowEnter },
    },
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translateX(0.2em)" },
    },
  },
  // An arrow that points out of the site nudges the way it points.
  textLinkArrowOut: {
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translate(0.14em, -0.14em)" },
    },
  },
  textLinkArrowBack: {
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translateX(-0.2em)" },
    },
  },
  // Saans metrics (em): ascent 0.982, descent 0.195, cap height 0.721. With line-height L,
  // the cap top sits (L - 1.177) / 2 + 0.261 under the top of the line box; the margins
  // below trim each box to it, so boxes, not glyphs, carry the alignment.
  pageHead: {
    containerType: "inline-size",
    paddingTop: "4.5rem",
    paddingBottom: "clamp(2.25rem, 3vw, 3rem)",
  },
  titleRow: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [wide]: "auto minmax(0, 1fr)" },
    alignItems: "start",
    columnGap: "clamp(2rem, 5vw, 5rem)",
    rowGap: "1.25rem",
    paddingTop: "clamp(1.75rem, 4vw, 3.5rem)",
  },
  side: {
    justifySelf: { default: "stretch", [wide]: "end" },
    width: { default: "auto", [wide]: "min(100%, 34rem)" },
  },
  // Line-height 0.8: the box runs from the cap top to the descender line, so a "g" never
  // reaches the rule and every title ends the same distance under its baseline.
  pageTitle: {
    fontSize: "var(--title)",
    lineHeight: 0.8,
    marginTop: "-0.0725em",
    marginBottom: "0.0485em",
    letterSpacing: "-0.065em",
    fontVariationSettings: '"wght" calc(380 + var(--wdk))',
    whiteSpace: "nowrap",
  },
  // Line-height 1.3: the first line's cap top lands on the side column's top edge.
  lede: {
    marginTop: "-0.3225em",
    fontSize: "clamp(1.25rem, 1.75vw, 1.625rem)",
    lineHeight: 1.3,
    letterSpacing: "-0.018em",
    fontVariationSettings: '"wght" calc(400 + var(--wdk))',
    textWrap: "pretty",
    color: colors.fg,
  },
  ledeMore: {
    marginBottom: "1.25rem",
  },
  fit: (lsb: number) => ({ marginLeft: `-${lsb}em` }),
  clip: {
    display: "block",
    overflow: "clip",
    paddingBottom: "0.22em",
    // Negative tracking pulls the box in past the last glyph; keep its ink unclipped.
    paddingRight: "0.08em",
    marginBottom: "-0.08em",
  },
  slide: {
    display: "block",
    animationName: slideUp,
    animationDuration: "650ms",
    animationTimingFunction: motion.out,
    animationFillMode: "both",
  },
  rows: {
    borderTopWidth: "1px",
    borderTopColor: colors.line,
  },
  rowItem: {
    borderBottomWidth: "1px",
    borderBottomColor: colors.line,
    transitionProperty: "opacity",
    transitionDuration: "250ms",
    transitionTimingFunction: motion.out,
  },
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      "@media (min-width: 768px)": "minmax(0, 1fr) auto 2rem",
    },
    alignItems: "baseline",
    columnGap: "1rem",
    rowGap: "0.25rem",
    paddingBlock: "clamp(1.1rem, 2.2vw, 1.6rem)",
  },
  // Outside the row: an inset ring would sit on the first letter of the title.
  rowLink: {
    outlineOffset: "4px",
    cursor: "pointer",
    ...press,
  },
  rowMain: {
    display: "flex",
    flexDirection: { default: "column", "@media (min-width: 768px)": "row" },
    alignItems: { default: "flex-start", "@media (min-width: 768px)": "baseline" },
    gap: { default: "0.35rem", "@media (min-width: 768px)": "1.25rem" },
    minWidth: 0,
  },
  rowTitle: {
    textWrap: "balance",
    fontSize: "clamp(1.25rem, 2.3vw, 1.875rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontVariationSettings: '"wght" calc(450 + var(--wdk))',
  },
  // A linked title underlines while its row is hovered or focused.
  rowTitleLink: {
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.16em",
    textDecorationColor: {
      default: "transparent",
      [stylex.when.ancestor(":hover")]: colors.lineStrong,
      [stylex.when.ancestor(":focus-visible")]: colors.lineStrong,
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: "200ms",
  },
  rowTitleLg: {
    fontSize: "clamp(1.75rem, 4.2vw, 3.5rem)",
    // Tight tracking only once the titles are big enough to need it.
    letterSpacing: { default: "-0.03em", [wide]: "-0.045em" },
    lineHeight: 1,
    fontVariationSettings: '"wght" calc(400 + var(--wdk))',
  },
  rowSummary: {
    gridColumn: "1",
    gridRow: { default: "3", "@media (min-width: 768px)": "2" },
    maxWidth: "62ch",
    textWrap: "pretty",
    marginTop: "0.5rem",
    fontSize: "0.9375rem",
    lineHeight: 1.45,
    color: colors.dim,
  },
  rowDetail: {
    color: colors.dim,
    fontSize: "0.9375rem",
    lineHeight: 1.4,
  },
  // Large rows carry 12px meta, like the post byline: it sits under bigger titles, and
  // keeps Contact (mostly labels and handles) above Lighthouse's 60%-legible line.
  rowMetaLg: {
    fontSize: "0.75rem",
  },
  rowMetaWide: {
    gridColumn: { default: "1", "@media (min-width: 768px)": "2 / -1" },
    justifySelf: { default: "start", "@media (min-width: 768px)": "end" },
  },
  rowMeta: {
    gridColumn: { default: "1", "@media (min-width: 768px)": "auto" },
    gridRow: { default: "2", "@media (min-width: 768px)": "auto" },
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.01em",
    color: colors.dim,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  // Full strength at rest: on touch there's no hover, so the arrow is what says "link".
  rowArrow: {
    gridColumn: { default: "2", "@media (min-width: 768px)": "3" },
    gridRow: "1",
    alignSelf: "center",
    justifySelf: "end",
    display: "flex",
    fontSize: "1.375rem",
    color: colors.fg,
    transitionProperty: "transform",
    transitionDuration: {
      default: arrowExit,
      [hover]: { default: arrowExit, [stylex.when.ancestor(":hover")]: arrowEnter },
    },
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translateX(0.25rem)" },
    },
  },
  rowArrowLg: {
    fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
  },
  // External rows turn the same arrow to point out of the site.
  rowArrowExternal: {
    transform: {
      default: "rotate(-45deg)",
      [hover]: { default: "rotate(-45deg)", [stylex.when.ancestor(":hover")]: "rotate(-45deg) translateX(0.25rem)" },
    },
  },
});
