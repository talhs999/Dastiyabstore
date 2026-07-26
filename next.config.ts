import type { NextConfig } from "next";

process.env.VIPS_CONCURRENCY = "2";
process.env.UV_THREADPOOL_SIZE = "4";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "smjlxepnenrcjlokpdhp.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Headers removed to allow Google Maps and other external resources without strict CSP

};

export default nextConfig;
