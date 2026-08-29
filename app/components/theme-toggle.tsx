"use client";

import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/tokens.stylex";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button onClick={toggle} aria-label="Toggle dark mode" type="button" {...stylex.props(styles.button)}>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...stylex.props(styles.icon, theme === "light" ? styles.shown : styles.hiddenCCW)}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...stylex.props(styles.icon, theme === "dark" ? styles.shown : styles.hiddenCW)}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </button>
  );
}

const styles = stylex.create({
  button: {
    position: "relative",
    height: "18px",
    width: "18px",
    color: { default: colors.toggle, ":hover": colors.toggleHover },
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  icon: {
    position: "absolute",
    inset: "0px",
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "300ms",
  },
  shown: {
    transform: "translate(0, 0) rotate(0deg) skewX(0) skewY(0) scaleX(1) scaleY(1)",
    opacity: 1,
    filter: "blur(0)",
  },
  hiddenCCW: {
    transform: "translate(0, 0) rotate(-90deg) skewX(0) skewY(0) scaleX(0) scaleY(0)",
    opacity: 0,
    filter: "blur(4px)",
  },
  hiddenCW: {
    transform: "translate(0, 0) rotate(90deg) skewX(0) skewY(0) scaleX(0) scaleY(0)",
    opacity: 0,
    filter: "blur(4px)",
  },
});
