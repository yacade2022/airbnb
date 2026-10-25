import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb, too small for photos. A listing sends a cover photo and up to two gallery
      // photos, each capped at 4 MB in lib/listingRules.ts, plus the text fields
      bodySizeLimit: "13mb",
    },
  },
  images :{
    // Serve the smallest format the browser supports
    formats: ['image/avif', 'image/webp'],
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'sqpevhibbscsigsdpvvi.supabase.co',
        pathname: '/storage/v1/object/public/image/**',
      }
    ]
  }
};

export default nextConfig;
