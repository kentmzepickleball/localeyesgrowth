import type { Metadata } from "next";
import WebsitesHero from "@/components/websites/WebsitesHero";
import WorkRing from "@/components/websites/WorkRing";
import RankingClock from "@/components/websites/RankingClock";
import BuildAnatomy from "@/components/websites/BuildAnatomy";
import RankingProof from "@/components/websites/RankingProof";
import Kickstart from "@/components/websites/Kickstart";
import WebsitesClosing from "@/components/websites/WebsitesClosing";

export const metadata: Metadata = {
  title: "Website Design for Mobile Caterers | LocalEyes",
  description:
    "Websites built to rank, not just look good — for coffee carts, mobile bars, and catering businesses. Real client sites, engineered for search from day one.",
  alternates: {
    canonical: "/websites",
  },
};

/* The websites page has its own sections, top to bottom: the billboard
   hero, every site we've built in a ring, why design and SEO are one
   project, the anatomy of a build, the home page's Google results, the
   Kickstart rate card, and the closing call to the Growth Diagnostic. */

const intro = {
  lead: "Design and SEO are",
  accent: "not two separate projects",
  paragraphs: [
    "Most agencies build the website first and think about SEO later, if at all. That order costs you the single highest-leverage window a domain ever gets: Google sandboxes brand new sites for roughly five to seven weeks before ranking activity even begins in earnest. A site built without that in mind starts its ranking clock months later than it needed to.",
    "Every site we build starts from the same brief: what does the buyer actually search for, and what does the page need to say and prove to convert them once they land. That means real photography over stock, clear pricing or a clear path to it, social proof placed where it actually gets read, and page speed treated as a ranking factor, not an afterthought.",
    "Every site above is real client work: a New England mobile espresso brand, a Sacramento charcuterie and grazing-table business, a Los Angeles coffee cart built for film and production sets, and six more. Completely different brands, completely different visual languages, all built on the same SEO-first foundation.",
  ],
  stat: "5-7",
  statLabel: "weeks a new domain sits in Google's sandbox before it can rank",
};

const approach = {
  lead: "What goes into",
  accent: "every build",
  intro: "The same discipline behind every site, regardless of how different they look.",
  items: [
    {
      title: "Built for the buyer's actual search",
      body: "Page structure, headlines, and content mapped to the real terms your buyers type into Google, not generic 'about us' copy.",
    },
    {
      title: "Fast by default",
      body: "Modern, lightweight builds that load quickly on a phone at an event with bad signal, the exact conditions a lot of your traffic arrives under.",
    },
    {
      title: "Conversion paths, not just pretty pages",
      body: "Clear next steps on every page: a quote calculator, a booking form, a call button. So traffic actually turns into inquiries.",
    },
    {
      title: "A distinct brand, every time",
      body: "No shared template. Each site is designed around your actual visual identity, the way the sites above look nothing alike.",
    },
  ],
};

const kickstart = {
  name: "Website Kickstart",
  price: "$2,400",
  body: "A custom 6-page site built to rank from day one. Not a template with your logo dropped in.",
  features: [
    "Custom 6-page site, designed around your brand",
    "Google Business Profile setup",
    "Analytics and call tracking wired in",
    "Lead form integrated and tested",
  ],
  buyLabel: "Buy Now",
  buyUrl: "https://buy.stripe.com/7sYeVe2k93OR5tLe5J18c0h",
};

const closing = {
  lead: "See what your current site is",
  accent: "costing you",
  body: "Run the free Growth Diagnostic to see how your site, rankings, and Google presence compare to the operators winning your market right now.",
};

export default function WebsitesPage() {
  return (
    <main className="relative w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <WebsitesHero />
      <WorkRing />
      <RankingClock {...intro} />
      <BuildAnatomy {...approach} />
      <RankingProof />
      <Kickstart plan={kickstart} />
      <WebsitesClosing {...closing} buyLabel={kickstart.buyLabel} buyUrl={kickstart.buyUrl} />
    </main>
  );
}
