// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ─── Images ───────────────────────────────────────────────────────────────
  images: {
    
    // Use remotePatterns (replaces deprecated `domains`)
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
      // ⚠️  Replace with your real production image CDN:
      { protocol: "https", hostname: "several.life" },
    ],

    qualities: [25, 50, 75, 90, 85],

    // Keep Next.js image optimisation ON in every environment
    // (disable only if you have an upstream CDN doing its own resizing)
    unoptimized: false,

    // 10-min CDN cache for processed images
    minimumCacheTTL: 600,

    // Modern formats – browser picks the best one automatically
    formats: ["image/avif", "image/webp"],
  },

  // ─── Compression ──────────────────────────────────────────────────────────
  compress: true, // gzip responses from the Node server

  // ─── Compiler ─────────────────────────────────────────────────────────────
  compiler: {
    // Remove console.* calls in production (keep console.error)
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // ─── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    // Inline critical CSS – cuts First Contentful Paint noticeably
    optimizeCss: true,
  },
};

export default withBundleAnalyzer(nextConfig);

/*
 * HOW TO RUN THE BUNDLE ANALYSER:
 *   ANALYZE=true pnpm build
 *   Two HTML reports open automatically in your browser.
 *
 * HOW TO INSTALL:
 *   pnpm add -D @next/bundle-analyzer
 */