import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as stylex from "@stylexjs/stylex";
import { type ComponentType, createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Manifest = Record<string, { src: string; classes: string[] }>;

let manifest: Manifest | null = null;

/** Written by scripts/build-islands.ts, which runs before `next build`. */
function islandManifest(): Manifest {
  if (manifest === null) {
    manifest = JSON.parse(readFileSync(join(process.cwd(), "public", "islands", "manifest.json"), "utf8")) as Manifest;
  }
  return manifest;
}

type IslandProps<P extends object> = {
  /** The file name in islands/, without the extension. */
  name: string;
  component: ComponentType<P>;
  props: P;
  /** What readers without JavaScript see instead. */
  fallback: ReactNode;
};

/**
 * Server-renders an interactive post component for Preact to hydrate in the browser.
 * The loader in lib/client-script.ts imports `data-src` once the island nears the
 * viewport and hydrates the first child with the JSON props. Server-only.
 */
export function Island<P extends object>({ name, component, props, fallback }: IslandProps<P>) {
  const entry = islandManifest()[name];
  if (!entry) throw new Error(`Island "${name}" is missing from the manifest: run scripts/build-islands.ts`);

  const html = renderToStaticMarkup(createElement(component, props));
  // The browser build compiles StyleX on its own; a class it doesn't know means the two
  // builds disagree, and the island would hydrate unstyled.
  const known = new Set(entry.classes);
  for (const [, list = ""] of html.matchAll(/class="([^"]*)"/g)) {
    for (const className of list.split(/\s+/)) {
      if (className && !known.has(className)) {
        throw new Error(`Island "${name}": class "${className}" isn't in the browser build`);
      }
    }
  }

  return (
    <div data-island={name} data-src={entry.src} {...stylex.props(styles.island)}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: our own component, rendered at build time */}
      <div {...stylex.props(styles.live)} dangerouslySetInnerHTML={{ __html: html }} />
      <div {...stylex.props(styles.fallback)}>{fallback}</div>
      <script
        type="application/json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON props; `<` is escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(props).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}

const NO_JS = "@media (scripting: none)";

const styles = stylex.create({
  island: {
    minWidth: 0,
  },
  live: {
    display: { default: "block", [NO_JS]: "none" },
  },
  fallback: {
    display: { default: "none", [NO_JS]: "block" },
  },
});
