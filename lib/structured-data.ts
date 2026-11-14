import type { PostSummary } from "./articles";
import { absoluteUrl, experience, logos, openSource, site, socials } from "./site";

/**
 * schema.org JSON-LD. Every page ships one @graph: the WebSite and the Person it's about,
 * each with a stable @id, plus that page's own node(s). Other nodes point at those ids, so
 * crawlers and answer engines resolve one identity across the whole site.
 * Shapes follow Google's Article, ProfilePage and Breadcrumb docs.
 */

type Node = Record<string, unknown>;

export const ids = {
  website: `${site.url}/#website`,
  person: `${site.url}/#person`,
  blog: `${site.url}/posts#blog`,
};

export const DEFAULT_IMAGE = `${site.url}/opengraph-image`;

/** Card for a post, the same one its og:image uses. */
export const postImage = (p: PostSummary) =>
  `${site.url}/api/og?title=${encodeURIComponent(p.title)}&date=${p.date}&min=${p.minutes}`;

const ref = (id: string) => ({ "@id": id });

/** The main current role: the newest one still open (the top of the experience list). */
const current = experience.find(r => r.end === null);

const website: Node = {
  "@type": "WebSite",
  "@id": ids.website,
  url: absoluteUrl("/"),
  name: site.name,
  description: site.description,
  inLanguage: "en",
  publisher: ref(ids.person),
};

const person: Node = {
  "@type": "Person",
  "@id": ids.person,
  name: site.name,
  alternateName: ["Ali Al-Shehri", "Ali Al Shehri", site.handle],
  url: absoluteUrl("/"),
  image: { "@type": "ImageObject", url: DEFAULT_IMAGE, width: 1200, height: 630 },
  description: site.description,
  jobTitle: current?.role ?? site.role,
  worksFor: current ? { "@type": "Organization", name: current.company, url: logos[current.company]?.url } : undefined,
  email: `mailto:${site.email}`,
  sameAs: socials.filter(s => s.href.startsWith("https://")).map(s => s.href),
  knowsAbout: openSource.map(o => ({ "@type": "SoftwareSourceCode", name: o.name, codeRepository: o.url })),
};

export function graph(...nodes: Node[]) {
  return { "@context": "https://schema.org", "@graph": [website, person, ...nodes] };
}

/** A plain page (home, contact): what it is, and that it's part of the site. */
export function webPage(path: string, name: string, description: string, type = "WebPage"): Node {
  return {
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en",
    isPartOf: ref(ids.website),
    about: ref(ids.person),
  };
}

/** /info: Google's ProfilePage, whose mainEntity is the Person. */
export function profilePage(path: string, name: string, description: string, modified: string): Node {
  return {
    ...webPage(path, name, description, "ProfilePage"),
    dateModified: modified,
    mainEntity: ref(ids.person),
  };
}

/** /posts: the Blog, listing every post. */
export function blog(posts: PostSummary[], description: string): Node[] {
  return [
    {
      ...webPage("/posts", `Writing — ${site.name}`, description, "CollectionPage"),
      mainEntity: ref(ids.blog),
    },
    {
      "@type": "Blog",
      "@id": ids.blog,
      url: absoluteUrl("/posts"),
      name: `${site.name}’s writing`,
      description,
      inLanguage: "en",
      author: ref(ids.person),
      publisher: ref(ids.person),
      blogPost: posts.map(p => ({
        "@type": "BlogPosting",
        "@id": `${absoluteUrl(p.href)}#article`,
        headline: p.title,
        url: absoluteUrl(p.href),
        datePublished: p.date,
        dateModified: p.updated,
      })),
    },
  ];
}

/** A post: the BlogPosting and its breadcrumb trail (Home › Writing › post). */
export function blogPosting(p: PostSummary): Node[] {
  const url = absoluteUrl(p.href);
  return [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: p.title,
      description: p.summary || undefined,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: { "@type": "ImageObject", url: postImage(p), width: 1200, height: 630 },
      datePublished: p.date,
      dateModified: p.updated,
      author: { "@type": "Person", "@id": ids.person, name: site.name, url: absoluteUrl("/") },
      publisher: ref(ids.person),
      isPartOf: ref(ids.blog),
      inLanguage: "en",
      wordCount: p.words,
      timeRequired: `PT${p.minutes}M`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Writing", item: absoluteUrl("/posts") },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];
}
