import * as stylex from "@stylexjs/stylex";
import { duration, experience, formatMonth, groupByCompany, isoMonth, logos } from "@/lib/site";
import { colors, fonts, motion } from "@/styles/tokens.stylex";

const groups = groupByCompany(experience);

// The writing list's scale: the name is a row title, and each role hangs under it with
// its dates beside it.
const NAME = "clamp(1.25rem, 2.3vw, 1.875rem)";
const TILE = "clamp(2.25rem, 1.5rem + 1.6vw, 2.75rem)";
const GAP = "clamp(1rem, 1.6vw, 1.5rem)";
const ROLE = "clamp(0.9375rem, 0.85rem + 0.3vw, 1.0625rem)";
const ROLE_LINE = 1.4;
const ROLE_GAP = "0.5rem";
const NODE = "7px";
// The rail runs down the middle of the tile column.
const AXIS = `calc(-1 * (${GAP} + ${TILE} / 2))`;

const roomy = "@media (min-width: 640px)";
const wide = "@media (min-width: 1024px)";
// Hover effects only where hover is real; a tap on touch would leave them stuck on.
const HOVER = "@media (hover: hover) and (pointer: fine)";

/**
 * Experience as editorial rows, one per company and one structure for all of them: logo,
 * name and tenure on the first line, then each role with its dates. A hairline drops from
 * the logo through a ring for every role. Only the main current job (the top one) gets a
 * filled ring. Pure CSS.
 */
