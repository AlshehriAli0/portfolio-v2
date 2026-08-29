import path from "node:path";
import { fileURLToPath } from "node:url";
import stylexPlugin from "@stylexswc/nextjs-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  redirects: async () => {
    return [
      {
        source: "/profile",
        destination: "/",
        permanent: true,
      },
    ];
  },
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
})(nextConfig);
