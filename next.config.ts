import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb, too small for photos. Image itself is capped at 4 MB in lib/listingRules.ts
      bodySizeLimit: "5mb",
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
