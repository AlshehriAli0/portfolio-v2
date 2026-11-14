import type { MetadataRoute } from "next";
import { getPostSummaries } from "@/lib/articles";
import { absoluteUrl, experience } from "@/lib/site";

// lastmod is only given where it's known from the content, as Google asks: a post's
// publish or `updated` date, the newest post for the lists, the experience for /info.
// changefreq and priority are left out; Google ignores both.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPostSummaries();
  const newestPost = posts
    .map(p => p.updated)
    .sort()
    .at(-1);
  const experienceChanged = experience
    .flatMap(r => [r.start, r.end ?? r.start])
    .sort()
    .at(-1);
  const home = [newestPost, experienceChanged].filter(Boolean).sort().at(-1);
  return [
    { url: absoluteUrl("/"), lastModified: home },
    { url: absoluteUrl("/info"), lastModified: experienceChanged },
    { url: absoluteUrl("/posts"), lastModified: newestPost },
    { url: absoluteUrl("/contact") },
    ...posts.map(p => ({ url: absoluteUrl(p.href), lastModified: p.updated })),
  ];
}
