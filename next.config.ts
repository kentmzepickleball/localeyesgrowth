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
      /* blog cleanup, Nov 2026: weak posts removed, each sent to the
         page that now covers it */
      ...[
        ["mobile-caterer-lead-to-booking-playbook", "/blog/local-seo-for-mobile-caterers"],
        ["why-mobile-caterers-get-zero-leads-from-google", "/blog/local-seo-for-mobile-caterers"],
        ["why-google-reviews-outrank-your-website", "/blog/how-to-get-more-google-reviews-catering"],
        ["catering-niche-down", "/blog"],
        ["catering-intake-form", "/websites-for-event-businesses"],
        ["5-minute-rule-quote-speed", "/blog"],
      ].map(([slug, destination]) => ({
        source: `/blog/${slug}`,
        destination,
        statusCode: 301 as const,
      })),
    ];
  },
};

export default nextConfig;
