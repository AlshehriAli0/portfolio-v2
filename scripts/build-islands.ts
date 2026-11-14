/**
 * Builds the post islands (islands/*.tsx) for the browser with Preact in place of React,
 * hashed into public/islands/, and writes the manifest the server-side <Island> reads.
 * Each island's name is its file name; islands/ui/ holds the parts they share.
 * Run before `next build`; see islands/README.md.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { type NodePath, type PluginObject, types as t, transformSync } from "@babel/core";
import { normalizeRsOptions, transform } from "@stylexswc/rs-compiler";
import { type BunPlugin, build, gzipSync, resolveSync } from "bun";

const root = path.join(import.meta.dir, "..");
const islandsDir = path.join(root, "islands");
const uiDir = path.join(islandsDir, "ui");
const outDir = path.join(root, "public", "islands");
const entryDir = path.join(root, "node_modules", ".cache", "island-entries");

// Same options as next.config.mjs (production), so class names match the server HTML.
const rsOptions = normalizeRsOptions({
  dev: false,
  runtimeInjection: false,
  treeshakeCompensation: true,
  aliases: { "@/*": [path.join(root, "*")] },
  unstable_moduleResolution: { type: "commonJS", rootDir: root },
});

const names = readdirSync(islandsDir)
  .filter(file => file.endsWith(".tsx"))
  .map(file => file.slice(0, -4));
// Next 15 runs the React Compiler on client bundles only, and islands never reach one,
// so check them here with the same panic threshold: any component it can't compile
// fails the build. The browser bundle ships uncompiled; these components are small.
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";
const components = [
  ...names.map(name => path.join(islandsDir, `${name}.tsx`)),
  ...readdirSync(uiDir)
    .filter(file => file.endsWith(".tsx"))
    .map(file => path.join(uiDir, file)),
];
for (const file of components) {
  const out = transformSync(readFileSync(file, "utf8"), {
    filename: file,
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ["typescript", "jsx"] },
    plugins: [["babel-plugin-react-compiler", { panicThreshold: "all_errors" }]],
  });
  if (!out?.code?.includes("react/compiler-runtime"))
    throw new Error(`React Compiler skipped ${path.relative(root, file)}`);
}

/**
 * The fallback renders only on the server, so the browser build drops it from the island's
 * `export default defineIsland({ component, fallback })` and the bundler shakes it out.
 */
const dropFallback = (): PluginObject => ({
  visitor: {
    ExportDefaultDeclaration(exp: NodePath<t.ExportDefaultDeclaration>) {
      const call = exp.node.declaration;
      const definition =
        t.isCallExpression(call) && t.isIdentifier(call.callee, { name: "defineIsland" }) ? call.arguments[0] : null;
      if (!t.isObjectExpression(definition)) {
        throw exp.buildCodeFrameError("An island's default export must be defineIsland({ component, fallback })");
      }
      definition.properties = definition.properties.filter(
        p => !(t.isObjectProperty(p) && t.isIdentifier(p.key, { name: "fallback" }))
      );
    },
  },
});

function withoutFallback(file: string, source: string) {
  const out = transformSync(source, {
    filename: file,
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ["typescript", "jsx"] },
    plugins: [dropFallback],
  });
  if (!out?.code) throw new Error(`Could not read island ${file}`);
  return out.code;
}

// Every StyleX class each island module can emit, for the server's class-name check.
// The shared UI's classes count for every island.
const classes = new Map<string, Set<string>>();
const shared = new Set<string>();

const stylexPlugin: BunPlugin = {
  name: "stylex",
  setup(builder) {
    builder.onLoad({ filter: /\/(islands|styles)\/.+\.tsx?$/ }, ({ path: file }) => {
      const name = path.relative(islandsDir, file).replace(/\.tsx$/, "");
      const isIsland = names.includes(name);
      const source = readFileSync(file, "utf8");
      const result = transform(file, isIsland ? withoutFallback(file, source) : source, rsOptions);
      const emitted = (result.metadata.stylex ?? []).map(([className]) => className);
      if (isIsland) classes.set(name, new Set(emitted));
      else if (file.startsWith(`${uiDir}/`)) for (const className of emitted) shared.add(className);
      return { contents: result.code, loader: file.endsWith("x") ? "tsx" : "ts" };
    });
  },
};

// Components import hooks from "react"; the browser gets Preact's.
const preactPlugin: BunPlugin = {
  name: "preact",
  setup(builder) {
    const shim = path.join(import.meta.dir, "react-shim.ts");
    builder.onResolve({ filter: /^react$/ }, () => ({ path: shim }));
    builder.onResolve({ filter: /^react\/jsx(-dev)?-runtime$/ }, () => ({
      path: resolveSync("preact/jsx-runtime", root),
    }));
  },
};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
rmSync(entryDir, { recursive: true, force: true });
mkdirSync(entryDir, { recursive: true });
for (const name of names) {
  writeFileSync(
    path.join(entryDir, `${name}.tsx`),
    [
      `import { h, hydrate } from "preact";`,
      `import island from ${JSON.stringify(path.join(islandsDir, `${name}.tsx`))};`,
      "export default (root: Element, props: object) => hydrate(h(island.component, props), root);",
      "",
    ].join("\n")
  );
}

const result = await build({
  entrypoints: names.map(name => path.join(entryDir, `${name}.tsx`)),
  outdir: outDir,
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  naming: { entry: "[name]-[hash].[ext]", chunk: "chunk-[hash].[ext]" },
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [preactPlugin, stylexPlugin],
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const manifest: Record<string, { src: string; files: string[]; classes: string[] }> = {};
const outputs = result.outputs.map(o => ({ kind: o.kind, file: path.relative(outDir, o.path) }));
for (const name of names) {
  const entry = outputs.find(o => o.kind === "entry-point" && o.file.startsWith(`${name}-`));
  if (!entry) throw new Error(`No output for island ${name}`);
  const own = classes.get(name);
  if (!own?.size) throw new Error(`No StyleX classes found for island ${name}`);
  // The entry and the chunks it imports: what one island costs on a page.
  const files = [entry.file];
  for (const file of files) {
    const code = readFileSync(path.join(outDir, file), "utf8");
    for (const [, dep = ""] of code.matchAll(/from\s*"\.\/([^"]+)"/g)) if (!files.includes(dep)) files.push(dep);
  }
  manifest[name] = { src: `/islands/${entry.file}`, files, classes: [...own, ...shared] };
}
writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

for (const [name, { files }] of Object.entries(manifest)) {
  const gzip = files.reduce((sum, f) => sum + gzipSync(readFileSync(path.join(outDir, f))).length, 0);
  console.log(`island ${name}: ${(gzip / 1024).toFixed(2)} KB gzip (${files.join(", ")})`);
}
