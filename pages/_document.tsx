import * as stylex from "@stylexjs/stylex";
import Document, { type DocumentContext, Head, Html, Main, NextScript } from "next/document";
import { clientScript, speculationRules, themeScript } from "@/lib/client-script";
import { builtCss, pruneCss } from "@/lib/prune-css";
import { site, socials, themeBg } from "@/lib/site";
import { paletteCss } from "@/styles/palette";
import { colors, fonts } from "@/styles/tokens.stylex";

/**
 * CSS ships inlined and pruned per page (see getInitialProps), so the stylesheet
 * <link> tags Next would add are dropped: first paint never waits on a request.
 */
class InlineCssHead extends Head {
  getCssLinks() {
    return [];
  }
}

const profiles = socials.filter(s => s.href.startsWith("https://")).map(s => s.href);

export default class SiteDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initial = await ctx.defaultGetInitialProps(ctx);
    // <body> and the skip link render outside <Main>, so add their classes explicitly.
    const shell = `class="${stylex.props(styles.body).className} ${stylex.props(styles.skip).className}"`;
    const pruned = pruneCss(builtCss(), initial.html + shell);
    // The @font-face rules get a <style> of their own, identical on every page, so a soft
    // navigation (lib/client-script.ts) keeps it. Swapping it with the page CSS would make
    // Chrome reload the faces and draw one frame of every word in the fallback font.
    const fontFaces = pruned.match(/@font-face\s*{[^}]*}/g) ?? [];
    const css = fontFaces.reduce((rest, face) => rest.replace(face, ""), pruned);
    return {
      ...initial,
      styles: (
        <>
          {initial.styles}
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: our own compiled CSS */}
          <style data-fonts="" dangerouslySetInnerHTML={{ __html: fontFaces.join("") }} />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: our own compiled CSS, pruned to this page */}
          <style dangerouslySetInnerHTML={{ __html: css }} />
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang="en" suppressHydrationWarning>
        <InlineCssHead>
          {/* First paint in the right colours, light or dark, even on a cold load: the
              browser picks its own dark or light canvas from color-scheme before any CSS,
              and the palette and the stored theme apply before <body> is read. */}
          <meta name="color-scheme" content="light dark" />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the colour palette (one tag, never pruned) */}
          <style
            data-palette=""
            dangerouslySetInnerHTML={{ __html: `${paletteCss}:root{background-color:var(--c-bg)}` }}
          />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content={themeBg.light} />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content={themeBg.dark} />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: theme must apply before first paint */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <meta name="google-site-verification" content="Bi6gdlrmvQ1g0lpGqT81tmb889eL-vOmUt4nXy1Dzms" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <link rel="alternate" type="application/rss+xml" title={`${site.name}’s writing`} href="/feed.xml" />
          {/* llms.txt v2: the agent-readable index that describes this site. */}
          <link rel="describedby" type="text/markdown" href="/llms.txt" />
          {/* Identity: these profiles are Ali's (rel="me", for profile verification). */}
          {profiles.map(href => (
            <link key={href} rel="me" href={href} />
          ))}
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: prefetch for the full loads soft navigation falls back to */}
          <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculationRules }} />
        </InlineCssHead>
        <body id="top" {...stylex.props(styles.body)}>
          <a href="#main" {...stylex.props(styles.skip)}>
            Skip to content
          </a>
          <Main />
          <NextScript />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the site's only client JS */}
          <script dangerouslySetInnerHTML={{ __html: clientScript }} />
        </body>
      </Html>
    );
  }
}

const styles = stylex.create({
  // Font family and weight come from `html` in globals.css.
  body: {
    backgroundColor: colors.bg,
    color: colors.fg,
  },
  skip: {
    position: "fixed",
    top: "0.75rem",
    left: "0.75rem",
    zIndex: 100,
    paddingBlock: "0.85rem",
    paddingInline: "1rem",
    backgroundColor: colors.accent,
    color: colors.accentInk,
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    // Clipped away, not moved off-screen: Safari draws the page above the viewport under
    // its status bar, so a link parked up there would show through.
    clipPath: { default: "inset(50%)", ":focus-visible": "none" },
  },
});
