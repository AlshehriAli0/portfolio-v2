import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Everything is public and Ali wants to be found and cited, so every crawler may read
 * the whole site. The AI crawlers are also named explicitly, each by the token its
 * operator documents: search/answer indexers, user-triggered fetchers and training crawlers.
 */
const AI_CRAWLERS = [
  // OpenAI: https://platform.openai.com/docs/bots
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Anthropic: https://support.claude.com/en/articles/8896518
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  // Perplexity: https://docs.perplexity.ai/guides/bots
  "PerplexityBot",
  "Perplexity-User",
  // Google (Gemini and AI training), Apple Intelligence, Common Crawl
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Nothing is blocked: /api/og is the post card that og:image and the JSON-LD point to.
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
