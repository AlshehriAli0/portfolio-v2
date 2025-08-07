/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  redirects: async () => {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.ali-sh.com",
          },
        ],
        destination: "https://ali-sh.com/:path*",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
