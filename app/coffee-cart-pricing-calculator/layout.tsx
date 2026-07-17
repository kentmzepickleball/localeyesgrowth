import type { Metadata } from "next";

/* page.tsx in this route is a Client Component ("use client"), which
   can't export `metadata` itself — Next.js only reads metadata from
   Server Components. This sibling layout carries it instead. */
export const metadata: Metadata = {
  title: "Coffee Catering Price Calculator | LocalEyes",
  description:
    "Know exactly what to charge for any coffee cart or mobile espresso event — in seconds. Get value, standard, and premium pricing instantly, plus a client-ready quote.",
  alternates: {
    canonical: "/coffee-cart-pricing-calculator",
  },
};

export default function CoffeeCartCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
