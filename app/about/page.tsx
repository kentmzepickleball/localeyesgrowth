import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About | LocalEyes",
  description:
    "The people behind LocalEyes and what it's actually like to work with us.",
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return <AboutPage />;
}
