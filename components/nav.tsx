import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { nav } from "@/lib/site";
import { colors, layout } from "@/styles/tokens.stylex";
import { ThemeToggle } from "./theme-toggle";

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/**
 * One bar, the same on every page and every screen: the name (home), three links and
 * the theme toggle. It's fixed and blended with `difference`, so it stays legible over
 * any surface in either theme.
 */
export function Nav({ path }: { path: string }) {
  return (
    <>
      {/* Fades content out under the nav so its blended text never sits on body text. */}
      {/* Safari 26+ ignores theme-color and tints its status bar from a fixed element with
          a background touching the top edge, updating as that colour changes. This plain
          band is that surface. It switches colour instantly (globals.css, [data-tint]):
          Safari reads the colour when it changes, not mid-transition, so an eased band
          would leave the bar on the old theme. The scrim above it eases, so you never see
          the band itself. */}
      <div aria-hidden="true" data-tint="" {...stylex.props(styles.topEdge)} />
      <div aria-hidden="true" {...stylex.props(styles.scrim)} />
      <header {...stylex.props(styles.header)}>
        {/* data-nav and data-nav-link carry the underline handoff (globals.css). */}
        <div data-nav="" {...stylex.props(styles.inner)}>
          <a
            href="/"
            aria-current={path === "/" ? "page" : undefined}
            aria-label="Ali Alshehri, home"
            data-nav-link=""
            {...stylex.props(styles.text, styles.brand)}
          >
            <Underlined>Ali Sh</Underlined>
          </a>
          <nav aria-label="Primary" {...stylex.props(styles.right)}>
            <ul {...stylex.props(styles.list)}>
              {nav.map(({ href, label }) => {
                const active = isActive(path, href);
                return (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={path === href ? "page" : active ? "true" : undefined}
                      data-nav-link=""
                      {...stylex.props(styles.text, styles.link)}
                    >
                      <Underlined>{label}</Underlined>
                    </a>
                  </li>
                );
              })}
            </ul>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  );
}

/**
 * The label with its underline. The current page (aria-current) keeps its bar drawn and
 * retracts it toward another link while that one is hovered; `.nav-bar` in globals.css, since
 * the direction needs sibling-order selectors StyleX can't express.
 */
function Underlined({ children }: { children: ReactNode }) {
  return (
    <span {...stylex.props(styles.label)}>
      {children}
      <span aria-hidden="true" className="nav-bar" />
    </span>
  );
}

const SCROLL_TIMELINE = "@supports (animation-timeline: scroll())";

const settle = stylex.keyframes({
  from: { transform: "translateY(-3rem)" },
  to: { transform: "none" },
});

