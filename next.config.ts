import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Prevent Next.js from trying to bundle the native `.node` binary that ships
    // with the Swiss-Ephemeris (sweph) package.  Mark the whole module as an
    // external so it is required at runtime instead (works in the Node.js
    // serverless environment used by Vercel).
    if (isServer) {
      // If the externals array doesn’t exist yet, create it.
      if (!config.externals) config.externals = [];
      config.externals.push('sweph');
    }

    // Allow Webpack to import *.node files for any other native addons by using
    // the built-in `node-loader`.
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    return config;
  },
  images: {
    domains: [
      "lh3.googleusercontent.com", // allow Google profile photos
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
