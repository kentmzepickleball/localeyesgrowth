import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog-posts";

const BASE_URL = "https://www.localeyesgrowth.com";

/* Rebuilt hourly, so a post added straight to the database is listed
   without a redeploy. /valor stays out: it is pricing kept for podcast
   listeners, not a page to send searchers to. */
export const revalidate = 3600;

type Entry = { path: string; priority: number; changeFrequency: "weekly" | "monthly" };

const PAGES: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/seo", priority: 0.9, changeFrequency: "monthly" },
  { path: "/websites-for-event-businesses", priority: 0.9, changeFrequency: "monthly" },
  { path: "/ads", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/coffee-cart-seo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mobile-bar-seo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/charcuterie-catering-seo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/coffee-cart-pricing-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/podcast/episode-1-catering-seo-lessons", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: `${BASE_URL}${p.path === "/" ? "/" : p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  /* the blog's posts, dated by when they were published; if the
     database can't be reached, the pages above still go out */
  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await getAllBlogPosts()).map((post) => {
      const date = new Date(post.date);
      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: Number.isNaN(date.getTime()) ? now : date,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });
  } catch {
    posts = [];
  }

  return [...pages, ...posts];
}
