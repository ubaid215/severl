import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "example.com",
      "images.unsplash.com",
      "plus.unsplash.com",
      "picsum.photos",
      "via.placeholder.com",
      "your-actual-image-domain.com", // Replace with your real domain
    ],
  },
};

export default nextConfig;
