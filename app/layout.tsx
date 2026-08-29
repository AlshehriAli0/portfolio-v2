import * as stylex from "@stylexjs/stylex";
import "./assets/globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { colors } from "@/app/tokens.stylex";
import { imageUrl } from "@/lib/imageUrl";
import { keywords } from "@/lib/keywords";
import { Nav } from "./components/Nav";
import { PrefetchProvider } from "./components/prefetch-provider";
import TransitionProvider from "./components/TransitionProvider";
import { ThemeProvider } from "./components/theme-provider";

export async function generateMetadata() {
  return {
    title: {
      default: "Ali Alshehri - Software Engineer",
      template: "%s | Ali Alshehri",
    },
    description:
      "Ali Alshehri is a software engineer based in Al khobar, working on pushing the boundary between front-end and back-end utilizing full-stack.",
    openGraph: {
      title: "Ali Alshehri - Software Engineer",
      type: "website",
      url: "https://ali-sh.com",
      images: [
        {
          url: imageUrl("/open-graph.png"),
          width: 1200,
          height: 630,
          alt: "Ali Alshehri - Software Engineer",
        },
      ],
      siteName: "Ali Alshehri - Software Engineer",
    },
    twitter: {
      card: "summary_large_image",
      site: "@alicantcode",
      creator: "@alicantcode",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
        maxVideoPreview: -1,
      },
    },
    icons: {
      icon: "/icon.svg",
    },
    keywords,
    metadataBase: new URL("https://ali-sh.com"),
  } as Metadata;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ali Alshehri",
  image: "https://ali-sh.com/open-graph.png",
  url: "https://ali-sh.com",
  jobTitle: "Software Engineer",
  alternateName: ["Ali Al-Shehri", "Ali Al Shehri", "Alshehri Ali", "@alicantcode"],
  sameAs: [
    "https://x.com/alicantcode",
    "https://www.github.com/AlshehriAli0",
    "https://www.linkedin.com/in/ali-alshehri-340b26284",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: prevent dark mode flash
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.style.colorScheme="light"}}catch(e){}})()`,
          }}
        />
        <link rel="preload" href="/fonts/saans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <meta name="google-site-verification" content="Bi6gdlrmvQ1g0lpGqT81tmb889eL-vOmUt4nXy1Dzms" />

        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: seo */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: seo
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ali Alshehri - Software Engineer",
              url: "https://ali-sh.com",
            }),
          }}
        />
      </head>
      <body {...stylex.props(styles.body)}>
        <ThemeProvider>
          <div {...stylex.props(styles.container)}>
            <PrefetchProvider>
              <Nav />
              <TransitionProvider>{children}</TransitionProvider>
            </PrefetchProvider>

            <footer {...stylex.props(styles.footer)}>
              <p>
                &copy; {new Date().getFullYear()} {"/"} Ali Alshehri
              </p>
              <p>{/* <Link href="">View Source</Link> */}</p>
            </footer>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}


const styles = stylex.create({
  container: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: {
      default: "36rem",
      "@media (min-width: 1024px)": "42rem",
    },
  },
  body: {
    fontFamily: "var(--font-sans)",
    backgroundColor: colors.bg,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.border,
    paddingLeft: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
    paddingRight: { default: "1.5rem", "@media (min-width: 768px)": "0px" },
    paddingTop: "2rem",
    paddingBottom: "2rem",
    fontFamily: "var(--font-monospace)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "-0.025em",
    color: colors.footer,
  },
});
