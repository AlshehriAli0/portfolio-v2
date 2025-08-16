import { PageHeader } from "@/app/components/page-header";
import { ArticleLink } from "../components/article-link";
import { getAllPosts } from "@/lib/articles";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://ali-sh.com/posts",
  },
  openGraph: {
    url: "https://ali-sh.com/posts",
  },
};

export default async function Page() {
  const posts = await getAllPosts({
    includeDrafts: process.env.NODE_ENV === "development",
  });

  const filteredPosts = posts.filter((post) => {
    if (post.meta?.draft && process.env.NODE_ENV !== "development") {
      return false;
    }
    return true;
  });

  return (
    <main className="px-4 md:px-0">
      <PageHeader title="Writing" />
      <section className="divide-y">
        {filteredPosts.map((post) => {
          return (
            <ArticleLink
              key={post.meta.title}
              href={post.href}
              title={post.meta.title}
              summary={post.meta.summary}
              date={post.date}
            />
          );
        })}
        {/* <div className="flex flex-col pb-6">
          <Title as="h2" variant="secondary">
            No Posts Yet
          </Title>
          <p className="mt-2 text-slate-700 text-base">
            Stay tuned for awesome posts and blogs soon...
          </p>
        </div> */}
      </section>
    </main>
  );
}
