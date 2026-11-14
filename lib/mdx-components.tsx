import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { CodeBlock } from "@/components/code-block";
import { Island } from "@/components/island";
import { PostImage } from "@/components/post-image";
import { type IslandDefinition, tagName } from "@/lib/island";
import prose from "@/styles/prose.module.css";

/** Wide tables scroll inside their own box instead of the page. */
function PostTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard-reachable
    <section className={prose.tableWrap} tabIndex={0} aria-label="Table (scrolls horizontally)">
      <table {...props} />
    </section>
  );
}

type IslandModule = { default: IslandDefinition };
// webpack's require.context: the folder's matching modules, resolved at build time. Islands
// import StyleX, an ESM external on the server, so each one arrives as a promise.
type IslandContext = { keys(): string[]; (key: string): IslandModule | Promise<IslandModule> };
type WebpackRequire = { context(directory: string, recursive: boolean, filter: RegExp): IslandContext };

const islandContext = (require as unknown as WebpackRequire).context("../islands", false, /^\.\/[a-z0-9-]+\.tsx$/);

/**
 * Every islands/<name>.tsx, as `<PascalName />`. Adding a file is all it takes; its MDX
 * attributes become the island's props, so they must be JSON.
 */
async function loadIslands(): Promise<MDXComponents> {
  const entries = await Promise.all(
    islandContext.keys().map(async key => {
      const name = key.slice(2, -4);
      const { component, fallback: Fallback } = (await islandContext(key)).default;
      const Tag = (props: object) => (
        <Island name={name} component={component} props={props} fallback={<Fallback {...props} />} />
      );
      return [tagName(name), Tag] as const;
    })
  );
  return Object.fromEntries(entries);
}

let components: Promise<MDXComponents> | null = null;

/** Static HTML, except the islands, which Preact hydrates once they near the viewport. */
export function mdxComponents() {
  components ??= loadIslands().then(islands => ({ pre: CodeBlock, img: PostImage, table: PostTable, ...islands }));
  return components;
}
