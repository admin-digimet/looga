import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'pqecuknwvwgdjjemfyjk.supabase.co' },
      { hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
