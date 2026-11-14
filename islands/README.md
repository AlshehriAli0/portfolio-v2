# Islands

Interactive parts of a post. Each one is server-rendered to HTML, then hydrated by Preact.

## Adding one

1. Create `islands/<name>.tsx`. Its default export is `defineIsland({ component, fallback })` from `@/lib/island`.
2. Use it in a post as `<PascalName />` (`query-count.tsx` is `<QueryCount />`). MDX attributes become its props and must be JSON.

The file name is the island's only name: the MDX tag, the bundle, ids (`${ID}-users`) and radio group names come from it. Build the frame from `islands/ui` (import from `./ui`, never a file inside it, so the shared UI stays one chunk: `Panel`, `Controls`, `Button`, `Field`, `RangeField`, `Segmented`, `Result`, `Row`, `Num`, `Caption`, `Figure`, `vars`); keep only the island's own logic and visuals in its file.

## Rules

- No effects. Keep state narrow and derive everything else during render. Timers start in event handlers.
- Never swap StyleX classes by state. Set `data-state` or a custom property and style that. Active and filled states use `colors.fg`. Colours come only from `colors` in `@/styles/tokens.stylex` (roles defined in `styles/palette.ts`); the build fails on a colour literal anywhere else.
- Keep every `stylex.props` call static: local styles only, values known at render through `vars()`, variants through attributes. Dynamic styles, `xstyle` and imported style objects ship StyleX's runtime (about 0.7 KB). `Figure` takes `xstyle` because it renders only on the server.
- A no-JS `fallback` is required: plain HTML for `@media (scripting: none)`, never hydrated.
- Results go in `<Result>` (an `<output aria-live="polite">`). Every input has a label. No motion without a reduced-motion path.
- Budget: 10 KB gzip of island JS per post, shared chunks counted once. `bun scripts/build-islands.ts` prints each island's cost.

## How it hydrates

`scripts/build-islands.ts` checks every component with the React Compiler, bundles each island with Preact in place of React (shared chunks split out) and writes `public/islands/manifest.json`. On the server, `components/island.tsx` renders the component and the fallback, fails the build on any class the browser bundle lacks, and inlines the props as JSON. In the browser, the loader in `lib/client-script.ts` imports an island's bundle when it comes within 200px of the viewport and hydrates it in place.
