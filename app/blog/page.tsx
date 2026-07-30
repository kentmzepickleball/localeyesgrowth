import type { Metadata } from "next";
import BlogListing from "@/components/BlogListing";
import { getAllBlogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "The Journal | LocalEyes Growth Agency",
  description:
    "Practical local SEO breakdowns for coffee carts, mobile bars, and every kind of caterer — from LocalEyes.",
  alternates: {
    canonical: "/blog",
  },
};

/* Content lives in Postgres now — revalidate periodically so a post
   added straight to the database shows up without a redeploy. */
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="relative min-h-dvh w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <BlogListing posts={posts} />
    </main>
  );
}
