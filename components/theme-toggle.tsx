import * as stylex from "@stylexjs/stylex";
import { colors, motion } from "@/styles/tokens.stylex";

// Plain markup: lib/client-script.ts handles the click, and the icons swap via CSS
// (`.theme-icon-*` in globals.css), so nothing re-renders.
export function ThemeToggle() {
  return (
    <button type="button" data-theme-toggle="" aria-label="Toggle color theme" {...stylex.props(styles.button)}>
      {/* .theme-icons is the icon's own layer during the theme View Transition (globals.css). */}
      <span className="theme-icons">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="theme-icon-moon" {...iconProps}>
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="theme-icon-sun" {...iconProps}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
        </svg>
      </span>
    </button>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    position: "absolute",
    inset: 0,
    margin: "auto",
    transition: "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1), transform 240ms cubic-bezier(0.23, 1, 0.32, 1)",
  },
} as const;

const styles = stylex.create({
  button: {
    position: "relative",
    width: "2.75rem",
    height: "2.75rem",
    marginRight: "-0.875rem",
    borderRadius: "999px",
    // The nav blends with `difference`, so a faint white fill reads as a tint on either theme.
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover) and (pointer: fine)": { default: "transparent", ":hover": colors.blendHover },
    },
    transitionProperty: "transform, background-color",
    transitionDuration: "120ms, 200ms",
    transitionTimingFunction: motion.outUi,
    transform: {
      default: null,
      "@media (prefers-reduced-motion: no-preference)": { default: null, ":active": "scale(0.95)" },
    },
  },
});
