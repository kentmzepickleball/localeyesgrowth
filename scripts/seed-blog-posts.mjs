// One-time / re-runnable migration: content/blog/*.md -> Postgres (Neon).
// Usage: node --env-file=.env.local scripts/seed-blog-posts.mjs
// Safe to re-run — upserts by slug, so editing a .md file and re-running
// updates that row instead of duplicating it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "..", "content", "blog");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/seed-blog-posts.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      date DATE NOT NULL,
      content TEXT NOT NULL,
      author TEXT,
      stat_value TEXT,
      stat_label TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // in case the table already existed from before these columns were added
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS stat_value TEXT`;
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS stat_label TEXT`;
  console.log("Table blog_posts ready.");

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const fileSlug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const slug = data.slug ?? fileSlug;
    const title = data.title;
    const category = data.category ?? "SEO";
    const excerpt = data.meta_description ?? data.description ?? "";
    const date = data.date;
    const author = data.author ?? null;
    const statValue = data.stat_value ?? null;
    const statLabel = data.stat_label ?? null;

    if (!title || !date) {
      console.warn(`Skipping ${file}: missing title or date in frontmatter.`);
      continue;
    }

    await sql`
      INSERT INTO blog_posts (slug, title, category, excerpt, date, content, author, stat_value, stat_label, updated_at)
      VALUES (${slug}, ${title}, ${category}, ${excerpt}, ${date}, ${content.trim()}, ${author}, ${statValue}, ${statLabel}, now())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        excerpt = EXCLUDED.excerpt,
        date = EXCLUDED.date,
        content = EXCLUDED.content,
        author = EXCLUDED.author,
        stat_value = EXCLUDED.stat_value,
        stat_label = EXCLUDED.stat_label,
        updated_at = now()
    `;
    console.log(`Upserted: ${slug}`);
  }

  const [{ count }] = await sql`SELECT count(*)::int FROM blog_posts`;
  console.log(`Done. blog_posts now has ${count} row(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
