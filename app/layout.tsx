import "./assets/globals.css";

import { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { keywords } from "@/lib/keywords";
import clsx from "clsx";
import { Nav } from "./components/Nav";
import { Analytics } from "@vercel/analytics/react";
import { imageUrl } from "@/lib/imageUrl";
import TransitionProvider from "./components/TransitionProvider";

const SaansFont = localFont({
  src: "./saans-font.woff2",
  display: "swap",
});

const JetBrainsMonoFont = JetBrains_Mono({
  display: "swap",
  variable: "--font-monospace",
  subsets: ["latin"],
});

export async function generateMetadata() {
  return {
    title: "Ali Alshehri - Software Engineer",
    description:
      "Ali Alshehri is a software engineer based in Al khobar, working on pushing the boundary between front-end and back-end utilizing full-stack.",
    openGraph: {
      title: "Ali Alshehri - Software Engineer",
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
  image: "https://ali-sh.com/avatar.jpeg",
  url: "https://ali-sh.com",
  jobTitle: "Software Engineer",
  sameAs: [
    "https://x.com/alicantcode",
    "https://www.github.com/AlshehriAli0",
    "https://www.linkedin.com/in/ali-alshehri-340b26284",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="Bi6gdlrmvQ1g0lpGqT81tmb889eL-vOmUt4nXy1Dzms"
        />
        <meta property="og:url" content="https://www.ali-sh.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={clsx(
          SaansFont.className,
          JetBrainsMonoFont.variable,
          "bg-slate-50"
        )}
      >
        <div className="max-w-2xl lg:max-w-xl mx-auto">
          <Nav />
          <TransitionProvider>{children}</TransitionProvider>

          <footer className="px-4 md:px-0 border-t border-slate-200 py-8 text-slate-700 font-mono text-xs tracking-tight flex justify-between">
            <p>
              &copy; {new Date().getFullYear()} {"/"} Ali Alshehri
            </p>
            <p>{/* <Link href="">View Source</Link> */}</p>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
