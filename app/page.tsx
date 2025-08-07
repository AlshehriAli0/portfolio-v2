import Link from "next/link";
import { Metadata } from "next";

import { ArticleLink } from "./components/article-link";
import { getAllPosts } from "@/lib/articles";
import { Title } from "@/app/components/title";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/",
  },
  description:
    "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with Next.js, React & TypeScript.",
  openGraph: {
    url: "https://ali-sh.com/",
    title: "Ali Alshehri — Software Engineer",
    description:
      "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with Next.js, React & TypeScript.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Alshehri — Software Engineer",
    description:
      "Ali Alshehri — Software Engineer in Al Khobar, Saudi Arabia. I build high‑performance, accessible web apps with React & TypeScript.",
  },
};

export const dynamic = "force-static";

export default async function Home() {
  const posts = await getAllPosts({
    includeDrafts: process.env.NODE_ENV === "development",
  });

  return (
    <main className="px-6 md:px-0">
      <section className="pb-14 border-b border-slate-300 mb-14">
        <h1 className="font-semibold text-4xl mb-4 text-slate-950">
          {"HI, I'm Ali Alshehri."}
          <span className="block text-slate-500 font-normal text-2xl pt-1">
            A software engineer based in khobar.
          </span>
        </h1>
        <p className="text-slate-700 text-lg md:text-xl leading-normal">
          I work with amazing companies to create exceptional products.
        </p>
        <Link
          href="/info"
          className="group bg-slate-950 hover:bg-slate-800 transition-colors inline-block mt-8 font-mono text-xs font-semibold rounded-full px-8 py-3 text-white"
        >
          More Information{" "}
          <span className="inline-block group-hover:translate-x-1.5 transition-transform">
            →
          </span>
        </Link>
      </section>

      <section className="pt-10 pb-16">
        <Title as="h2" variant="secondary" className="mb-8">
          Recent Writing
        </Title>
        <div className="divide-y">
          {posts.slice(0, 3).map((post) => {
            return (
              <ArticleLink
                key={post?.meta.title}
                href={post.href}
                title={post.meta.title}
                date={post?.date}
                summary={post.meta.summary}
              />
            );
          })}
        </div>
        <Link
          href="/posts"
          className="group bg-slate-950 hover:bg-slate-800 transition-colors inline-block mt-8 font-mono text-xs font-semibold rounded-full px-8 py-3 text-white"
        >
          View More Posts{" "}
          <span className="inline-block group-hover:translate-x-2 transition-transform">
            →
          </span>
        </Link>
      </section>

      <section className="pb-16">
        <p className="text-slate-700 text-lg">
          You can find my personal projects on my{" "}
          <Link href="https://github.com/AlshehriAli0" className="underline">
            GitHub
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
