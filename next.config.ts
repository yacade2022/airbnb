import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb, too small for photos. Image itself is capped at 4 MB in utils/actions.ts
      bodySizeLimit: "5mb",
    },
  },
  images :{
    remotePatterns:[
      {
        "hostname":"a0.muscache.com",
        "protocol":"https"
      },
      {
        protocol: 'https',
        hostname: 'wvzctzuqefnnxxpfapak.supabase.co',
      }
    ]
  }
};

export default nextConfig;
