import type { Metadata } from "next";
import CaseStudiesPage, { type CaseStudy } from "@/components/CaseStudiesPage";
import imgValorLogo from "@/public/valor logo.avif";
import imgValorPhoto from "@/public/valor-photo.webp";
import imgAnechoLogo from "@/public/anecho-coffee.png";
import imgNyc from "@/public/nyc-01.webp";
import imgNorthVillageLogo from "@/public/flatwhite_1.png";
import imgChicago from "@/public/chicago-01.webp";
import imgLa from "@/public/LA-01.webp";

export const metadata: Metadata = {
  title: "Case Studies | LocalEyes",
  description:
    "Real client results from LocalEyes — coffee cart, mobile bar, and catering businesses ranking #1 on Google in their markets.",
  alternates: {
    canonical: "/case-studies",
  },
};

const studies: CaseStudy[] = [
  {
    client: "Valor Coffee",
    tagline: "Coffee Cart Catering",
    logo: imgValorLogo,
    photo: imgValorPhoto,
    photoAlt: "The Valor Coffee Podcast team",
    matrix: [
      { label: "Focus", value: "Coffee catering “near me”" },
      { label: "Inquiries before", value: "1–2 per day" },
      { label: "Inquiries after", value: "5–7 per day" },
      { label: "Source", value: "Organic SEO" },
    ],
    story: [
      "Valor came to us with a strong brand and almost no organic visibility for the searches that actually book events. The fix started with the catering page itself: rebuilt around what a corporate planner or wedding buyer actually searches for, not a generic services list.",
      "“Two weeks ago we released our new catering page guided by LocalEyes and we were receiving 1-2 catering inquiries per day, and now we're receiving anywhere in the range of 5-7 catering inquiries per day just from SEO,” says Riley W., Co-Founder of Valor Coffee.",
      "That's the pattern we look for: not a slow multi-month climb, but a real, measurable jump once the highest-leverage pages are actually built for search.",
    ],
  },
  {
    client: "Anecho",
    tagline: "Coffee Catering — New York City",
    logo: imgAnechoLogo,
    photo: imgNyc,
    photoAlt: "Anecho ranking #1 on Google for coffee catering in New York City",
    matrix: [
      { label: "Location", value: "New York City" },
      { label: "Keyword", value: "Coffee Catering" },
      { label: "Google ranking", value: "#1" },
      { label: "Focus", value: "Local SEO" },
    ],
    story: [
      "New York is one of the most competitive coffee catering markets in the country — dozens of operators fighting for the same handful of map pack spots. Anecho's profile and site were solid, but not structured to compete for the exact terms corporate planners in the city actually search.",
      "We rebuilt the local SEO foundation: Google Business Profile category and structure, on-page targeting for “coffee catering” specifically, and the citation consistency that convinces Google the business is real and locally rooted.",
      "Anecho now holds the #1 organic ranking for coffee catering in New York City — the screenshot above is the live result, not a projection.",
    ],
  },
  {
    client: "North Village",
    tagline: "Coffee Cart Catering — Chicago",
    logo: imgNorthVillageLogo,
    photo: imgChicago,
    photoAlt: "North Village ranking #1 on Google for coffee cart catering in Chicago",
    matrix: [
      { label: "Location", value: "Chicago" },
      { label: "Keyword", value: "Coffee Cart Catering" },
      { label: "Google ranking", value: "#1" },
      { label: "Focus", value: "Local SEO" },
    ],
    story: [
      "North Village needed to stand out in a Chicago market where “coffee cart” and “coffee catering” searches were splitting traffic across dozens of competitors, most without a clear specialty.",
      "The work centered on precise keyword targeting for “coffee cart catering” specifically — the exact phrase their ideal corporate and wedding clients use — paired with a Google Business Profile built to reinforce that positioning.",
      "The result is the #1 organic ranking for that exact search in Chicago, shown above straight from Google.",
    ],
  },
  {
    client: "Always Kind",
    tagline: "Coffee Catering — Los Angeles",
    photo: imgLa,
    photoAlt: "Always Kind ranking #1 on Google for coffee catering in Los Angeles",
    matrix: [
      { label: "Location", value: "Los Angeles" },
      { label: "Keyword", value: "Coffee Catering" },
      { label: "Google ranking", value: "#1" },
      { label: "Focus", value: "Local SEO" },
    ],
    story: [
      "Los Angeles is a sprawling, high-volume market — competing here means ranking across a wide service area, not just one neighborhood. Always Kind's profile needed a service-area structure that could hold visibility across the whole metro, not just their home base.",
      "We rebuilt the local SEO foundation around that reality: correct service-area configuration, consistent citations across the LA metro, and content built for the coffee catering searches that actually carry a budget.",
      "Always Kind now holds the #1 organic ranking for coffee catering across Los Angeles.",
    ],
  },
  {
    client: "Mayday",
    tagline: "Case study coming soon",
    comingSoon: true,
  },
];

export default function CaseStudiesIndexPage() {
  return <CaseStudiesPage studies={studies} />;
}
