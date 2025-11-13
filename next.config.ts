import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "example.com",
      "images.unsplash.com",
      "plus.unsplash.com",
      "picsum.photos",
      "via.placeholder.com",
      "your-actual-image-domain.com",
    ],
    // 👇 Add this line for Next.js 16
    qualities: [75, 85, 90], // include all quality levels you use in your <Image> components

    // Disable optimization in development to avoid timeout issues
    unoptimized: process.env.NODE_ENV === 'development',

    // Increase cache time to reduce repeated requests
    minimumCacheTTL: 300, // 5 minutes
  },
};

export default nextConfig;
