import type { Metadata } from "next";
import PricingHero from "@/components/PricingHero";
import Pricing from "../../components/sections/Pricing";
import PricingFaq from "@/components/PricingFaq";

/* app/pricing/page.tsx — no Header/Footer here; your layout.tsx provides them.
   Parallax: PricingHero pins itself (sticky top-0, reduced-motion gated
   inside the component); the sections below carry z-10 + opaque backgrounds
   so they slide up and cover the hero smoothly. */

export const metadata: Metadata = {
  title: "Pricing | LocalEyes Growth Agency",
  description:
    "Transparent pricing for LocalEyes' local SEO systems for coffee carts, beverage carts, and mobile event businesses — pick the engine that matches your operational capacity.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="relative min-h-[100dvh] w-full bg-[#ededd5] text-[#261f15] overflow-x-clip selection:bg-[#c9932b] selection:text-[#261f15]">
      <PricingHero />
      <div className="relative z-10 bg-[#261f15]">
        <Pricing />
      </div>
      <div className="relative z-10 bg-[#ededd5]">
        <PricingFaq />
      </div>
    </main>
  );
}
