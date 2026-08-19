import { neon } from "@neondatabase/serverless";

/* ----------------------------------------------------------------------
   Blog content — backed by Postgres (Neon), table `blog_posts`.
   Server-only (needs DATABASE_URL), so it can't be imported directly
   into a "use client" component. The pattern: a Server Component (a
   page.tsx) awaits getAllBlogPosts()/getBlogPostBySlug() and passes the
   result down as props to the client components that render the
   cards/tilt effects (components/sections/Blog.tsx,
   components/BlogListing.tsx, components/BlogArticle.tsx).
   Schema + one-time migration of the original content/blog/*.md posts
   live in scripts/seed-blog-posts.mjs — run with
   `node --env-file=.env.local scripts/seed-blog-posts.mjs` whenever a
   new post needs to go in, or insert directly via SQL.
   ---------------------------------------------------------------------- */

export type BlogPostMeta = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string | null;
  /* pull-stat shown on the card, e.g. statValue "75%", statLabel "of
     Google clicks go to the top 3 results" — optional; the card falls
     back to a plain layout when a post doesn't set one. */
  statValue: string | null;
  statLabel: string | null;
  /* optional downloadable lead-magnet (a PDF/Word playbook) shown in a
     sticky sidebar on the article page — null on most posts */
  resourceLabel: string | null;
  resourceDescription: string | null;
  resourceImageUrl: string | null;
  resourcePdfUrl: string | null;
  resourceDocxUrl: string | null;
  /* optional prominent CTA button rendered near the top of the article,
     for posts whose real conversion goal is a specific page (e.g. the
     pricing calculator) rather than the default Growth Diagnostic —
     null on most posts */
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaNote: string | null;
};

const sql = neon(process.env.DATABASE_URL!);

const WORDS_PER_MINUTE = 225;

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

function formatDate(raw: string | Date): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type PostRow = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  content: string;
  author: string | null;
  stat_value: string | null;
  stat_label: string | null;
  resource_label: string | null;
  resource_description: string | null;
  resource_image_url: string | null;
  resource_pdf_url: string | null;
  resource_docx_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  cta_note: string | null;
};

function toMeta(row: PostRow): BlogPostMeta {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    date: formatDate(row.date),
    readTime: estimateReadTime(row.content),
    author: row.author,
    statValue: row.stat_value,
    statLabel: row.stat_label,
    resourceLabel: row.resource_label,
    resourceDescription: row.resource_description,
    resourceImageUrl: row.resource_image_url,
    resourcePdfUrl: row.resource_pdf_url,
    resourceDocxUrl: row.resource_docx_url,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    ctaNote: row.cta_note,
  };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM blog_posts`) as { slug: string }[];
  return rows.map((row) => row.slug);
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const rows = (await sql`
    SELECT slug, title, category, excerpt, date, content, author, stat_value, stat_label,
      resource_label, resource_description, resource_image_url, resource_pdf_url, resource_docx_url,
      cta_label, cta_href, cta_note
    FROM blog_posts
    ORDER BY created_at DESC
  `) as PostRow[];

  return rows.map(toMeta);
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<{ meta: BlogPostMeta; content: string } | null> {
  const rows = (await sql`
    SELECT slug, title, category, excerpt, date, content, author, stat_value, stat_label,
      resource_label, resource_description, resource_image_url, resource_pdf_url, resource_docx_url,
      cta_label, cta_href, cta_note
    FROM blog_posts
    WHERE slug = ${slug}
    LIMIT 1
  `) as PostRow[];

  const row = rows[0];
  if (!row) return null;

  return { meta: toMeta(row), content: row.content };
}

/* Pulls Q&A pairs out of a post's "## FAQ" / "## Frequently asked
   questions" section (### Question, then its answer paragraph(s)) for
   FAQPage structured data — every post follows this shape, so this
   runs for all of them rather than needing a per-post flag. */
export function extractFaqPairs(
  content: string,
): { question: string; answer: string }[] {
  const section = content.match(
    /\n##\s+(?:FAQ|Frequently asked questions)\s*\n([\s\S]*?)(?=\n##\s+|$)/i,
  )?.[1];
  if (!section) return [];

  const pairs: { question: string; answer: string }[] = [];
  const qaRegex = /###\s+(.+?)\n([\s\S]*?)(?=\n###\s+|$)/g;
  let match: RegExpExecArray | null;
  while ((match = qaRegex.exec(section)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().replace(/\s+/g, " ");
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs;
}
