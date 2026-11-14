import * as stylex from "@stylexjs/stylex";

// One token carries both palettes via light-dark(); the theme script flips
// `color-scheme` on <html>, so nothing has to re-render to change theme.
export const colors = stylex.defineVars({
  bg: "light-dark(#f2f0ea, #0a0a0a)",
  raised: "light-dark(#e9e6de, #131312)",
  fg: "light-dark(#0b0b0b, #ecebe6)",
  dim: "light-dark(#5f5d56, #8d8c86)",
  line: "light-dark(rgb(11 11 11 / 0.12), rgb(236 235 230 / 0.1))",
  lineStrong: "light-dark(rgb(11 11 11 / 0.28), rgb(236 235 230 / 0.22))",
  // single accent, used as a fill (never as small text on paper)
  accent: "#d4ff3a",
  accentInk: "#0b0b0b",
});

export const fonts = stylex.defineVars({
  mono: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
});

export const layout = stylex.defineVars({
  gutter: "clamp(1rem, 3.2vw, 2.75rem)",
  max: "1440px",
});

export const motion = stylex.defineVars({
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  // Snappier ease-out for small UI responses: hover arrows, presses, icon swaps.
  outUi: "cubic-bezier(0.23, 1, 0.32, 1)",
});
