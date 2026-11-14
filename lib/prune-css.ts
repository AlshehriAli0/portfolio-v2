import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postcss, { type AtRule } from "postcss";

// Toggled on <html> at runtime by the theme script, so never in the static markup.
const RUNTIME_CLASSES = ["dark", "light", "theme-switching"];
// Set by the client script (data-copied), by islands as you use them (data-state, data-theme,
// data-pulse, aria-*) or by the browser (open, on a folded code block's <details>), so they can
// be missing from the static markup.
const RUNTIME_ATTRIBUTES = /^(data-copied|data-ghost|data-state|data-theme|data-pulse|hidden|open|aria-.*)$/;
const CONTAINERS = new Set(["media", "supports", "container", "layer"]);
// `:not(…)`, allowing one level of nested parentheses inside it.
const NEGATION = /:not\((?:[^()]|\([^()]*\))*\)/g;
// A View Transition pseudo-element's argument (`::view-transition-old(.post-title)`) names
// a transition name or class, never a class in the markup.
const VT_ARGUMENT = /(::view-transition-[a-z-]+)\([^)]*\)/g;

let compiled: string | null = null;

/** Every built stylesheet, concatenated. Read once per build. */
export function builtCss() {
  if (compiled === null) {
    const dir = join(process.cwd(), ".next", "static", "css");
    compiled = readdirSync(dir)
      .filter(file => file.endsWith(".css"))
      .sort()
      .map(file => readFileSync(join(dir, file), "utf8"))
      .join("\n");
  }
  return compiled;
}

/**
 * Drops every rule whose selector needs a class or attribute that never appears in `html`, then
 * any keyframes nothing animates and any at-rule left empty. StyleX emits atomic
 * classes, so this is exact: each page inlines only the CSS it can match.
 */
export function pruneCss(css: string, html: string) {
  const used = new Set(RUNTIME_CLASSES);
  for (const [, list = ""] of html.matchAll(/class="([^"]*)"/g)) {
    for (const name of list.split(/\s+/)) if (name) used.add(name);
  }

  const attributes = new Set<string>();
  for (const [tag] of html.matchAll(/<[a-z][^>]*>/g)) {
    for (const [, name = ""] of tag.matchAll(/\s([^\s=/>"]+)/g)) attributes.add(name);
  }
  const present = (selector: string) =>
    (selector.match(/\.-?[_a-zA-Z][\w-]*/g) ?? []).every(cls => used.has(cls.slice(1))) &&
    (selector.match(/\[[a-z][\w-]*/g) ?? []).every(
      attr => attributes.has(attr.slice(1)) || RUNTIME_ATTRIBUTES.test(attr.slice(1))
    );

  const root = postcss.parse(css);

  root.walkRules(rule => {
    const parent = rule.parent as AtRule | undefined;
    if (parent?.type === "atrule" && parent.name.endsWith("keyframes")) return;
    // A class or attribute inside :not() only has to be absent, so it never decides whether a rule can match.
    const kept = rule.selectors.filter(selector => present(selector.replace(NEGATION, "").replace(VT_ARGUMENT, "$1")));
    if (kept.length === 0) rule.remove();
    else rule.selectors = kept;
  });

  const animated = new Set<string>();
  root.walkDecls(/^animation(-name)?$/, decl => {
    for (const word of decl.value.split(/[\s,]+/)) animated.add(word);
  });
  root.walkAtRules(/keyframes$/, at => {
    if (!animated.has(at.params)) at.remove();
  });

  // Nested containers can empty out in layers, so sweep until stable.
  let removed = true;
  while (removed) {
    removed = false;
    root.walkAtRules(at => {
      if (CONTAINERS.has(at.name) && !at.nodes?.length) {
        at.remove();
        removed = true;
      }
    });
  }

  return root.toString();
}
