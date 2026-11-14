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

const styles = stylex.create({
  scrim: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: 49,
    // Solid well past the nav's text (to 3rem), then a short fade that ends on the
    // frame rule at 4.5rem, so body text never shows behind the links.
    height: "4.5rem",
    pointerEvents: "none",
    backgroundImage: `linear-gradient(${colors.bg} 3rem, transparent)`,
  },
  header: {
    position: "fixed",
    insetInline: 0,
    top: 0,
    zIndex: 50,
    color: "#fff",
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
