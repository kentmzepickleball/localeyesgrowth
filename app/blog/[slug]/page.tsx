import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import { getBlogPostBySlug } from "@/lib/blog-posts";

/* Content lives in Postgres now (lib/blog-posts.ts) — no
   generateStaticParams, so a post added straight to the database shows
   up without a redeploy. ISR keeps it fast: a slug is rendered once,
   then re-checked against the DB at most once a minute. */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.meta.title} | LocalEyes Growth Agency`,
    description: post.meta.excerpt,
    alternates: {
      canonical: `/blog/${post.meta.slug}`,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="relative min-h-dvh w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <BlogArticle meta={post.meta} content={post.content} />
    </main>
  );
}
