import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fonts } from "@/styles/tokens.stylex";

/** A labelled input: the label, an optional live value on its right, then the input. */
export function Field({
  id,
  label,
  value,
  children,
}: {
  id: string;
  label: string;
  value?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.field)}>
      <div {...stylex.props(styles.head)}>
        <label htmlFor={id} {...stylex.props(styles.label)}>
          {label}
        </label>
        {value === undefined ? null : <span {...stylex.props(styles.value)}>{value}</span>}
      </div>
      {children}
    </div>
  );
}

type RangeProps = {
  id: string;
  label: string;
  value: number;
  /** Shown beside the label; defaults to the value. */
  display?: string;
  min: number;
  max: number;
  step: number;
  valueText: string;
  onValue: (value: number) => void;
};

/** A native range with its label and current value. */
export function RangeField({ id, label, value, display, min, max, step, valueText, onValue }: RangeProps) {
  return (
    <Field id={id} label={label} value={display ?? value}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        // React fires onChange on every move; Preact (the client) needs onInput for that.
        onInput={event => onValue(Number(event.currentTarget.value))}
        onChange={event => onValue(Number(event.currentTarget.value))}
        {...stylex.props(styles.range)}
      />
    </Field>
  );
}

const styles = stylex.create({
  field: {
    display: "grid",
    gap: "0.5rem",
    minWidth: 0,
  },
  head: {
    minHeight: "1.3125rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "1rem",
  },
  label: {
    fontSize: "0.875rem",
    color: colors.dim,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
  },
  range: {
    width: "100%",
    height: "44px",
    margin: 0,
    accentColor: colors.fg,
    cursor: "pointer",
    // A touch that starts on the slider belongs to the slider, like a native iOS slider,
    // so dragging it never scrolls the page too. (pan-y isn't enough: iOS Safari can
    // turn the drag into a page scroll partway through.)
    touchAction: "none",
  },
});
