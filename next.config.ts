import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* pages that moved keep their old addresses working, for visitors,
     old links and Google alike */
  async redirects() {
    return [
      {
        source: "/websites",
        destination: "/websites-for-event-businesses",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
