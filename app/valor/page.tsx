import type { Metadata } from "next";
import ValorHero from "@/components/ValorHero";
import ValorTestimonial from "@/components/ValorTestimonial";
import ValorPricing from "@/components/ValorPricing";

export const metadata: Metadata = {
  title: "Valor Listeners | LocalEyes Growth Agency",
  description:
    "Exclusive local SEO pricing for Valor Coffee Podcast listeners — the same growth systems LocalEyes builds for coffee carts, beverage carts, and mobile event businesses.",
  alternates: {
    canonical: "/valor",
  },
};

export default function ValorPage() {
  return (
    <main className="relative min-h-[100dvh] w-full bg-[#ededd5] text-[#261f15] overflow-x-clip selection:bg-[#c9932b] selection:text-[#261f15]">
      <ValorHero />
      <ValorTestimonial />
      <ValorPricing />
    </main>
  );
}
