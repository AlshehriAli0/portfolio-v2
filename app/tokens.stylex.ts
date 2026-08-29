import * as stylex from "@stylexjs/stylex";

// ponytail: light-dark() instead of a theme object — the .dark class already sets
// color-scheme on <html>, so one token carries both palettes and nothing plumbs through.
// Swap to stylex.createTheme() only if a third palette ever shows up.
export const colors = stylex.defineVars({
  bg: "light-dark(rgb(248 250 252 / 1), rgb(15 15 18 / 1))",
  heading: "light-dark(rgb(2 6 23 / 1), rgb(248 250 252 / 1))",
  title: "light-dark(rgb(15 23 42 / 1), rgb(241 245 249 / 1))",
  strong: "light-dark(rgb(30 41 59 / 1), rgb(226 232 240 / 1))",
  body: "light-dark(rgb(51 65 85 / 1), rgb(203 213 225 / 1))",
  muted: "light-dark(rgb(100 116 139 / 1), rgb(148 163 184 / 1))",
  faint: "light-dark(rgb(148 163 184 / 1), rgb(100 116 139 / 1))",
  footer: "light-dark(rgb(51 65 85 / 1), rgb(148 163 184 / 1))",
  border: "light-dark(rgb(226 232 240 / 1), rgb(255 255 255 / 0.1))",
  borderStrong: "light-dark(rgb(203 213 225 / 1), rgb(255 255 255 / 0.1))",
  ctaBg: "light-dark(rgb(2 6 23 / 1), rgb(241 245 249 / 1))",
  ctaBgHover: "light-dark(rgb(30 41 59 / 1), rgb(226 232 240 / 1))",
  ctaText: "light-dark(rgb(255 255 255 / 1), rgb(2 6 23 / 1))",
  toggle: "light-dark(rgb(71 85 105 / 1), rgb(148 163 184 / 1))",
  toggleHover: "light-dark(rgb(2 6 23 / 1), rgb(248 250 252 / 1))",
});

export const fonts = stylex.defineVars({
  mono: '"JetBrains Mono", ui-monospace, Menlo, Monaco, monospace',
  sans: '"Saans", ui-sans-serif, system-ui, sans-serif',
});
