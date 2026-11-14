import * as stylex from "@stylexjs/stylex";
import { site, socials } from "@/lib/site";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { Container, Label, Rule, TextLink } from "./ui";

/** The Contact page already shows the address and every link, so there it's just the © line. */
export function Footer({ onContact = false }: { onContact?: boolean }) {
  return (
    <footer>
      <Container>
        {onContact ? null : (
          <div {...stylex.props(styles.top)}>
            <Rule />
            <div {...stylex.props(styles.inner)}>
              <Label style={styles.dim}>Have a project or a question? Email me.</Label>
              <a href={`mailto:${site.email}`} {...stylex.props(stylex.defaultMarker(), styles.cta)}>
                <span {...stylex.props(styles.ctaText)}>Say hello</span>
                <span aria-hidden="true" {...stylex.props(styles.ctaArrow)}>
                  →
                </span>
              </a>
              <p {...stylex.props(styles.email)}>{site.email}</p>
            </div>
          </div>
        )}

        <div {...stylex.props(styles.bottom)}>
          {onContact ? null : (
            <ul {...stylex.props(styles.links)}>
              {socials
                .filter(s => s.label !== "Email")
                .map(s => (
                  <li key={s.label}>
                    <TextLink href={s.href} arrow="↗" style={styles.link}>
                      {s.label}
                    </TextLink>
                  </li>
                ))}
            </ul>
          )}
          <Label style={styles.dim}>© {new Date().getFullYear()} Ali Alshehri</Label>
        </div>
      </Container>
    </footer>
  );
}

const hover = "@media (hover: hover) and (pointer: fine)";

const styles = stylex.create({
  dim: { color: colors.dim },
  top: {
    // 100cqw is the column itself, so a classic scrollbar can't push the arrow past the edge.
    containerType: "inline-size",
    paddingBottom: "clamp(3.5rem, 8vw, 6rem)",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    paddingTop: "1.25rem",
  },
  // Spans the column by ink, like the name: at weight 330 and -0.065em tracking the ink
  // of "Say hello" is 3.340em (the "S" starts 0.0265em in), and the half-size arrow's
  // ink is 0.322em, ending 0.0215em before its advance. With a 0.388em field between
  // them that's 4.05em, so the "S" sits on the left edge and the arrow on the right.
  cta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontSize: "calc(100cqw / 4.05)",
    lineHeight: 0.85,
    letterSpacing: "-0.065em",
    marginLeft: "-0.0265em",
    marginRight: "-0.0215em",
    marginTop: "clamp(0.5rem, 2vw, 1.5rem)",
    paddingBottom: "0.2em",
    cursor: "pointer",
  },
  // Underlined at rest, so it reads as a link without a hover. Hover darkens the line.
  ctaText: {
    whiteSpace: "nowrap",
    fontVariationSettings: '"wght" calc(330 + var(--wdk))',
    textDecorationLine: "underline",
    textDecorationThickness: "max(1px, 0.008em)",
    textUnderlineOffset: "0.01em",
    textDecorationColor: {
      default: colors.lineStrong,
      [stylex.when.ancestor(":hover")]: colors.fg,
      [stylex.when.ancestor(":focus-visible")]: colors.fg,
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: "250ms",
  },
  ctaArrow: {
    fontSize: "0.5em",
    // No negative tracking here: it would push the arrow's ink past the column edge.
    letterSpacing: 0,
    fontVariationSettings: '"wght" calc(300 + var(--wdk))',
    transitionProperty: "transform",
    transitionDuration: { default: "160ms", [hover]: { default: "160ms", [stylex.when.ancestor(":hover")]: "220ms" } },
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translateX(0.04em)" },
    },
  },
  // Plain, selectable text at full strength: people without a mail app copy it from here.
  email: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    color: colors.fg,
    userSelect: "all",
    overflowWrap: "anywhere",
  },
  bottom: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "2rem",
    rowGap: "0.5rem",
    paddingBlock: "1rem 1.75rem",
    borderTopWidth: "1px",
    borderTopColor: colors.line,
  },
  links: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    fontSize: "0.9375rem",
    gap: "0.25em",
  },
});
