import Hero from "@/components/general/Hero";
import AddOns from "@/components/sections/Addons";
import Capabilities from "@/components/sections/Capabilities";
import CaseStudies from "@/components/sections/CaseStudies";
import CityRankings from "@/components/sections/CityRankings";
import KnownFor from "@/components/sections/Knownfor";
import Pricing from "@/components/sections/Pricing";
import SeoServices from "@/components/sections/SeoServices";
import Services from "@/components/sections/Services";
import Logos from "@/components/sections/Logos";
import ClosingCta from "@/components/sections/ClosingCta";

export default function Home() {
  return (
    <>
      <Hero />
      <CityRankings />
      <KnownFor />
      <Logos />
      <CaseStudies />
      <SeoServices />
      <Pricing />
      <AddOns />
      <Capabilities />
      <Services />
      <ClosingCta />
    </>
  );
}
