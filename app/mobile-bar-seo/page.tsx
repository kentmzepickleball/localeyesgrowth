import type { Metadata } from "next";
import IndustryLandingPage, {
  type IndustryContent,
} from "@/components/IndustryLandingPage";

export const metadata: Metadata = {
  title: "SEO for Mobile Bar & Bartending Businesses | LocalEyes",
  description:
    "Local SEO built for mobile bar and dry-hire bartending operators — the licensing-aware messaging, wedding-and-corporate dual positioning, and review systems that actually move bookings.",
  alternates: {
    canonical: "/mobile-bar-seo",
  },
};

const content: IndustryContent = {
  eyebrow: "Industry Focus — Mobile Bars",
  h1: "SEO for Mobile Bar & Bartending Businesses",
  subhead:
    "A mobile bar sits at a higher price point and a more complicated legal picture than most catering. Your SEO and your site need to handle both correctly — most don't.",
  statValue: "$1,750+",
  statLabel: "typical minimum for a mobile bar booking nationally",
  intro: {
    heading: "Mobile bar search intent is licensing-aware, whether you address it or not",
    paragraphs: [
      "Anyone searching for a mobile bar or a wedding bartender is, whether they say it out loud or not, also trying to figure out how the alcohol works. Dry hire, where the client purchases the alcohol and you provide staffing, equipment, and service, is the dominant model for most operators, but very few mobile bar websites explain that clearly. A site that answers the licensing question up front converts better than one that makes a buyer email to ask.",
      "Mobile bars also live at the intersection of two very different buyer types: wedding couples booking the single biggest event of their year, and corporate planners booking a brand activation on a recurring budget cycle. Weddings carry more emotional investment and often a higher willingness to pay for the right fit; corporate bookings are less emotionally charged but book with more predictability and repeat more often. A site built for only one of these reads as the wrong fit to the other.",
      "Because a mobile bar is a higher-consideration purchase than most catering, roughly 90 percent of buyers look for some form of social proof before they book. Review quality and quantity matter more here than in almost any other vertical we work in — and reviews that mention a specific bartender by name, or a specific venue, do double duty by feeding local relevance straight back into your rankings.",
    ],
  },
  approach: {
    heading: "How we approach mobile bar SEO",
    intro:
      "The system is built around the two things that actually decide whether a mobile bar gets chosen: trust and fit for the specific type of event being planned.",
    items: [
      {
        title: "Clear, upfront dry-hire and licensing messaging",
        body: "Your site should answer \"how does the alcohol work\" before a buyer has to ask — reducing the email back-and-forth that costs you bookings to faster-responding competitors.",
      },
      {
        title: "Separate positioning for weddings and corporate activations",
        body: "Distinct pages, distinct proof, and distinct pricing framing for each buyer type, instead of one generic page trying to convert both at once.",
      },
      {
        title: "A review and reputation system built for a higher-consideration buyer",
        body: "Staff-level incentives, on-site QR capture, and a post-event follow-up sequence engineered to produce the volume and specificity a mobile bar's higher price point requires.",
      },
      {
        title: "Google Business Profile and local presence tuned for your real service area",
        body: "Correct category, service-area configuration, and citation consistency — the foundation that decides whether you're visible for \"mobile bartender near me\" in every city you actually serve.",
      },
    ],
  },
  closing: {
    heading: "See where your mobile bar's visibility actually stands",
    body: "Run the free Growth Diagnostic and get a scored read on your rankings, Google Business Profile, and site — plus the specific fixes ranked by what will move bookings first.",
  },
};

export default function MobileBarSeoPage() {
  return <IndustryLandingPage content={content} />;
}
