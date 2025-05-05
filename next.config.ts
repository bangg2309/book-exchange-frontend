import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['ui-avatars.com', 'book-exchange.com', 'res.cloudinary.com'],
  },
  /* config options here */
};

export default nextConfig;
