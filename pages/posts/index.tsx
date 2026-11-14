import * as stylex from "@stylexjs/stylex";
import type { GetStaticProps, PageConfig } from "next";
import { Page } from "@/components/page";
import { Container, PageTitle, Rows } from "@/components/ui";
import { getPostSummaries, type PostSummary } from "@/lib/articles";
import { copy, formatDay } from "@/lib/site";
import { blog } from "@/lib/structured-data";

const DESCRIPTION = "Ali Alshehri’s blog: what he builds, what he learns and whatever else is on his mind.";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

type Props = { posts: PostSummary[] };

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: getPostSummaries() },
});

export default function PostsPage({ posts }: Props) {
  return (
    <Page path="/posts" title="Writing" description={DESCRIPTION} jsonLd={blog(posts, DESCRIPTION)}>
      <main id="main" tabIndex={-1}>
        <Container>
          <PageTitle title="Writing" lsb={0.012} lede={copy.writingLede} />
          <div {...stylex.props(styles.list)}>
            <Rows
              size="lg"
              ruled={false}
              rows={posts.map(p => ({
                key: p.slug,
                title: p.title,
                summary: p.summary,
                meta: `${formatDay(p.date)} \u00b7 ${p.minutes}\u00a0min`,
                href: p.href,
                morph: `post-${p.slug}`,
              }))}
            />
          </div>
        </Container>
      </main>
    </Page>
  );
}

const styles = stylex.create({
  list: {
    paddingBottom: "clamp(4.5rem, 10vw, 8.5rem)",
  },
});
