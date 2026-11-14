import type { CSSProperties } from "react";

/**
 * Inline custom properties for values only known at render (a width, a duration). The
 * element's static StyleX class reads them with `var()`, so its classes never change.
 */
export const vars = (values: Record<`--${string}`, string | number>) => values as CSSProperties;
