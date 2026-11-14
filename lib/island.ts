import type { ComponentType } from "react";

/** An island: what Preact hydrates, and what readers without JavaScript see instead. */
export type IslandDefinition<P extends object = object> = {
  component: ComponentType<P>;
  /** Server-rendered under `@media (scripting: none)`; never hydrated. */
  fallback: ComponentType<P>;
};

/** The default export of every islands/<name>.tsx. The island's name is its file name. */
export const defineIsland = <P extends object>(definition: IslandDefinition<P>) => definition;

/** `query-count` → `QueryCount`: the island's tag in MDX. */
export const tagName = (name: string) => name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
