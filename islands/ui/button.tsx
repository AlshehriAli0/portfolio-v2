import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, motion } from "@/styles/tokens.stylex";

type Props = {
  children: ReactNode;
  onClick: () => void;
  /** `primary` fills with the foreground; `secondary` is outlined. */
  variant?: "primary" | "secondary";
};

/** A 44px command button. */
export function Button({ children, onClick, variant }: Props) {
  return (
    <button type="button" data-variant={variant ?? "primary"} onClick={onClick} {...stylex.props(styles.button)}>
      {children}
    </button>
  );
}

const SECONDARY = ':is([data-variant="secondary"])';
const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const styles = stylex.create({
  button: {
    height: "44px",
    paddingInline: "1.125rem",
    borderWidth: { default: 0, [SECONDARY]: "1px" },
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    // Hover only for a fine pointer, so a tap never leaves it stuck on.
    backgroundColor: {
      default: colors.fg,
      ":active": colors.dim,
      [SECONDARY]: {
        default: "transparent",
        ":hover": { default: null, [HOVER]: colors.line },
        ":active": colors.line,
      },
    },
    opacity: { default: null, ":hover": { default: null, [HOVER]: 0.88 }, [SECONDARY]: null },
    color: { default: colors.bg, [SECONDARY]: colors.fg },
    font: "inherit",
    cursor: "pointer",
    // Press feedback; under reduced motion the darker tone above still shows the press.
    transform: { default: null, ":active": { default: "scale(0.97)", [REDUCE]: null } },
    transitionProperty: "transform, opacity, background-color",
    // The press is the deliberate half (120ms); the release snaps back (80ms).
    transitionDuration: { default: "80ms, 150ms, 150ms", ":active": "120ms, 0ms, 0ms" },
    transitionTimingFunction: motion.outUi,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: colors.fg,
    outlineOffset: "2px",
  },
});
