import type { StyleXStyles } from "@stylexjs/stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "@/styles/tokens.stylex";

/** The raised frame every island sits in. `dense` tightens the gap between its parts. */
export function Panel({ children, dense }: { children: ReactNode; dense?: boolean }) {
  return (
    <div data-density={dense ? "dense" : undefined} {...stylex.props(styles.panel)}>
      {children}
    </div>
  );
}

/** Inputs side by side from 36rem, the last one at its own width. */
export function Controls({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.controls)}>{children}</div>;
}

/** Small dim text under a demo or a figure. */
export function Caption({ as, children }: { as?: "p" | "span" | "figcaption"; children: ReactNode }) {
  const Tag = as ?? "p";
  return <Tag {...stylex.props(styles.note)}>{children}</Tag>;
}

/** The no-JS fallback's frame: a figure with a caption. */
export function Figure({
  caption,
  children,
  xstyle,
}: {
  caption: ReactNode;
  children: ReactNode;
  xstyle?: StyleXStyles;
}) {
  return (
    <figure {...stylex.props(styles.figure, xstyle)}>
      {children}
      <Caption as="figcaption">{caption}</Caption>
    </figure>
  );
}

const styles = stylex.create({
  panel: {
    display: "grid",
    gap: { default: "1.5rem", ':is([data-density="dense"])': "1.25rem" },
    padding: "clamp(1rem, 3vw, 1.5rem)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.raised,
    color: colors.fg,
    fontSize: "0.9375rem",
    lineHeight: 1.5,
  },
  controls: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", "@media (min-width: 36rem)": "minmax(0, 1fr) auto" },
    gap: "1.25rem 2rem",
    alignItems: "start",
  },
  note: {
    fontSize: "0.8125rem",
    color: colors.dim,
  },
  figure: {
    display: "grid",
    color: colors.fg,
  },
});
