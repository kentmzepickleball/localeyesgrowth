import type { Metadata } from "next";
import ServiceLandingPage, {
  type ServiceContent,
} from "@/components/ServiceLandingPage";
import imgAdsResults from "@/public/google-ads-performance-dashboard.webp";
import imgAdsTraffic from "@/public/user-activity-over-time-analytics-dashboard.webp";

export const metadata: Metadata = {
  title: "Google Ads for Mobile Caterers | LocalEyes",
  description:
    "Paid search built to bridge the gap while your SEO ranks — for coffee carts, mobile bars, and catering businesses. Real campaign results, not projections.",
  alternates: {
    canonical: "/ads",
  },
};

const content: ServiceContent = {
  eyebrow: "Service — Ads",
  h1: "Paid Search That Bridges the Gap While SEO Ranks",
  subhead:
    "SEO takes months to compound. Ads put you in front of buyers this week — the two working together is how you stop losing bookings while you wait to rank.",
  statValue: "+233%",
  statLabel: "conversion increase for a client's Google Ads account in one week",
  proof: [
    { image: imgAdsResults, caption: "One week of Google Ads results: conversions up 233%, cost per conversion down 71%", fit: "contain" },
    { image: imgAdsTraffic, caption: "User activity climbing over the following 60 days as the campaign matured", fit: "contain" },
  ],
  intro: {
    heading: "Ads is not a replacement for SEO. It is the bridge to it.",
    paragraphs: [
      "A brand new domain can sit in Google's sandbox for five to seven weeks before it starts ranking at all, and organic growth compounds slowly even after that. Paid search is the lever that gets you in front of buyers immediately, on the exact high-intent searches — \"coffee catering near me,\" \"mobile bartender for wedding\" — while the organic side of the account is still building.",
      "We run ads the same way we run SEO: built specifically for mobile catering, not a generic template applied to any local business. That means targeting the searches that actually convert to bookings, not just clicks, and campaign structures built around your real service area and your real event minimums so the budget isn't spent on the wrong buyer.",
      "The account above went from a slow trickle of leads to a 233 percent increase in conversions in a single week, with cost per conversion down 71 percent over the same period. That's what a campaign built for this industry, instead of adapted from a generic one, actually looks like.",
    ],
  },
  approach: {
    heading: "How we run a campaign",
    intro: "Built to convert from day one, then tightened continuously from real data.",
    items: [
      {
        title: "Intent-first keyword targeting",
        body: "Campaigns built around the exact phrases a buyer with a date and a budget actually searches, not broad terms that burn spend on browsers.",
      },
      {
        title: "Landing pages that match the ad",
        body: "Every campaign points to a page built for that specific search, not your homepage — the single biggest lever on cost per conversion.",
      },
      {
        title: "Budget matched to your real capacity",
        body: "Spend paced to what your calendar can actually absorb, so paid leads convert instead of overwhelming a business that can't service them yet.",
      },
      {
        title: "Weekly optimization, not a set-and-forget campaign",
        body: "Bids, negative keywords, and ad copy adjusted continuously against real conversion data, not reviewed once a quarter.",
      },
    ],
  },
  closing: {
    heading: "See where paid search fits your growth plan",
    body: "Run the free Growth Diagnostic to see how your current visibility compares to the operators winning your market, and whether ads or SEO should come first.",
  },
};

export default function AdsPage() {
  return <ServiceLandingPage content={content} />;
}