export function Experience() {
  return (
    <ul {...stylex.props(styles.list)}>
      {groups.map((g, gi) => (
        <li key={`${g.company}-${g.start}`} {...stylex.props(styles.group)}>
          <Mark company={g.company} />
          <h3 {...stylex.props(styles.name)}>
            {logos[g.company] ? (
              <a
                href={logos[g.company].url}
                target="_blank"
                rel="noreferrer"
                {...stylex.props(stylex.defaultMarker(), styles.nameLink)}
              >
                {g.company}
                <span aria-hidden="true" {...stylex.props(styles.nameArrow)}>
                  ↗
                </span>
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : (
              g.company
            )}
          </h3>
          <span {...stylex.props(styles.meta, styles.tenure)}>{duration(g.start, g.end)}</span>
          <ol {...stylex.props(styles.roles)}>
            {g.roles.map((r, i) => (
              <li key={r.role} {...stylex.props(styles.role)}>
                {i === 0 ? <span aria-hidden="true" {...stylex.props(styles.seg, styles.segUp)} /> : null}
                {i < g.roles.length - 1 ? (
                  <span aria-hidden="true" {...stylex.props(styles.seg, styles.segDown)} />
                ) : null}
                <span aria-hidden="true" {...stylex.props(styles.node, gi === 0 && r.end === null && styles.nodeNow)} />
                <span {...stylex.props(styles.roleName)}>{r.role}</span>
                <span {...stylex.props(styles.meta)}>
                  <time dateTime={isoMonth(r.start)}>{formatMonth(r.start)}</time>
                  {" – "}
                  {r.end ? <time dateTime={isoMonth(r.end)}>{formatMonth(r.end)}</time> : "Now"}
                </span>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

/**
 * The logo tile, decorative since the name sits beside it. An icon fills it; a wordmark is
 * masked in the page colour on an inverted tile of the same size and radius, so every row
 * starts with the same square.
 */
function Mark({ company }: { company: string }) {
  const logo = logos[company];
  if (!logo) return null;
  // The name beside it is the accessible link, so this one stays out of the tab order.
  const link = { href: logo.url, target: "_blank", rel: "noreferrer", tabIndex: -1, "aria-hidden": true } as const;
  if (logo.kind === "wordmark") {
    return (
      <a {...link} {...stylex.props(styles.tile, styles.tileLink, styles.plate)}>
        <span {...stylex.props(styles.wordmark(`url("${logo.src}")`))} />
      </a>
    );
  }
  return (
    <a {...link} {...stylex.props(styles.tile, styles.tileLink, styles.icon)}>
      <img src={logo.src} alt="" width={44} height={44} loading="lazy" decoding="async" {...stylex.props(styles.img)} />
    </a>
  );
}

const styles = stylex.create({
  list: { borderTopWidth: "1px", borderTopColor: colors.line },
  group: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: `${TILE} minmax(0, 1fr) auto`,
      [wide]: `${TILE} minmax(0, 1fr) auto`,
    },
    columnGap: GAP,
    alignItems: "baseline",
    paddingBlock: "clamp(1.25rem, 2.4vw, 1.875rem)",
    borderBottomWidth: "1px",
    borderBottomColor: colors.line,
  },
  // Centred on the name's cap height rather than the row box. The negative bottom
  // margin keeps the tile from setting the first line's height, so the roles follow
  // the name at the same rhythm they follow each other.
  tile: {
    position: "relative",
    zIndex: 1,
    gridColumn: "1",
    gridRow: "1",
    alignSelf: "start",
    marginTop: `calc(${NAME} * 0.573 - ${TILE} / 2)`,
    marginBottom: `calc(${TILE} / -2)`,
    width: TILE,
    height: TILE,
    borderRadius: "24%",
  },
  // The tile is the link; it clips the logo to its rounded corners and dims a touch on hover.
  tileLink: {
    display: "block",
    overflow: "hidden",
    opacity: { default: 1, [HOVER]: { default: 1, ":hover": 0.8 } },
    transitionProperty: "opacity",
    transitionDuration: "160ms",
    transitionTimingFunction: motion.outUi,
  },
  img: { display: "block", width: "100%", height: "100%" },
  nameLink: {
    color: "inherit",
    textDecorationLine: { default: "none", [HOVER]: { default: "none", ":hover": "underline" } },
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.14em",
  },
  // A small out-arrow says the name leads off-site, visible at rest so touch users see it.
  nameArrow: {
    display: "inline-block",
    marginLeft: "0.3em",
    fontSize: "0.55em",
    verticalAlign: "0.45em",
    color: colors.dim,
    transitionProperty: "transform",
    transitionDuration: "160ms",
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      [HOVER]: { default: null, [stylex.when.ancestor(":hover")]: "translate(0.14em, -0.14em)" },
    },
  },
  icon: {
    outlineWidth: "1px",
    outlineStyle: "solid",
    outlineColor: colors.lineStrong,
    outlineOffset: "-1px",
  },
  // A wordmark's ground is inverted (dark tile in light mode, light tile in dark mode),
  // so it contrasts with the page like the solid app icons beside it.
  plate: {
    display: "grid",
    placeItems: "center",
    backgroundColor: colors.fg,
  },
  // 54×30 artwork at 84% of the tile's width; its height follows the ratio.
  wordmark: (url: string) => ({
    width: "84%",
    aspectRatio: "54.189 / 30",
    backgroundColor: colors.bg,
    maskImage: url,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
  }),
  name: {
    gridColumn: "2",
    gridRow: "1",
    fontSize: NAME,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontVariationSettings: '"wght" calc(450 + var(--wdk))',
  },
  tenure: {
    gridColumn: "3",
    gridRow: "1",
    justifySelf: "end",
  },
  // From 640px the dates share a fixed box, so every start month lines up.
  meta: {
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.01em",
    color: colors.dim,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    // 19 characters plus their letter-spacing: "Jun 2026 – Nov 2026".
    minWidth: { default: null, [roomy]: "19.5ch" },
    textAlign: "start",
  },
  // Wide screens: the roles take the name and date columns as a subgrid, so dates sit in
  // the third column with the tenure, against the right edge.
  roles: {
    gridColumn: "2 / -1",
    gridRow: "2",
    display: { default: "flex", [wide]: "grid" },
    flexDirection: "column",
    gridTemplateColumns: { default: null, [wide]: "subgrid" },
    rowGap: ROLE_GAP,
    // The same gap as between roles, so the name leads them at one rhythm.
    marginTop: ROLE_GAP,
  },
  role: {
    position: "relative",
    display: { default: "flex", [wide]: "grid" },
    gridColumn: "1 / -1",
    gridTemplateColumns: { default: null, [wide]: "subgrid" },
    flexDirection: { default: "column", [roomy]: "row" },
    justifyContent: "space-between",
    alignItems: { default: "flex-start", [roomy]: "baseline" },
    // On wide screens the subgrid keeps the group's gap, so dates stay on its column line.
    columnGap: { default: "1rem", [wide]: GAP },
    rowGap: "0.125rem",
    fontSize: ROLE,
  },
  roleName: { lineHeight: ROLE_LINE, color: colors.dim, textWrap: "balance" },
  // Each role's node sits on its first line, under the middle of the logo tile.
  node: {
    position: "absolute",
    left: AXIS,
    top: `calc(${ROLE_LINE}em / 2)`,
    width: NODE,
    height: NODE,
    marginLeft: `calc(${NODE} / -2)`,
    borderRadius: "50%",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.dim,
    backgroundColor: colors.bg,
    transform: "translateY(-50%)",
  },
  // The main current job's ring is filled; every other ring stays hollow.
  nodeNow: { borderColor: colors.fg, backgroundColor: colors.fg },
  // The rail: a hairline from the tile down to the first node, then node to node. Each
  // segment hangs from its own node, so it holds when a role wraps onto two lines.
  seg: {
    position: "absolute",
    left: AXIS,
    marginLeft: "-0.5px",
    width: "1px",
    backgroundColor: colors.lineStrong,
  },
  // Up under the tile, which sits above it.
  segUp: {
    bottom: `calc(100% - ${ROLE_LINE}em / 2)`,
    height: "3rem",
  },
  // Down across the gap to the next role's node.
  segDown: {
    top: `calc(${ROLE_LINE}em / 2)`,
    bottom: `calc(-1 * (${ROLE_GAP} + ${ROLE_LINE}em / 2))`,
  },
});
