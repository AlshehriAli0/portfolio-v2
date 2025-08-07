import "../../assets/github-dark.css";
import { notFound } from "next/navigation";
import { getAllPostPaths, getPostBySlug } from "@/lib/articles";
import { Metadata, ResolvingMetadata } from "next";
import { createPostJsonLd } from "@/lib/jsonLd/post";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { calculateReadingTime } from "@/lib/estimate-time";

export async function generateStaticParams() {
  const paths = getAllPostPaths();

  return paths;
}

export const dynamic = "force-static";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  const parentMeta = await parent;

  return {
    title: post?.meta.title,
    description: post?.meta.summary,
    publisher: "Ali Alshehri",
    creator: "Ali Alshehri",
    alternates: {
      canonical: `https://ali-sh.com/posts/${params.slug}`,
    },

    openGraph: {
      ...parentMeta?.openGraph,
      title: post?.meta?.title || parentMeta?.openGraph?.title,
      description: post?.meta?.summary || parentMeta?.openGraph?.description,
      url: `https://ali-sh.com/posts/${params.slug}`,
      images: [
        {
          url: `https://ali-sh.com/api/og?title=${post?.meta?.title}`,
          width: 1200,
          height: 630,
          alt: "Ali Alshehri - Software Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@alicantcode",
      creator: "@alicantcode",
    },
  };
}

type Params = {
  slug: string;
};

export default async function Post({ params }: { params: Params }) {
  const post = getPostBySlug(params.slug);

  if (!post) return notFound();

  if (post.meta.draft && process.env.NODE_ENV !== "development") {
    return notFound();
  }

  const { meta, content } = post;

  const readingTime = calculateReadingTime(content);
  const postJsonLd = createPostJsonLd(post);

  return (
    <>
      <main className="px-4 md:px-0 overflow-x-hidden">
        <section>
          <h1 className="font-semibold tracking-tight text-4xl text-slate-900">
            {meta.title}
          </h1>
          <span className="text-slate-500 text-sm tracking-tight font-mono block mt-4">
            Published on{" "}
            <time dateTime={post.date}>
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
              }).format(new Date(post.date))}
            </time>
          </span>
          <span className="text-slate-500 text-sm tracking-tight font-mono block mt-1">
            {readingTime} minute read
          </span>
        </section>

        <section className="py-5">
          <article className="prose prose-lg table-wrapper">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </article>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
    </>
  );
}
