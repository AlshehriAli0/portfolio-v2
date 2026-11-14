import * as stylex from "@stylexjs/stylex";
import Document, { type DocumentContext, Head, Html, Main, NextScript } from "next/document";
import { clientScript, speculationRules, themeScript } from "@/lib/client-script";
import { builtCss, pruneCss } from "@/lib/prune-css";
import { site, socials, themeBg } from "@/lib/site";
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

const analytics = `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)}`;

export default class SiteDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initial = await ctx.defaultGetInitialProps(ctx);
    // <body> and the skip link render outside <Main>, so add their classes explicitly.
    const shell = `class="${stylex.props(styles.body).className} ${stylex.props(styles.skip).className}"`;
    const css = pruneCss(builtCss(), initial.html + shell);
    return {
      ...initial,
      styles: (
        <>
          {initial.styles}
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
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: hover-prerender for instant navigation */}
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
          {process.env.VERCEL ? (
            <>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Vercel Web Analytics queue */}
              <script dangerouslySetInnerHTML={{ __html: analytics }} />
              <script defer src="/_vercel/insights/script.js" />
            </>
          ) : null}
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
    transform: { default: "translateY(-200%)", ":focus-visible": "none" },
  },
});
