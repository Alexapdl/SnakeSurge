import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Solana web3.js needs these Node.js built-ins polyfilled in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: require.resolve("buffer/"),
      };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
