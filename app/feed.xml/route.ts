import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";
import { postBody } from "@/lib/agent-content";
import { getAllPosts, getPostSummaries } from "@/lib/articles";
import { absoluteUrl, site } from "@/lib/site";

// RSS 2.0 with each post's full text, built at build time from the same posts the pages
// render. Route handlers can't use react-dom/server (lib/render-mdx.tsx), so the feed
// renders the post's plain-Markdown twin (links already absolute) with the same remark
// plugins, minus syntax highlighting, which feed readers would strip anyway.
export const dynamic = "force-static";

const markdownToHtml = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkSmartypants, { dashes: "oldschool" })
  .use(remarkRehype)
  .use(rehypeStringify);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** CDATA can't contain its own terminator. */
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const rfc822 = (day: string) => new Date(`${day}T00:00:00Z`).toUTCString();

export async function GET() {
  const all = getAllPosts();
  const summaries = getPostSummaries(all);
  const items = await Promise.all(
    all.map(async (post, i) => {
      const p = summaries[i];
      if (!p) return "";
      const url = absoluteUrl(p.href);
      const html = String(await markdownToHtml.process(postBody(post)));
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${esc(site.name)}</dc:creator>
      <description>${esc(p.summary.replace(/\s+/g, " "))}</description>
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`;
    })
  );
  const latest = summaries[0]?.updated ?? summaries[0]?.date;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(`${site.name}’s writing`)}</title>
    <link>${absoluteUrl("/posts")}</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(site.description)}</description>
    <language>en</language>
    ${latest ? `<lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ""}
    <image>
      <url>${site.url}/apple-icon.png</url>
      <title>${esc(`${site.name}’s writing`)}</title>
      <link>${absoluteUrl("/posts")}</link>
    </image>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
