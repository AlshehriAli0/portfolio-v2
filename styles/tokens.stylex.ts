import * as stylex from "@stylexjs/stylex";

// Values live in styles/palette.ts. Each token points at the custom property that
// pages/_app.tsx declares from it; those pick a light or dark value from the
// `color-scheme` the theme script sets on <html>, so nothing re-renders to change theme.
// StyleX needs literals here, so keep the names in step with cssVar() in palette.ts.
export const colors = stylex.defineVars({
  bg: "var(--c-bg)",
  raised: "var(--c-raised)",
  fg: "var(--c-fg)",
  dim: "var(--c-dim)",
  faint: "var(--c-faint)",
  line: "var(--c-line)",
  lineStrong: "var(--c-line-strong)",
  // The one emphatic fill (ink/paper inversion); text on it is accentInk.
  accent: "var(--c-accent)",
  accentInk: "var(--c-accent-ink)",
  highlight: "var(--c-highlight)",
  tint: "var(--c-tint)",
  shadow: "var(--c-shadow)",
  // White for the nav's `mix-blend-mode: difference` (see palette.ts).
  blend: "var(--c-blend)",
  blendHover: "var(--c-blend-hover)",
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
