import type { Metadata } from "next";
import ServiceLandingPage, {
  type ServiceContent,
} from "@/components/ServiceLandingPage";
import WebsitePreviews from "@/components/sections/WebsitePreviews";
import imgSite1 from "@/public/website-project-01.webp";
import imgSite2 from "@/public/website-project-02.webp";
import imgSite3 from "@/public/website-project-03.webp";

export const metadata: Metadata = {
  title: "Website Design for Mobile Caterers | LocalEyes",
  description:
    "Websites built to rank, not just look good — for coffee carts, mobile bars, and catering businesses. Real client sites, engineered for search from day one.",
  alternates: {
    canonical: "/websites",
  },
};

const content: ServiceContent = {
  eyebrow: "Service — Websites",
  h1: "Websites Built to Rank, Not Just Look Good",
  subhead:
    "A beautiful site that Google can't find is a brochure. Every site we build is engineered for search from the first line of code, not decorated with SEO afterward.",
  statValue: "5-7",
  statLabel: "weeks a new domain sits in Google's sandbox before it can rank",
  proof: [
    { image: imgSite1, caption: "Side by Side — mobile espresso bar, New England" },
    { image: imgSite2, caption: "Social Graze — charcuterie and grazing tables, Sacramento" },
    { image: imgSite3, caption: "On Set Coffee — craft coffee cart catering, Los Angeles" },
  ],
  intro: {
    heading: "Design and SEO are not two separate projects",
    paragraphs: [
      "Most agencies build the website first and think about SEO later, if at all. That order costs you the single highest-leverage window a domain ever gets: Google sandboxes brand new sites for roughly five to seven weeks before ranking activity even begins in earnest. A site built without that in mind starts its ranking clock months later than it needed to.",
      "Every site we build starts from the same brief: what does the buyer actually search for, and what does the page need to say and prove to convert them once they land. That means real photography over stock, clear pricing or a clear path to it, social proof placed where it actually gets read, and page speed treated as a ranking factor, not an afterthought.",
      "The three sites above are real client work, live today: a New England mobile espresso brand, a Sacramento charcuterie and grazing-table business, and a Los Angeles coffee cart built for film and production sets. Three completely different brands, three completely different visual languages, all built on the same SEO-first foundation.",
    ],
  },
  approach: {
    heading: "What goes into every build",
    intro: "The same discipline behind every site, regardless of how different they look.",
    items: [
      {
        title: "Built for the buyer's actual search",
        body: "Page structure, headlines, and content mapped to the real terms your buyers type into Google, not generic 'about us' copy.",
      },
      {
        title: "Fast by default",
        body: "Modern, lightweight builds that load quickly on a phone at an event with bad signal — the exact conditions a lot of your traffic arrives under.",
      },
      {
        title: "Conversion paths, not just pretty pages",
        body: "Clear next steps on every page — a quote calculator, a booking form, a call button — so traffic actually turns into inquiries.",
      },
      {
        title: "A distinct brand, every time",
        body: "No shared template. Each site is designed around your actual visual identity, the way the three examples above look nothing alike.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "Website Kickstart",
    price: "$2,400",
    body: "A custom 6-page site built to rank from day one — not a template with your logo dropped in.",
    features: [
      "Custom 6-page site, designed around your brand",
      "Google Business Profile setup",
      "Analytics and call tracking wired in",
      "Lead form integrated and tested",
    ],
    buyLabel: "Buy Now — $2,400",
    buyUrl: "https://buy.stripe.com/7sYeVe2k93OR5tLe5J18c0h",
  },
  closing: {
    heading: "See what your current site is costing you",
    body: "Run the free Growth Diagnostic to see how your site, rankings, and Google presence compare to the operators winning your market right now.",
  },
};

export default function WebsitesPage() {
  return (
    <>
      <WebsitePreviews />
      <ServiceLandingPage content={content} />
    </>
  );
}
