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
      <div aria-hidden="true" {...stylex.props(styles.scrim)} />
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.inner)}>
          <a
            href="/"
            aria-current={path === "/" ? "page" : undefined}
            aria-label="Ali Alshehri, home"
            {...stylex.props(stylex.defaultMarker(), styles.text, styles.brand)}
          >
            <Underlined on={path === "/"}>Ali Sh</Underlined>
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
                      {...stylex.props(stylex.defaultMarker(), styles.text, styles.link)}
                    >
                      <Underlined on={active}>{label}</Underlined>
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
 * The label with a bar under it that draws in from the left on hover and leaves to the
 * right, the old site's nav effect. A transform, so it never moves the layout. The
 * current page keeps its bar.
 */
function Underlined({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span {...stylex.props(styles.label)}>
      {children}
      <span aria-hidden="true" {...stylex.props(styles.bar, on && styles.barOn)} />
    </span>
  );
}

const SCROLL_TIMELINE = "@supports (animation-timeline: scroll())";

const settle = stylex.keyframes({
  from: { transform: "translateY(-3rem)" },
  to: { transform: "none" },
});

const styles = stylex.create({
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
    backgroundImage: {
      default: `linear-gradient(
        ${colors.bg} 2.75rem,
        color-mix(in srgb, ${colors.bg} 97.2%, transparent) 2.925rem,
        color-mix(in srgb, ${colors.bg} 89.6%, transparent) 3.1rem,
        color-mix(in srgb, ${colors.bg} 78.4%, transparent) 3.275rem,
        color-mix(in srgb, ${colors.bg} 64.8%, transparent) 3.45rem,
        color-mix(in srgb, ${colors.bg} 50.0%, transparent) 3.625rem,
        color-mix(in srgb, ${colors.bg} 35.2%, transparent) 3.8rem,
        color-mix(in srgb, ${colors.bg} 21.6%, transparent) 3.975rem,
        color-mix(in srgb, ${colors.bg} 10.4%, transparent) 4.15rem,
        color-mix(in srgb, ${colors.bg} 2.8%, transparent) 4.325rem,
        transparent 4.5rem
      )`,
      // With them: a longer, softer fade, held 3rem up at the top of the page (where
      // only the empty frame sits under it) and settled into place over the first 3rem
      // of scroll. A transform on the scroll timeline, so it runs on the compositor.
      [SCROLL_TIMELINE]: `linear-gradient(
        ${colors.bg} 2.75rem,
        color-mix(in srgb, ${colors.bg} 97.2%, transparent) 3.225rem,
        color-mix(in srgb, ${colors.bg} 89.6%, transparent) 3.7rem,
        color-mix(in srgb, ${colors.bg} 78.4%, transparent) 4.175rem,
        color-mix(in srgb, ${colors.bg} 64.8%, transparent) 4.65rem,
        color-mix(in srgb, ${colors.bg} 50.0%, transparent) 5.125rem,
        color-mix(in srgb, ${colors.bg} 35.2%, transparent) 5.6rem,
        color-mix(in srgb, ${colors.bg} 21.6%, transparent) 6.075rem,
        color-mix(in srgb, ${colors.bg} 10.4%, transparent) 6.55rem,
        color-mix(in srgb, ${colors.bg} 2.8%, transparent) 7.025rem,
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
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-0.3em",
    height: "1px",
    backgroundColor: "currentColor",
    transformOrigin: { default: "right", [stylex.when.ancestor(":hover")]: "left", [stylex.when.ancestor(":focus-visible")]: "left" },
    transform: {
      default: "scaleX(0)",
      [stylex.when.ancestor(":hover")]: "scaleX(1)",
      [stylex.when.ancestor(":focus-visible")]: "scaleX(1)",
    },
    transitionProperty: "transform",
    transitionDuration: { default: "350ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
  // The current page's bar stays drawn.
  barOn: {
    transform: { default: "scaleX(1)", [stylex.when.ancestor(":hover")]: "scaleX(1)" },
  },
});
