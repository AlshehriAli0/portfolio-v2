/**
 * The site's only colour values. Every other file reads a role from here:
 * - CSS (StyleX tokens, prose.module.css, globals.css) uses the `--c-*` custom properties
 *   that `paletteCss` declares on :root (inlined by pages/_app.tsx).
 * - JS that needs a raw value (theme-color meta, the theme script, the manifest, OG images)
 *   imports `palette` directly.
 * scripts/check-colors.ts fails the build on a colour literal anywhere else.
 */
type Role = { light: string; dark: string };

export const palette = {
  /** Page background: warm paper / near-black ink. */
  bg: { light: "#f2f0ea", dark: "#0a0a0a" },
  /** Surfaces that sit on the page: code blocks, inline code. */
  raised: { light: "#e9e6de", dark: "#131312" },
  /** Text. */
  fg: { light: "#0b0b0b", dark: "#ecebe6" },
  /** Secondary text: labels, metadata. */
  dim: { light: "#5f5d56", dark: "#8d8c86" },
  /** Decoration only (list markers, OG crosses), never text that must be read. */
  faint: { light: "#a3a097", dark: "#4c4b47" },
  /** Hairlines. */
  line: { light: "rgba(11, 11, 11, 0.12)", dark: "rgba(236, 235, 230, 0.1)" },
  /** Stronger rules: underlines, borders of controls. */
  lineStrong: { light: "rgba(11, 11, 11, 0.28)", dark: "rgba(236, 235, 230, 0.22)" },
  /**
   * The one emphatic fill: ink on paper, paper on ink, the same inversion as active
   * buttons and segmented controls. Text on it uses accentInk (about 18:1 either theme).
   */
  accent: { light: "#0b0b0b", dark: "#ecebe6" },
  accentInk: { light: "#f2f0ea", dark: "#0a0a0a" },
  /** Soft fill behind text that stays `fg`: selection, prose link hover, highlighted code chars. */
  highlight: { light: "rgba(11, 11, 11, 0.12)", dark: "rgba(236, 235, 230, 0.16)" },
  /** Fainter wash for a whole highlighted code line. */
  tint: { light: "rgba(11, 11, 11, 0.045)", dark: "rgba(236, 235, 230, 0.05)" },
  /** Scroll shadows on code blocks and tables. */
  shadow: { light: "rgba(11, 11, 11, 0.18)", dark: "rgba(0, 0, 0, 0.7)" },
  /**
   * The nav draws white with `mix-blend-mode: difference`, which inverts whatever is under
   * it: ink on paper, paper on ink. It has to be pure white for the inversion to be exact,
   * so it's the same in both themes.
   */
  blend: { light: "#fff", dark: "#fff" },
  /** Hover fill inside the blended nav (the theme toggle): a faint white reads as a tint on either theme. */
  blendHover: { light: "rgba(255, 255, 255, 0.1)", dark: "rgba(255, 255, 255, 0.1)" },
} as const satisfies Record<string, Role>;

export type ColorRole = keyof typeof palette;

/** One value per theme, picked by the `color-scheme` the theme script sets on <html>. */
export const lightDark = (light: string, dark: string) => (light === dark ? light : `light-dark(${light},${dark})`);

/** `lineStrong` → `--c-line-strong`. */
export const cssVar = (role: ColorRole) => `--c-${role.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;

/** Every role as a custom property on :root, so nothing needs a re-render to change theme. */
export const paletteCss = `:root{${(Object.keys(palette) as ColorRole[])
  .map(role => `${cssVar(role)}:${lightDark(palette[role].light, palette[role].dark).replace(/,\s+/g, ",")}`)
  .join(";")}}`;