const styles = stylex.create({
  topEdge: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: 48,
    // A hairline: at the top of the page the scrim sits 3rem up, so a taller band would
    // show its instant switch against the easing page for a moment.
    height: "1px",
    pointerEvents: "none",
    backgroundColor: colors.bg,
  },
  // Solid behind the nav's text (its line box ends at 2.7rem), then a smoothstep fade:
  // a linear fade starts and stops at a kink, which reads as a hard band.
  scrim: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: 49,
    pointerEvents: "none",
    // Without scroll timelines: a short fade that ends on the frame rule at 4.5rem, so
    // it never covers the top of the page at rest.
    height: { default: "4.5rem", [SCROLL_TIMELINE]: "7.5rem" },
    // A solid fill shaped by an alpha mask, not a colour gradient: the fill is a plain
    // colour, so it eases with the theme switch like everything else (gradients can't
    // transition). The mask reads only alpha; currentColor is just an opaque stand-in.
    backgroundColor: colors.bg,
    maskImage: {
      default: `linear-gradient(
        currentColor 2.75rem,
        color-mix(in srgb, currentColor 97.2%, transparent) 2.925rem,
        color-mix(in srgb, currentColor 89.6%, transparent) 3.1rem,
        color-mix(in srgb, currentColor 78.4%, transparent) 3.275rem,
        color-mix(in srgb, currentColor 64.8%, transparent) 3.45rem,
        color-mix(in srgb, currentColor 50.0%, transparent) 3.625rem,
        color-mix(in srgb, currentColor 35.2%, transparent) 3.8rem,
        color-mix(in srgb, currentColor 21.6%, transparent) 3.975rem,
        color-mix(in srgb, currentColor 10.4%, transparent) 4.15rem,
        color-mix(in srgb, currentColor 2.8%, transparent) 4.325rem,
        transparent 4.5rem
      )`,
      // With them: a longer, softer fade, held 3rem up at the top of the page (where
      // only the empty frame sits under it) and settled into place over the first 3rem
      // of scroll. A transform on the scroll timeline, so it runs on the compositor.
      [SCROLL_TIMELINE]: `linear-gradient(
        currentColor 2.75rem,
        color-mix(in srgb, currentColor 97.2%, transparent) 3.225rem,
        color-mix(in srgb, currentColor 89.6%, transparent) 3.7rem,
        color-mix(in srgb, currentColor 78.4%, transparent) 4.175rem,
        color-mix(in srgb, currentColor 64.8%, transparent) 4.65rem,
        color-mix(in srgb, currentColor 50.0%, transparent) 5.125rem,
        color-mix(in srgb, currentColor 35.2%, transparent) 5.6rem,
        color-mix(in srgb, currentColor 21.6%, transparent) 6.075rem,
        color-mix(in srgb, currentColor 10.4%, transparent) 6.55rem,
        color-mix(in srgb, currentColor 2.8%, transparent) 7.025rem,
        transparent 7.5rem
      )`,
    },
    WebkitMaskImage: {
      default: `linear-gradient(
        currentColor 2.75rem,
        color-mix(in srgb, currentColor 97.2%, transparent) 2.925rem,
        color-mix(in srgb, currentColor 89.6%, transparent) 3.1rem,
        color-mix(in srgb, currentColor 78.4%, transparent) 3.275rem,
        color-mix(in srgb, currentColor 64.8%, transparent) 3.45rem,
        color-mix(in srgb, currentColor 50.0%, transparent) 3.625rem,
        color-mix(in srgb, currentColor 35.2%, transparent) 3.8rem,
        color-mix(in srgb, currentColor 21.6%, transparent) 3.975rem,
        color-mix(in srgb, currentColor 10.4%, transparent) 4.15rem,
        color-mix(in srgb, currentColor 2.8%, transparent) 4.325rem,
        transparent 4.5rem
      )`,
      // With them: a longer, softer fade, held 3rem up at the top of the page (where
      // only the empty frame sits under it) and settled into place over the first 3rem
      // of scroll. A transform on the scroll timeline, so it runs on the compositor.
      [SCROLL_TIMELINE]: `linear-gradient(
        currentColor 2.75rem,
        color-mix(in srgb, currentColor 97.2%, transparent) 3.225rem,
        color-mix(in srgb, currentColor 89.6%, transparent) 3.7rem,
        color-mix(in srgb, currentColor 78.4%, transparent) 4.175rem,
        color-mix(in srgb, currentColor 64.8%, transparent) 4.65rem,
        color-mix(in srgb, currentColor 50.0%, transparent) 5.125rem,
        color-mix(in srgb, currentColor 35.2%, transparent) 5.6rem,
        color-mix(in srgb, currentColor 21.6%, transparent) 6.075rem,
        color-mix(in srgb, currentColor 10.4%, transparent) 6.55rem,
        color-mix(in srgb, currentColor 2.8%, transparent) 7.025rem,
        transparent 7.5rem
      )`,
    },
    animationName: { default: null, [SCROLL_TIMELINE]: settle },
    animationTimingFunction: { default: null, [SCROLL_TIMELINE]: "linear" },
    animationFillMode: { default: null, [SCROLL_TIMELINE]: "both" },
    animationTimeline: { default: null, [SCROLL_TIMELINE]: "scroll()" },
    animationRange: { default: null, [SCROLL_TIMELINE]: "0 3rem" },
  },
  header: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: 50,
    // White under `difference` inverts what's beneath: ink on paper, paper on ink.
    color: colors.blend,
    mixBlendMode: "difference",
    pointerEvents: "none",
    // Its own View Transition layer, so soft navigations leave it still (globals.css).
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "1rem",
    minHeight: "4rem",
    maxWidth: layout.max,
    marginInline: "auto",
    paddingInline: layout.gutter,
  },
  // Plain sans at reading size: links in a bar should read as words you can click, not labels.
  text: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    minHeight: "2.75rem",
    whiteSpace: "nowrap",
    fontSize: "0.9375rem",
    letterSpacing: "-0.005em",
    fontVariationSettings: '"wght" 500',
    cursor: "pointer",
  },
  brand: {
    fontVariationSettings: '"wght" 620',
  },
  right: {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    gap: { default: "0.75rem", "@media (min-width: 768px)": "1.5rem" },
  },
  list: {
    display: "flex",
    gap: { default: "1.125rem", "@media (min-width: 768px)": "2rem" },
  },
  // The padding widens the hit area to 44px ("Info" is 29px) and the margin cancels
  // it, so nothing moves.
  link: {
    paddingInline: "0.5rem",
    marginInline: "-0.5rem",
  },
  label: { position: "relative" },
});
