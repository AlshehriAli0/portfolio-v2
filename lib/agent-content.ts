import { getAllPosts, getPostSummaries, type Post, type PostSummary } from "./articles";
import {
  absoluteUrl,
  copy,
  duration,
  experience,
  formatMonth,
  groupByCompany,
  logos,
  openSource,
  site,
  socials,
} from "./site";

/**
 * The agent-readable twins of the site (llms.txt, llms-full.txt and each post's .md),
 * built from the same posts and copy the pages render, so they can't drift.
 * Format: https://llmstxt.org
 */

const FENCE = /^\s*(```|~~~)/;

/** Applies `fn` to each line outside fenced code blocks. */
function mapProse(markdown: string, fn: (line: string) => string | null) {
  let inFence = false;
  const out: string[] = [];
  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) inFence = !inFence;
    const next = inFence || FENCE.test(line) ? line : fn(line);
    if (next !== null) out.push(next);
  }
  return out.join("\n");
}

/** `../file.png`, `./file.png` and `/file` are site files; agents need absolute URLs. */
const absolutize = (line: string) =>
  line.replace(/\]\((?!https?:|mailto:|#)(?:\.{1,2}\/)*\/?([^)\s]+)\)/g, (_, path: string) => `](${site.url}/${path})`);

/**
 * The post body as plain Markdown: MDX import/export lines dropped, links absolute, and
 * headings renumbered to start at h2 under the title without skipping a level (as the
 * HTML does in lib/render-mdx.tsx).
 */
export function postBody(post: Post, top = 2) {
  const levels: number[] = [];
  mapProse(post.content, line => {
    const m = line.match(/^(#{1,6})\s/);
    if (m) levels.push(m[1]?.length ?? 2);
    return line;
  });
  const shift = levels.length ? top - Math.min(...levels) : 0;
  let previous = top - 1;
  return mapProse(post.content, line => {
    if (/^(import|export)\s/.test(line)) return null;
    const m = line.match(/^(#{1,6})(\s.*)$/);
    if (m) {
      const next = Math.min((m[1]?.length ?? 2) + shift, previous + 1, 6);
      previous = next;
      return `${"#".repeat(next)}${absolutize(m[2] ?? "")}`;
    }
    return absolutize(line);
  }).trim();
}

const byline = (p: PostSummary) =>
  [
    `By ${site.name}`,
    `Published ${p.date}`,
    p.updated !== p.date ? `Updated ${p.updated}` : null,
    `${p.minutes} min read`,
    `Canonical: ${absoluteUrl(p.href)}`,
  ]
    .filter(Boolean)
    .join(" · ");

/** One post as a standalone Markdown document. */
export function postMarkdown(post: Post, summary: PostSummary, level = 1) {
  const h = "#".repeat(level);
  const dek = summary.summary ? `> ${summary.summary.replace(/\s+/g, " ")}\n` : null;
  return [`${h} ${summary.title}`, "", dek, byline(summary), "", postBody(post, level + 1), ""]
    .filter(line => line !== null)
    .join("\n");
}

/** A post by slug, for the /posts/<slug>.md route. */
export function postMarkdownBySlug(slug: string) {
  const all = getAllPosts();
  const summaries = getPostSummaries(all);
  const i = all.findIndex(p => p.slug === slug);
  const post = all[i];
  const summary = summaries[i];
  return post && summary ? postMarkdown(post, summary) : null;
}

const profiles = () => socials.map(s => `- [${s.label}](${s.href}): ${s.value}`).join("\n");

function experienceList() {
  return groupByCompany(experience)
    .map(g => {
      const url = logos[g.company]?.url;
      const name = url ? `[${g.company}](${url})` : g.company;
      const roles = g.roles
        .map(r => `  - ${r.role}, ${formatMonth(r.start)} – ${r.end ? formatMonth(r.end) : "present"}`)
        .join("\n");
      return `- ${name} (${duration(g.start, g.end).replace(/ /g, " ")})\n${roles}`;
    })
    .join("\n");
}

const openSourceList = () => openSource.map(o => `- [${o.name}](${o.url}): ${o.downloads}`).join("\n");

const plain = (s: string) => s.replace(/ /g, " ");

/** /llms.txt: who Ali is and an index of the site, every link with a one-line note. */
export function llmsTxt() {
  const posts = getPostSummaries();
  return `# ${site.name}

> ${site.description}

In his words: “${plain(copy.about)}”

This file indexes ${site.url}; every post also has a clean Markdown version at the same URL with \`.md\` appended. The full text of the site is at [llms-full.txt](${site.url}/llms-full.txt).

## Pages

- [Home](${absoluteUrl("/")}): Introduction, latest writing and a short bio
- [Info](${absoluteUrl("/info")}): About Ali, open-source work and experience
- [Writing](${absoluteUrl("/posts")}): All posts, newest first
- [Contact](${absoluteUrl("/contact")}): Email and profiles

## Writing

${posts.map(p => `- [${p.title}](${absoluteUrl(p.href)}.md): ${p.summary.replace(/\s+/g, " ")}`).join("\n")}

## Experience

${experienceList()}

## Open source

${openSourceList()}

## Profiles

${profiles()}

## Optional

- [Full text](${site.url}/llms-full.txt): The about text, experience and every post in one Markdown file
- [RSS feed](${site.url}/feed.xml): Every post, full text
- [Sitemap](${site.url}/sitemap.xml): Every indexable URL
`;
}

/** /llms-full.txt: the whole site's content in one Markdown document. */
export function llmsFullTxt() {
  const all = getAllPosts();
  const summaries = getPostSummaries(all);
  return `# ${site.name}

> ${site.description}

Source: ${absoluteUrl("/")}

## About

${plain(copy.homeLede)}

${plain(copy.about)}

${plain(copy.infoLede)}

## Experience

${experienceList()}

## Open source

Ali contributes to open-source libraries and maintains a few packages of his own:

${openSourceList()}

## Contact

${profiles()}

## Writing

${all.map((p, i) => postMarkdown(p, summaries[i] as PostSummary, 3)).join("\n---\n\n")}`;
}
