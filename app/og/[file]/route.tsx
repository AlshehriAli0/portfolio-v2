import { getPostSummaries } from "@/lib/articles";
import { ogImageResponse } from "@/lib/og";

// Each post's share card, rendered at build time and served as a static PNG at
// /og/<slug>.png. Crawlers like WhatsApp's and iMessage's give up on slow images, and
// drawing the card on demand took about 2 s on a cold request.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSummaries().map(p => ({ file: `${p.slug}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const post = getPostSummaries().find(p => `${p.slug}.png` === file);
  if (!post) return new Response("Not found", { status: 404 });
  return ogImageResponse({ kind: "post", title: post.title, date: post.date, minutes: post.minutes });
}
