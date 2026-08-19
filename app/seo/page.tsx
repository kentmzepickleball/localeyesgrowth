import type { Metadata } from "next";
import ServiceLandingPage, {
  type ServiceContent,
} from "@/components/ServiceLandingPage";
import imgRankings from "@/public/services-01-ranking.png";
import imgTraffic from "@/public/traffic.jpeg";
import imgRevenue from "@/public/revenues-localeyes.jpeg";

export const metadata: Metadata = {
  title: "SEO Services for Mobile Caterers | LocalEyes",
  description:
    "Local SEO built to move rankings, traffic, and revenue — for coffee carts, mobile bars, and every kind of caterer. Real client results, not promises.",
  alternates: {
    canonical: "/seo",
  },
};

const content: ServiceContent = {
  eyebrow: "Service — SEO",
  h1: "SEO That Turns Searches Into Booked Events",
  subhead:
    "Rankings, traffic, and revenue — in that order, because one causes the next. Here is what we actually do, and the real client results behind it.",
  statValue: "+68",
  statLabel: "positions a single keyword climbed for a client in weeks",
  proof: [
    { image: imgRankings, caption: "A client's best-performing keywords, all now ranking on page one", fit: "contain" },
    { image: imgTraffic, caption: "Active users trending up over the following 60 days", fit: "contain" },
    { image: imgRevenue, caption: "Quarterly revenue up 75% over the previous quarter", fit: "contain" },
  ],
  intro: {
    heading: "Rankings are the lever. Bookings are the point.",
    paragraphs: [
      "Most SEO for mobile caterers is generic: a template audit, a handful of blog posts, a monthly report nobody reads. We build the system specifically for this industry — coffee carts, mobile bars, charcuterie catering, and everything between — because a coffee cart and a wedding bartender rank for completely different searches, and a template treats them the same.",
      "The work starts with the two foundations almost every operator gets wrong: the Google Business Profile category (the single highest-leverage setting on the whole profile) and a site actually structured around what a buyer searches, not what the business wants to say about itself. Everything else compounds on top of those two things being right.",
      "We do not sell SEO as a black box. Every client sees the actual rankings, the actual traffic, the actual review velocity — the same kind of screenshots shown above, from real accounts, updated as the work happens.",
    ],
  },
  approach: {
    heading: "What the work actually includes",
    intro: "Five disciplines, running together, not sold separately.",
    items: [
      {
        title: "Google Business Profile optimization",
        body: "Correct category, complete service-area configuration, and an ongoing posting and photo cadence that keeps the profile active in Google's eyes.",
      },
      {
        title: "Site architecture and on-page SEO",
        body: "Pages structured around real search intent — service pages, location pages, and content that targets exactly what your buyers type into Google.",
      },
      {
        title: "Local citations and NAP consistency",
        body: "Name, address, and phone identical everywhere your business appears — the unglamorous foundation that convinces Google, and now AI systems, that you're real.",
      },
      {
        title: "Review acquisition systems",
        body: "A structured process for turning every event into a review, not a hope that happy clients remember to leave one.",
      },
      {
        title: "Monthly content and backlinks",
        body: "New pages and links every month, targeted at the searches that are actually worth ranking for in your specific market.",
      },
    ],
  },
  closing: {
    heading: "See what your SEO is actually doing today",
    body: "Run the free Growth Diagnostic to see where your rankings, Google Business Profile, and site stand right now, and what would move first.",
  },
};

export default function SeoPage() {
  return <ServiceLandingPage content={content} />;
}
