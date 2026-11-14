import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import { lightDark } from "@/styles/palette";
import { mdxComponents } from "./mdx-components";

type HastNode = {
  type: string;
  tagName?: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
  data?: { meta?: string | null };
};

/**
 * Renumbers headings so a post's outline starts at h2 (the page owns the h1) and
 * never skips a level. Posts are written freely; the HTML stays well-formed.
 */
function rehypeHeadingLevels() {
  return (tree: HastNode) => {
    const headings: { node: HastNode; level: number }[] = [];
    const collect = (node: HastNode) => {
      const match = node.type === "element" ? node.tagName?.match(/^h([1-6])$/) : null;
      if (match) headings.push({ node, level: Number(match[1]) });
      node.children?.forEach(collect);
    };
    collect(tree);

    // Shift so the post's top level becomes h2, then close any skipped levels.
    const shift = 2 - Math.min(...headings.map(h => h.level));
    let previous = 1;
    for (const { node, level } of headings) {
      const next = Math.min(level + shift, previous + 1);
      node.tagName = `h${next}`;
      previous = next;
    }
  };
}

/**
 * Flags an image in a post's first two blocks as the lead image (PostImage loads it
 * eagerly at high priority): there it sits in the first screen and is often the LCP.
 */
function rehypeLeadImage() {
  return (tree: HastNode) => {
    const blocks = (tree.children ?? []).filter(node => node.type === "element").slice(0, 2);
    for (const block of blocks) {
      const img = block.tagName === "img" ? block : block.children?.find(node => node.tagName === "img");
      if (img) {
        img.properties = { ...img.properties, dataLead: "" };
        return;
      }
    }
  };
}

// A fence's meta `collapse` folds the block to its first 16 lines; `collapse=24` picks the count.
const COLLAPSE = /(?:^|\s)collapse(?:=(\d+))?(?=\s|$)/;
const COLLAPSE_LINES = 16;

/**
 * Folds long code blocks (```ts collapse```). Runs after rehype-pretty-code, which keeps the
 * fence's meta on the code element. The highlighted lines split into two code elements, the
 * first `fold` lines and the rest; CodeBlock shows the first and puts the rest in a native
 * <details>, which the browser hides itself, so find-in-page and text fragments still open it.
 * A block barely longer than its fold stays whole: hiding three lines behind a click costs
 * more than it saves.
 */
function rehypeCollapse() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      const code = node.tagName === "pre" ? node.children?.[0] : undefined;
      const match = code?.tagName === "code" ? code.data?.meta?.match(COLLAPSE) : null;
      if (code && match) {
        const fold = Number(match[1] ?? COLLAPSE_LINES);
        const children = code.children ?? [];
        const lines = children.filter(child => child.properties?.["data-line"] !== undefined);
        const last = lines[fold - 1];
        if (last && lines.length > fold + 4) {
          const cut = children.indexOf(last) + 1;
          // The newline between the two halves goes with neither: each code ends on a line.
          const rest = children.slice(cut).filter((child, i) => !(i === 0 && child.type === "text"));
          node.children = [
            { ...code, children: children.slice(0, cut) },
            { ...code, children: rest },
          ];
          node.properties = { ...node.properties, "data-collapse": String(fold), "data-lines": String(lines.length) };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** Compiles a post and renders it to static HTML at build time. Server-only. */
export async function renderMdx(source: string) {
  const compiled = await compile(source, {
    outputFormat: "function-body",
    // Curly quotes and apostrophes. Dashes stay as typed: posts use no em dashes, so
    // `---` must never turn into one. Code is left alone.
    remarkPlugins: [remarkGfm, [remarkSmartypants, { dashes: false }]],
    rehypePlugins: [
      rehypeHeadingLevels,
      rehypeLeadImage,
      [
        rehypePrettyCode,
        {
          // Dual theme: tokens carry both colors and classifyTokens() writes them as one
          // per-theme value, so switching theme needs no re-highlight.
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
      rehypeCollapse,
    ],
  });
  const { default: Content } = await run(compiled, { ...runtime, baseUrl: import.meta.url });
  return classifyTokens(renderToStaticMarkup(<Content components={await mdxComponents()} />));
}

/**
 * Shiki writes both theme colors inline on every token (`style="--shiki-light:…;
 * --shiki-dark:…"`), which is most of a code-heavy post's HTML. A post only uses a
 * dozen or so distinct combinations, so each becomes one shared class instead.
 * In code blocks the most common one becomes the code's own color, and its tokens
 * lose their spans.
 */
function classifyTokens(html: string) {
  const classes = new Map<string, { name: string; count: number }>();
  const classified = html
    // Nothing reads these, and every code element repeats them.
    .replace(/ data-(?:language|theme)="[^"]*"/g, "")
    .replace(/<code style="display:grid">/g, "<code>")
    .replace(/ style="(--shiki-[^"]*)"/g, (_, style: string) => {
      let entry = classes.get(style);
      if (!entry) {
        entry = { name: `tk${classes.size}`, count: 0 };
        classes.set(style, entry);
      }
      entry.count++;
      return ` class="${entry.name}"`;
    });

  const value = (style: string, key: string) => style.match(new RegExp(`--shiki-${key}:([^;]+)`))?.[1];
  // Syntax colours come from the Shiki themes, not the palette; only the light/dark pairing is shared.
  const color = (style: string) =>
    `color:${lightDark(value(style, "light") ?? "inherit", value(style, "dark") ?? "inherit")}`;
  const [base] = [...classes]
    .filter(([style]) => !style.includes("font-style"))
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([style, { name }]) => ({ style, name }));

  const body = base
    ? classified.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, pre =>
        pre.replaceAll(new RegExp(`<span class="${base.name}">([^<]*)</span>`, "g"), "$1")
      )
    : classified;

  const rules = [...classes].map(([style, { name }]) => {
    const decls = [color(style)];
    const light = value(style, "light-font-style");
    const dark = value(style, "dark-font-style");
    if (light || dark) decls.push(`font-style:${light ?? dark}`);
    return `.${name}{${decls.join(";")}}`;
  });
  if (base) rules.push(`pre>code{${color(base.style)}}`);
  return rules.length ? `<style>${rules.join("")}</style>${body}` : body;
}
