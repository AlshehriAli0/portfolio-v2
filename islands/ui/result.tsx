import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fonts } from "@/styles/tokens.stylex";

/**
 * The live results under a hairline. Screen readers hear each change. `groups` spaces
 * out blocks of several lines; the default packs single-line rows.
 */
export function Result({ children, spacing }: { children: ReactNode; spacing?: "rows" | "groups" }) {
  return (
    <output aria-live="polite" data-spacing={spacing ?? "rows"} {...stylex.props(styles.result)}>
      {children}
    </output>
  );
}

/** One result line: a dim label on the left, its value on the right. */
export function Row({ label, children }: { label: ReactNode; children?: ReactNode }) {
  return (
    <span {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.key)}>{label}</span> {children}
    </span>
  );
}

/**
 * Pads a readout to a constant length with no-break spaces (each 1ch in the mono face), so a
 * right-aligned number that gains a digit never moves where it starts.
 */
export const fixed = (text: string, length: number) => text.padStart(length, "\u00a0");

/** A number in a result: mono, tabular, never broken across lines. */
export function Num({ children }: { children: ReactNode }) {
  return <span {...stylex.props(styles.num)}>{children}</span>;
}

const styles = stylex.create({
  result: {
    display: "grid",
    gap: { default: "0.375rem", ':is([data-spacing="groups"])': "1.25rem" },
    paddingTop: "1.25rem",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.line,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: "1rem",
  },
  key: {
    color: colors.dim,
  },
  num: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
});
