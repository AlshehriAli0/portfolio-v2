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

export default nextConfig;
