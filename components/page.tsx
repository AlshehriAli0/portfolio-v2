import Head from "next/head";
import type { ReactNode } from "react";
import { absoluteUrl, site } from "@/lib/site";
import { DEFAULT_IMAGE, graph } from "@/lib/structured-data";
import { Footer } from "./footer";
import { Nav } from "./nav";

type Article = { published: string; modified: string; markdown: string };

type PageProps = {
  path: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  /** Posts: dates for article:* tags and the path of the post's markdown twin. */
  article?: Article;
  /** This page's own schema.org nodes; the WebSite and Person nodes are always added. */
  jsonLd?: Record<string, unknown>[];
  /** For pages that shouldn't be indexed (the 404). */
  noindex?: boolean;
  /** The footer's big "Say hello"; only Home sets it. */
  sayHello?: boolean;
  /** The footer's social links; Contact lists them itself. */
  socialLinks?: boolean;
  children: ReactNode;
};

const DEFAULT_IMAGE_ALT = `${site.name}, ${site.role}`;

/** Page shell: head tags, nav and footer. Every page is static HTML with no runtime JS. */
export function Page({
  path,
  title,
  description = site.description,
  image = DEFAULT_IMAGE,
  imageAlt = DEFAULT_IMAGE_ALT,
  article,
  jsonLd = [],
  noindex = false,
  sayHello = false,
  socialLinks = true,
  children,
}: PageProps) {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
  const url = absoluteUrl(path);
  // A post's title stands on its own in a share card; a page's name ("Info") needs the site's.
  const shareTitle = article && title ? title : fullTitle;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content={description} />
        {noindex ? (
          <meta name="robots" content="noindex, follow" />
        ) : (
          <>
            <meta
              name="robots"
              content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            />
            <link rel="canonical" href={url} />
          </>
        )}
        {article ? <link rel="alternate" type="text/markdown" href={article.markdown} title={title} /> : null}
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content={site.locale} />
        <meta property="og:type" content={article ? "article" : path === "/info" ? "profile" : "website"} />
        <meta property="og:image" content={image} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={imageAlt} />
        {article ? (
          <>
            <meta property="article:published_time" content={article.published} />
            <meta property="article:modified_time" content={article.modified} />
            <meta property="article:author" content={absoluteUrl("/info")} />
          </>
        ) : null}
        {path === "/info" ? (
          <>
            <meta property="profile:first_name" content="Ali" />
            <meta property="profile:last_name" content="Alshehri" />
            <meta property="profile:username" content={site.handle.slice(1)} />
          </>
        ) : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={site.handle} />
        <meta name="twitter:creator" content={site.handle} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:image:alt" content={imageAlt} />
        {noindex ? null : (
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data; `<` escaped so it can't close the tag
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph(...jsonLd)).replace(/</g, "\\u003c") }}
          />
        )}
      </Head>
      <Nav path={path} />
      {children}
      <Footer sayHello={sayHello} socialLinks={socialLinks} />
    </>
  );
}
