import type { Metadata } from "next";
import SeoHero from "@/components/seo/SeoHero";
import SeoDisciplines from "@/components/seo/SeoDisciplines";
import SeoResults from "@/components/seo/SeoResults";
import RankingProof from "@/components/websites/RankingProof";
import SeoGrowth from "@/components/seo/SeoGrowth";
import SeoClosing from "@/components/seo/SeoClosing";
import imgRankings from "@/public/services-01-ranking.png";
import imgTraffic from "@/public/traffic.jpeg";
import imgRevenue from "@/public/revenues-localeyes.jpeg";

export const metadata: Metadata = {
  title: "SEO Services for Mobile Caterers | LocalEyes",
  description:
    "Local SEO built to move rankings, traffic, and revenue for coffee carts, mobile bars, and every kind of caterer. Real client results, not promises.",
  alternates: {
    canonical: "/seo",
  },
};

/* The SEO page has its own sections, top to bottom, cream and dark in
   turn: the coffee bus hero, the five disciplines of the work as a rate
   card, three real dashboards in the order one causes the next, the home
   page's Google results, one client's leads month by month, and the
   closing call to the Growth Diagnostic. */

const disciplines = {
  lead: "What the work",
  accent: "actually includes",
  intro: "Five disciplines, running together, not sold separately.",
  items: [
    {
      title: "Google Business Profile optimization",
      cadence: "Every month",
      body: "Correct category, complete service-area configuration, and an ongoing posting and photo cadence that keeps the profile active in Google's eyes.",
      includes: [
        ["Category", "The most specific that fits"],
        ["Services", "Every one, written out"],
        ["Service area", "Every city you cover"],
        ["Photos", "Ten to start, then your events"],
        ["Posts", "Every month"],
        ["Reviews", "Answered within 48 hours"],
      ] as [string, string][],
    },
    {
      title: "Site architecture and on-page SEO",
      cadence: "From month one",
      body: "Pages structured around real search intent: service pages, location pages, and content that targets exactly what your buyers type into Google.",
      includes: [
        ["Technical audit", "Month one"],
        ["Existing pages", "Optimized first"],
        ["Service pages", "Before any blogs"],
        ["Location pages", "Every city you serve"],
        ["Schema", "Business, services, FAQs"],
        ["Internal links", "On every new page"],
      ] as [string, string][],
    },
    {
      title: "Local citations and NAP consistency",
      cadence: "Built once, kept clean",
      body: "Name, address, and phone identical everywhere your business appears: the unglamorous foundation that convinces Google, and now AI systems, that you're real.",
      includes: [
        ["Name, address, phone", "Word for word, everywhere"],
        ["Directories", "Yelp, BBB, Foursquare"],
        ["Event vendors", "The Knot, WeddingWire, Thumbtack"],
        ["Local", "Your chamber of commerce"],
        ["On Growth", "150, a one-time build"],
      ] as [string, string][],
    },
    {
      title: "Review acquisition systems",
      cadence: "After every event",
      body: "A structured process for turning every event into a review, not a hope that happy clients remember to leave one.",
      includes: [
        ["Before you arrive", "Signage and QR codes on the unit"],
        ["In the line", "A queue-side sign"],
        ["During", "Your team asks"],
        ["After", "An automated ask, 1 to 2 hours later"],
        ["Corporate and luxury", "A quieter version"],
      ] as [string, string][],
    },
    {
      title: "Monthly content and backlinks",
      cadence: "Every month",
      body: "New pages and links every month, targeted at the searches that are actually worth ranking for in your specific market.",
      includes: [
        ["New pages", "4 a month on Growth"],
        ["Backlinks", "4 a month on Growth"],
        ["Order", "Service and city pages first"],
        ["Earlier pages", "Improved as they climb"],
        ["Tracking", "A monthly dashboard"],
      ] as [string, string][],
    },
  ],
};

const results = {
  heading: "Rankings are the lever. Bookings are the point.",
  paragraphs: [
    "Most SEO for mobile caterers is generic: a template audit, a handful of blog posts, a monthly report nobody reads. We build the system specifically for this industry (coffee carts, mobile bars, charcuterie catering, and everything between) because a coffee cart and a wedding bartender rank for completely different searches, and a template treats them the same.",
    "The work starts with the two foundations almost every operator gets wrong: the Google Business Profile category (the single highest-leverage setting on the whole profile) and a site actually structured around what a buyer searches, not what the business wants to say about itself. Everything else compounds on top of those two things being right.",
    "We do not sell SEO as a black box. Every client sees the actual rankings, the actual traffic, the actual review velocity: the same kind of screenshots shown above, from real accounts, updated as the work happens.",
  ],
  proof: [
    { image: imgRankings, caption: "A client's best-performing keywords, all now ranking on page one" },
    { image: imgTraffic, caption: "Active users trending up over the following 60 days" },
    { image: imgRevenue, caption: "Quarterly revenue up 75% over the previous quarter" },
  ],
};

/* one client's Google Business Profile report, as it gives it: April 2025
   is under a note on the report and has no figure; May has a point and
   no figure */
const growth = {
  eyebrow: "One client, month by month",
  lead: "From 3 leads a month",
  accent: "to 152, and climbing",
  intro: "Leads from a client's Google Business Profile, every month from February 2025, when we started, to April 2026.",
  source: "From the client's Google Business Profile report, February 2025 to April 2026.",
  months: [
    { month: "Feb", year: "2025", value: 3 },
    { month: "Mar", value: 31 },
    { month: "Apr", value: null },
    { month: "May", value: 38.5, quiet: true },
    { month: "Jun", value: 48 },
    { month: "Jul", value: 50 },
    { month: "Aug", value: 65 },
    { month: "Sep", value: 85 },
    { month: "Oct", value: 84 },
    { month: "Nov", value: 97 },
    { month: "Dec", value: 87 },
    { month: "Jan", year: "2026", value: 120 },
    { month: "Feb", value: 92 },
    { month: "Mar", value: 119 },
    { month: "Apr", value: 152 },
  ],
  facts: [
    { value: 3, label: "leads in February 2025, the month we started" },
    { value: 120, label: "in January 2026, the first month over a hundred" },
    { value: 152, label: "in April 2026, the highest yet" },
    { value: 4967, prefix: "+", suffix: "%", label: "from the first month to the last" },
  ],
  report: "A written report for every client: rankings won and lost, the pages delivered, the links built, what Search Console and the profile show, and the plan for next month.",
};

const closing = {
  lead: "See what your SEO is",
  accent: "actually doing today",
  body: "Run the free Growth Diagnostic to see where your rankings, Google Business Profile, and site stand right now, and what would move first.",
};

export default function SeoPage() {
  return (
    <main className="relative w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <SeoHero />
      <SeoDisciplines {...disciplines} />
      <SeoResults {...results} />
      <RankingProof />
      <SeoGrowth {...growth} />
      <SeoClosing {...closing} />
    </main>
  );
}
