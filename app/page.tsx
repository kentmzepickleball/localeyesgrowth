import dynamic from "next/dynamic";
import Hero from "@/components/general/Hero";
import CityRankings from "@/components/sections/CityRankings";
import { getAllBlogPosts } from "@/lib/blog-posts";

/* Everything below the first couple of sections is code-split into its
   own chunk (ssr stays on for all of them — still server-rendered and
   visible immediately, no hydration flash, no layout shift). Measured
   in production Lighthouse: the homepage's single initial JS chunk was
   burning ~1.9s of script evaluation because every section's GSAP/
   ScrollTrigger setup — including ones far below the fold — was bundled
   into that one chunk. Splitting it lets the browser parse/execute each
   section's JS as its own smaller task instead of one long one blocking
   the main thread before the page can settle. Hero and CityRankings stay
   eager imports since they're what's actually visible on first paint. */
const WebsitePreviews = dynamic(
  () => import("@/components/sections/WebsitePreviews"),
);
const KnownFor = dynamic(() => import("@/components/sections/Knownfor"));
const Logos = dynamic(() => import("@/components/sections/Logos"));
const CaseStudies = dynamic(() => import("@/components/sections/CaseStudies"));
const SeoServices = dynamic(() => import("@/components/sections/SeoServices"));
const Pricing = dynamic(() => import("@/components/sections/Pricing"));
const AddOns = dynamic(() => import("@/components/sections/Addons"));
const Capabilities = dynamic(
  () => import("@/components/sections/Capabilities"),
);
const Services = dynamic(() => import("@/components/sections/Services"));
const Blog = dynamic(() => import("@/components/sections/Blog"));
const ClosingCta = dynamic(() => import("@/components/sections/ClosingCta"));

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
      <WebsitePreviews />
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
