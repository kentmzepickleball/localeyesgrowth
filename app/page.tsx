import Hero from "@/components/general/Hero";
import AddOns from "@/components/sections/Addons";
import Blog from "@/components/sections/Blog";
import Capabilities from "@/components/sections/Capabilities";
import CaseStudies from "@/components/sections/CaseStudies";
import CityRankings from "@/components/sections/CityRankings";
import KnownFor from "@/components/sections/Knownfor";
import Pricing from "@/components/sections/Pricing";
import SeoServices from "@/components/sections/SeoServices";
import Services from "@/components/sections/Services";
import Logos from "@/components/sections/Logos";
import ClosingCta from "@/components/sections/ClosingCta";
import { getAllBlogPosts } from "@/lib/blog-posts";

/* Content lives in Postgres now — revalidate periodically so a post
   added straight to the database shows up without a redeploy. */
export const revalidate = 60;

export default async function Home() {
  const posts = (await getAllBlogPosts()).slice(0, 3);

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
      <Blog posts={posts} />
      <ClosingCta />
    </>
  );
}
