"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/app/tokens.stylex";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/info", label: "Information", aria: "Information about Ali Alshehri" },
  { href: "/posts", label: "Writing", aria: "Writing by Ali Alshehri" },
  { href: "/contact", label: "Contact", aria: "Contact Ali Alshehri" },
] as const;

export const Nav = () => {
  const activePath = usePathname();

  return (
    <header {...stylex.props(styles.header)}>
      <Link
        href="/"
        {...stylex.props(stylex.defaultMarker(), styles.transition)}
        aria-label="Ali Alshehri home"
        prefetch={true}
      >
        <h1 {...stylex.props(styles.wordmark)}>Ali</h1>
        <span {...stylex.props(styles.underline, activePath === "/" && styles.underlineOpen)} />
      </Link>
      <nav {...stylex.props(styles.links)}>
        {LINKS.map(({ href, label, aria }) => (
          <Link
            key={href}
            href={href}
            {...stylex.props(stylex.defaultMarker(), styles.link)}
            aria-label={aria}
            prefetch={true}
          >
            {label}
            <span {...stylex.props(styles.underline, activePath === href && styles.underlineOpen)} />
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
};

const styles = stylex.create({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
    paddingRight: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
    paddingBottom: "4rem",
    paddingTop: { default: "2rem", "@media (min-width: 768px)": "4rem" },
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  transition: {
    transitionProperty:
      "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  wordmark: {
    fontFamily: "var(--font-monospace)",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontVariationSettings: '"wght" 600',
    color: colors.heading,
  },
  link: {
    fontFamily: "var(--font-monospace)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontVariationSettings: '"wght" 600',
    letterSpacing: "-0.05em",
    color: colors.heading,
    transitionProperty:
      "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  underline: {
    display: "block",
    height: "0.125rem",
    backgroundColor: colors.heading,
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "500ms",
    maxWidth: { default: "0px", [stylex.when.ancestor(":hover")]: "100%" },
  },
  underlineOpen: {
    maxWidth: { default: "100%", [stylex.when.ancestor(":hover")]: "100%" },
  },
});
