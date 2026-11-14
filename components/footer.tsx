import * as stylex from "@stylexjs/stylex";
import { socials } from "@/lib/site";
import { colors } from "@/styles/tokens.stylex";
import { Container, Label, TextLink } from "./ui";

/** A quiet footer: the profiles and the © line. Contact lists the links itself, so it drops them. */
export function Footer({ socialLinks }: { socialLinks: boolean }) {
  return (
    <footer>
      <Container>
        <div {...stylex.props(styles.bottom)}>
          {socialLinks ? (
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
          ) : null}
          <Label style={styles.dim}>© {new Date().getFullYear()} Ali Alshehri</Label>
        </div>
      </Container>
    </footer>
  );
}

const styles = stylex.create({
  dim: { color: colors.dim },
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
