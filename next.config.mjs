import path from "node:path";
import { fileURLToPath } from "node:url";
import stylexPlugin from "@stylexswc/nextjs-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Only post figures use next/image, in a column at most 672px wide: 1x and 2x of
  // that column plus phone widths. Fewer candidates also keeps each srcset short.
  images: {
    formats: ["image/avif", "image/webp"],
    imageSizes: [384],
    deviceSizes: [640, 828, 1080, 1344],
    // Variants of files in /public: their URLs carry no hash, so a month, not forever
    // (the default is 60 seconds, so a repeat visit revalidated every image).
    minimumCacheTTL: 2678400,
  },
  // React Compiler auto-memoizes every component. `all_errors` fails the build if
  // any component can't be compiled, so compatibility stays at 100% by construction.
  // (Next 15's config schema expects "ALL_ERRORS" and warns, but the 1.0 Babel plugin
  // only honours the lowercase value; uppercase would silently disable the check.)
  experimental: { reactCompiler: { panicThreshold: "all_errors" } },
  // Island modules are content-hashed by scripts/build-islands.ts (the manifest isn't).
  headers: async () => [
    {
      source: "/islands/:file([\\w-]+\\.js)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
  redirects: async () => [
    { source: "/profile", destination: "/", permanent: true },
    // The Markdown twins live at /posts/<slug>.md; the internal route isn't a second URL.
    { source: "/md/:slug", destination: "/posts/:slug.md", permanent: true },
  ],
  // llms.txt convention: a page's Markdown twin is its URL plus `.md` (app/md/[slug]/route.ts).
  rewrites: async () => ({
    beforeFiles: [{ source: "/posts/:slug.md", destination: "/md/:slug" }],
  }),
};

export default stylexPlugin({
  rsOptions: {
    dev: process.env.NODE_ENV !== "production",
    runtimeInjection: false,
    treeshakeCompensation: true,
    aliases: { "@/*": [path.join(__dirname, "*")] },
    unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
  },
  // ponytail: globals.css (preflight, @font-face) is unlayered and would outrank layered StyleX.
  useCSSLayers: false,
  // CSS comes from the PostCSS plugin via `@stylex` in styles/globals.css; extracting
  // here as well would ship every rule twice.
  extractCSS: false,
})(nextConfig);
