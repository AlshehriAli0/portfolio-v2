import { llmsFullTxt } from "@/lib/agent-content";

// Built once at build time; regenerated daily like the home page, so experience durations stay current.
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
