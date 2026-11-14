import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { paletteCss } from "@/styles/palette";

// Subset to ASCII plus the few symbols the site uses. Saans stays variable (300-900)
// for the weight animations; the mono is a single static 500 instance (5 KB).
const sans = localFont({
  src: "../styles/fonts/saans.woff2",
  weight: "300 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

const mono = localFont({
  src: "../styles/fonts/mono.woff2",
  weight: "500",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// Font families and the colour palette as :root custom properties (one tag, never pruned).
const rootVars = `:root{--font-sans:${sans.style.fontFamily};--font-mono:${mono.style.fontFamily}}${paletteCss}`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: font and colour variables */}
      <style dangerouslySetInnerHTML={{ __html: rootVars }} />
      <Component {...pageProps} />
    </>
  );
}
