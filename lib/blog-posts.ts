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
  };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM blog_posts`) as { slug: string }[];
  return rows.map((row) => row.slug);
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const rows = (await sql`
    SELECT slug, title, category, excerpt, date, content, author, stat_value, stat_label
    FROM blog_posts
    ORDER BY date DESC
  `) as PostRow[];

  return rows.map(toMeta);
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<{ meta: BlogPostMeta; content: string } | null> {
  const rows = (await sql`
    SELECT slug, title, category, excerpt, date, content, author, stat_value, stat_label
    FROM blog_posts
    WHERE slug = ${slug}
    LIMIT 1
  `) as PostRow[];

  const row = rows[0];
  if (!row) return null;

  return { meta: toMeta(row), content: row.content };
}
