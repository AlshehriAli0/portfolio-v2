import * as stylex from "@stylexjs/stylex";
import type { PageConfig } from "next";
import { Page } from "@/components/page";
import { Container, Label, PageTitle, Rows, Rule } from "@/components/ui";
import { site, socials } from "@/lib/site";
import { webPage } from "@/lib/structured-data";

const DESCRIPTION = "Get in touch with Ali Alshehri by email, or find him on GitHub, X and LinkedIn.";

import { colors, motion } from "@/styles/tokens.stylex";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

const elsewhere = socials.filter(s => s.label !== "Email");

export default function ContactPage() {
  return (
    <Page
      path="/contact"
      title="Contact"
      description={DESCRIPTION}
      jsonLd={[webPage("/contact", `Contact — ${site.name}`, DESCRIPTION, "ContactPage")]}
    >
      <main id="main" tabIndex={-1}>
        <Container>
          <PageTitle title="Contact" em={3.153} lsb={0.039} />

          <Rule />
          {/* The page's one job, so the address itself is the headline. */}
          <section aria-labelledby="email-label" {...stylex.props(styles.email)}>
            <h2 id="email-label">
              <Label style={styles.dim}>Email is the best way to reach me.</Label>
            </h2>
            <a href={`mailto:${site.email}`} {...stylex.props(stylex.defaultMarker(), styles.address)}>
              <span {...stylex.props(styles.addressText)}>{site.email}</span>
              <span aria-hidden="true" {...stylex.props(styles.arrow)}>
                →
              </span>
            </a>
            {/* lib/client-script.ts copies data-copy; the labels swap on data-copied (globals.css). */}
            <button type="button" data-copy={site.email} aria-label="Copy address" {...stylex.props(styles.copy)}>
              <span {...stylex.props(styles.labels)}>
                <span data-copy-label="idle">Copy address</span>
                <span data-copy-label="done" {...stylex.props(styles.done)}>
                  Copied
                  {/* Saans has no ✓, so the check is drawn rather than borrowed from a fallback font. */}
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="0.875em" height="0.875em">
                    <path d="M2.5 8.5 6 12l7.5-8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
                <span data-copy-label="failed">Copy failed</span>
              </span>
            </button>
            <output className="sr-only" />
          </section>

          <section aria-labelledby="elsewhere-label" {...stylex.props(styles.elsewhere)}>
            <h2 id="elsewhere-label" {...stylex.props(styles.elsewhereHead)}>
              <Label style={styles.heading}>Elsewhere</Label>
            </h2>
            <Rows
              size="lg"
              rows={elsewhere.map(s => ({ key: s.label, title: s.label, meta: s.value, href: s.href }))}
            />
          </section>
        </Container>
      </main>
    </Page>
  );
}

const hover = "@media (hover: hover) and (pointer: fine)";
const motionOk = "@media (prefers-reduced-motion: no-preference)";

const styles = stylex.create({
  dim: { color: colors.dim },
  heading: { fontSize: "1rem", fontVariationSettings: '"wght" 520' },
  email: {
    paddingTop: "1rem",
  },
  address: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "1rem",
    paddingTop: "clamp(1.25rem, 3vw, 2.5rem)",
    paddingBottom: "clamp(1.25rem, 2.5vw, 2rem)",
    fontSize: "clamp(1.625rem, 5.4vw, 5.25rem)",
    lineHeight: 1,
    letterSpacing: "-0.045em",
    fontVariationSettings: '"wght" calc(380 + var(--wdk))',
    overflowWrap: "anywhere",
  },
  addressText: {
    textDecorationLine: "underline",
    textDecorationThickness: "max(1px, 0.02em)",
    textUnderlineOffset: "0.14em",
    textDecorationColor: {
      default: colors.lineStrong,
      [stylex.when.ancestor(":hover")]: colors.fg,
      [stylex.when.ancestor(":focus-visible")]: colors.fg,
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: "250ms",
  },
  arrow: {
    flexShrink: 0,
    fontVariationSettings: '"wght" calc(300 + var(--wdk))',
    transitionProperty: "transform",
    transitionDuration: { default: "160ms", [hover]: { default: "160ms", [stylex.when.ancestor(":hover")]: "220ms" } },
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      [hover]: { default: null, [stylex.when.ancestor(":hover")]: "translateX(0.06em)" },
    },
  },
  copy: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "3rem",
    paddingInline: "1.25rem",
    gap: "0.6rem",
    fontSize: "1rem",
    fontVariationSettings: '"wght" 500',
    cursor: "pointer",
    borderWidth: "1px",
    // The accent's one job outside posts: the page's main action, on hover. Fine
    // pointers only: on touch the fill would stay stuck on after a tap.
    borderColor: { default: colors.lineStrong, [hover]: { default: colors.lineStrong, ":hover": colors.accent } },
    backgroundColor: { default: "transparent", [hover]: { default: "transparent", ":hover": colors.accent } },
    color: { default: colors.fg, [hover]: { default: colors.fg, ":hover": colors.accentInk } },
    // The fill snaps on and fades off; the press scale has its own 120ms.
    transitionProperty: "background-color, border-color, color, transform",
    transitionDuration: {
      default: "250ms, 250ms, 250ms, 120ms",
      [hover]: { default: "250ms, 250ms, 250ms, 120ms", ":hover": "0ms, 0ms, 0ms, 120ms" },
    },
    transitionTimingFunction: "ease, ease, ease, cubic-bezier(0.23, 1, 0.32, 1)",
    transform: { default: null, [motionOk]: { default: null, ":active": "scale(0.97)" } },
  },
  done: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4em",
  },
  labels: {
    display: "grid",
    justifyItems: "start",
  },
  elsewhere: {
    paddingTop: "clamp(3.5rem, 8vw, 6rem)",
    paddingBottom: "clamp(4.5rem, 10vw, 8.5rem)",
  },
  elsewhereHead: {
    marginBottom: "1rem",
  },
});
