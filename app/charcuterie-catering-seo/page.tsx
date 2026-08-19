import type { Metadata } from "next";
import IndustryLandingPage, {
  type IndustryContent,
} from "@/components/IndustryLandingPage";

export const metadata: Metadata = {
  title: "SEO for Charcuterie Catering Businesses | LocalEyes",
  description:
    "Local SEO built for grazing table and charcuterie catering operators — the visual-first discovery, health permit clarity, and local search strategy that actually moves bookings.",
  alternates: {
    canonical: "/charcuterie-catering-seo",
  },
};

const content: IndustryContent = {
  eyebrow: "Industry Focus — Charcuterie Catering",
  h1: "SEO for Charcuterie Catering Businesses",
  subhead:
    "Charcuterie sells on sight before it sells on search. We build the local SEO that turns that visual appeal into the searches that actually convert to bookings.",
  statValue: "2-3",
  statLabel: "hours of setup work behind every grazing table, priced into every quote",
  intro: {
    heading: "Charcuterie is a visual-first business that still needs to win on search",
    paragraphs: [
      "A grazing table or charcuterie board sells itself the moment someone sees a photo of it — which is exactly why so many charcuterie operators lean entirely on Instagram and let their actual Google presence go quiet. That's a real gap, because the buyer who searches \"charcuterie catering near me\" already has a date and a budget, and if your Google Business Profile and site don't show up for that search, the visual work you're doing on social media never gets the chance to convert.",
      "Charcuterie also carries its own operational and legal picture that belongs on your site, not buried in a DM thread: a health permit tied to a commercial kitchen relationship, or a cottage food license where that's allowed for home-based prep. Buyers comparing operators notice which ones address this clearly and which ones don't, and it's a real trust signal in a category where food safety is an obvious, unspoken concern.",
      "Setup and presentation are the actual product here, not the food cost. A grazing table commonly represents two to three hours of build time before a single guest arrives, and that labor, not the ingredients, is what a fair quote is pricing. A site that explains that clearly converts better than one that just lists a per-person rate with no context for what's actually included.",
    ],
  },
  approach: {
    heading: "How we approach charcuterie catering SEO",
    intro:
      "The system connects the visual work you're already doing to the local searches that actually turn into booked events.",
    items: [
      {
        title: "A Google Business Profile built to carry your visual proof",
        body: "Correct catering category, a photo strategy that mirrors what already performs on social, and a profile structured to convert a visual-first buyer the moment they land on it.",
      },
      {
        title: "Service pages that explain setup, not just menu",
        body: "Clear pages covering what a grazing table or board package actually includes — presentation, setup and breakdown, dietary accommodations — so pricing reads as fair instead of arbitrary.",
      },
      {
        title: "Review and reputation systems that capture your best visual proof",
        body: "A post-event sequence built to request photo-included reviews, since a review with your own presentation photography is doing double duty as both trust signal and portfolio.",
      },
      {
        title: "Local search visibility that doesn't depend on social algorithms",
        body: "Rankings, citations, and content that keep bringing in booked events even on the weeks your last post didn't perform the way you needed it to.",
      },
    ],
  },
  closing: {
    heading: "See where your charcuterie business's visibility actually stands",
    body: "Run the free Growth Diagnostic and get a scored read on your rankings, Google Business Profile, and site — plus the specific fixes ranked by what will move bookings first.",
  },
};

export default function CharcuterieCateringSeoPage() {
  return <IndustryLandingPage content={content} />;
}
