import * as stylex from "@stylexjs/stylex";
import type { GetStaticProps, PageConfig } from "next";
import { Page } from "@/components/page";
import { ArrowIcon, Container, PageTitle, Rows, Section } from "@/components/ui";
import { getPostSummaries, type PostSummary } from "@/lib/articles";
import { formatDay } from "@/lib/site";
import { colors } from "@/styles/tokens.stylex";

// Static HTML only: no React runtime is sent to the browser.
export const config: PageConfig = { unstable_runtimeJS: false };

type Props = { posts: PostSummary[] };

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: getPostSummaries() },
});

const ways = [
  { href: "/", label: "Home" },
  { href: "/info", label: "Info" },
  { href: "/posts", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound({ posts }: Props) {
  return (
    <Page path="/404" title="Not found" description="This page doesn’t exist." noindex>
      <main id="main" tabIndex={-1}>
        <Container>
          <PageTitle
            title="Lost"
            em={1.588}
            lsb={0.077}
            lede="This page doesn’t exist. Try one of these instead."
            side={
              <>
                {/* .rows/.row (globals.css): hovering one dims the others, like every list. */}
                <ul className={`rows ${stylex.props(styles.list).className}`}>
                  {ways.map(w => (
                    <li key={w.href} className={`row ${stylex.props(styles.item).className}`}>
                      <a href={w.href} {...stylex.props(styles.way)}>
                        <span>{w.label}</span>
                        <span aria-hidden="true" {...stylex.props(styles.arrow)}>
                          <ArrowIcon />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            }
          />

          {/* Most broken links point at a post, so the posts themselves are one step away. */}
          <Section id="recent" label="Recent posts" tight>
            <Rows
              rows={posts.slice(0, 3).map(p => ({
                key: p.slug,
                title: p.title,
                meta: `${formatDay(p.date)} · ${p.minutes} min`,
                href: p.href,
              }))}
            />
          </Section>
        </Container>
      </main>
    </Page>
  );
}

const styles = stylex.create({
  list: {
    borderTopWidth: "1px",
    borderColor: colors.line,
  },
  way: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingBlock: "0.85rem",
    borderBottomWidth: "1px",
    borderColor: colors.line,
    fontSize: "1.0625rem",
    cursor: "pointer",
  },
  item: {
    transitionProperty: "opacity",
    transitionDuration: "250ms",
  },
  arrow: { display: "flex", alignSelf: "center", fontSize: "1.375rem" },
});
