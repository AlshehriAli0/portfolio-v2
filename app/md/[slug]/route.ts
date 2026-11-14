import { postMarkdownBySlug } from "@/lib/agent-content";
import { getAllPosts } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

// Served at /posts/<slug>.md (rewrite in next.config.mjs), the llms.txt convention for a
// page's Markdown twin. Every post is built at build time; anything else is a 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const markdown = postMarkdownBySlug(slug);
  if (!markdown) return new Response("Not found", { status: 404 });
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // The HTML page is the one to index; this is its alternate.
      Link: `<${absoluteUrl(`/posts/${slug}`)}>; rel="canonical"`,
    },
  });
}
