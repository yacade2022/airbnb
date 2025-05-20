import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
