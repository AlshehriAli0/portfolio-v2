import * as stylex from "@stylexjs/stylex";
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
            {...stylex.props(styles.text, styles.underline, styles.brand, path === "/" ? styles.linkOn : null)}
          >
            <span>Ali Sh</span>
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
                      {...stylex.props(styles.text, styles.underline, styles.link, active ? styles.linkOn : null)}
                    >
                      {label}
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
  // An underline marks where you are; hover previews it (the name included).
  underline: {
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.4em",
    textDecorationColor: {
      default: "transparent",
      ":hover": "rgb(255 255 255 / 0.5)",
      ":focus-visible": "rgb(255 255 255 / 0.5)",
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: { default: "250ms", ":hover": "0ms" },
  },
  linkOn: {
    textDecorationColor: { default: "currentColor", ":hover": "currentColor" },
  },
});
