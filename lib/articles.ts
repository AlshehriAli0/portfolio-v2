import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { calculateReadingTime, countWords } from "./estimate-time";

export interface Post {
  meta: {
    [key: string]: string;
  };
  slug: string;
  /** Publication day, from the filename. */
  date: string;
  /** Last substantive edit: frontmatter `updated` (YYYY-MM-DD) if set, else the publication day. */
  updated: string;
  href: string;
  content: string;
}

export type PostSummary = {
  slug: string;
  href: string;
  date: string;
  updated: string;
  title: string;
  summary: string;
  minutes: number;
  words: number;
};

const POSTS_PATH = "posts";
// Posts are named `YYYY-MM-DD-slug.mdx`.
const FILENAME = /^(\d{4}-\d{2}-\d{2})-(.*)\.mdx$/;

/** Published posts (drafts too in development), newest first. */
export function getAllPosts(): Post[] {
  const posts: Post[] = [];
  for (const filename of fs.readdirSync(POSTS_PATH)) {
    const match = filename.match(FILENAME);
    if (match) {
      const [, date = "", slug = ""] = match;
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_PATH, filename), "utf-8"));
      if (!data.draft || process.env.NODE_ENV === "development") {
        // gray-matter parses a bare YAML date into a Date.
        const updated = data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : (data.updated ?? date);
        posts.push({ meta: data, content, slug, date, updated, href: `/posts/${slug}` });
      }
    }
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/** Published posts, newest first, trimmed to what list pages need (keeps page props tiny). */
export function getPostSummaries(posts = getAllPosts()): PostSummary[] {
  return posts.map(p => ({
    slug: p.slug,
    href: p.href,
    date: p.date,
    updated: p.updated,
    title: p.meta.title,
    summary: p.meta.summary ?? "",
    minutes: calculateReadingTime(p.content),
    words: countWords(p.content),
  }));
}
