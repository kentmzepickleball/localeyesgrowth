import type { Metadata } from "next";
import IndustryLandingPage, {
  type IndustryContent,
} from "@/components/IndustryLandingPage";

export const metadata: Metadata = {
  title: "SEO for Coffee Cart & Mobile Coffee Catering Businesses | LocalEyes",
  description:
    "Local SEO built specifically for mobile coffee catering operators — the Google Business Profile category fix, seasonal timing, and review systems that actually move coffee cart bookings.",
  alternates: {
    canonical: "/coffee-cart-seo",
  },
};

const content: IndustryContent = {
  eyebrow: "Industry Focus — Coffee Carts",
  h1: "SEO for Coffee Cart & Mobile Coffee Catering Businesses",
  subhead:
    "Corporate breakfasts, brand activations, and weddings all search for a coffee cart differently. We build the local presence that shows up for all three, not just the easiest one.",
  statValue: "75%",
  statLabel: "of Google clicks go to the top three map pack results",
  intro: {
    heading: "Coffee catering has its own search behavior",
    paragraphs: [
      "A coffee cart isn't competing with cafes for search visibility — it's competing with other mobile operators for a completely different kind of search intent. Someone typing \"coffee catering near me\" or \"coffee cart for office event\" has a date, a headcount, and a budget already in mind. That's a different buyer than someone searching for a cup of coffee to drink right now, and most coffee cart websites are still built like the second business, not the first.",
      "The single most common mistake we see is the Google Business Profile category. \"Coffee stand\" tells Google you're a fixed location serving walk-up customers nearby. \"Mobile caterer\" or a catering-specific category tells Google you travel to events — which is the entire business. That one setting decides whether you show up for the corporate planner three suburbs over searching \"coffee catering\" with a real budget, or get hidden from them entirely.",
      "Coffee catering is also unusually seasonal. May is typically the single biggest month, June and July each drop roughly 40 percent, and December closes the year as the record month. A site and content calendar that isn't built around that curve is either invisible during the slow months or scrambling to catch up right before the peaks it should have been ranking for two to three months earlier.",
    ],
  },
  approach: {
    heading: "How we approach coffee cart SEO",
    intro:
      "Every part of the system is built around how coffee catering actually gets booked — not a generic local SEO template with your logo dropped in.",
    items: [
      {
        title: "Google Business Profile, set up for catering intent",
        body: "Correct primary category, service-area configuration, and a profile structured to capture both \"near me\" walk-up searches and \"coffee catering for [event type]\" intent, not just one or the other.",
      },
      {
        title: "Service pages that separate corporate from wedding intent",
        body: "A corporate office searching for a coffee cart and a couple planning a wedding are looking for different proof, different pricing framing, and different pages — not one generic \"our services\" page trying to speak to both.",
      },
      {
        title: "Review velocity, not just review count",
        body: "Google reads sustained review velocity as a live trust signal. We build the system — staff incentives, QR placement, post-event follow-up — that produces two or three reviews a week, every week, instead of a burst that goes quiet.",
      },
      {
        title: "Content and seasonal timing built around your real calendar",
        body: "Holiday and wedding-season pages published two to three months ahead of the peak, so they've cleared Google's ranking delay before the demand actually arrives, not after.",
      },
    ],
  },
  closing: {
    heading: "See where your coffee cart's visibility actually stands",
    body: "Run the free Growth Diagnostic and get a scored read on your rankings, Google Business Profile, and site — plus the specific fixes ranked by what will move bookings first.",
  },
};

export default function CoffeeCartSeoPage() {
  return <IndustryLandingPage content={content} />;
}
