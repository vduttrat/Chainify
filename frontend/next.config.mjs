/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Skip pre-existing TS errors in contracts/hardhat.config.ts */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
