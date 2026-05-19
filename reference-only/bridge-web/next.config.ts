import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "@layerzerolabs/oft-v2-solana-sdk",
    "@metaplex-foundation/mpl-toolbox",
  ],
  webpack: (config, { isServer }) => {
    // LayerZero `toWeb3Connection` uses `instanceof Connection`. Nested deps pull
    // @solana/web3.js@1.95.x while the app uses 1.98.x — two classes → "Invalid connection".
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/web3.js": path.resolve(
        process.cwd(),
        "node_modules/@solana/web3.js"
      ),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
