import * as stylex from "@stylexjs/stylex";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { vars } from "./vars";

type Props<T extends string | number> = {
  legend: string;
  /** The radio group's name; derive it from the island's name. */
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** `numeric`: short mono labels (1×, 2×), spaced like a RangeField beside it. */
  variant?: "text" | "numeric";
};

/**
 * Native radios drawn as joined, equal-width segments. The checked one is a filled copy of the
 * labels clipped to its segment, so the fill and the inverted text travel together.
 */
export function Segmented<T extends string | number>({ legend, name, options, value, onChange, variant }: Props<T>) {
  const look = variant ?? "text";
  const n = options.length;
  const index = options.findIndex(o => o.value === value);
  return (
    <fieldset data-variant={look} {...stylex.props(styles.fieldset)}>
      <legend {...stylex.props(styles.legend)}>{legend}</legend>
      <div {...stylex.props(styles.segments)}>
        {options.map(o => (
          <label key={o.value} data-variant={look} {...stylex.props(styles.segment)}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              {...stylex.props(styles.radio)}
            />
            {o.label}
          </label>
        ))}
        <span
          aria-hidden="true"
          data-variant={look}
          style={vars({ "--from": `${(index / n) * 100}%`, "--to": `${((n - 1 - index) / n) * 100}%` })}
          {...stylex.props(styles.indicator)}
        >
          {options.map(o => (
            <span key={o.value} data-variant={look} {...stylex.props(styles.segment, styles.copy)}>
              {o.label}
            </span>
          ))}
        </span>
      </div>
    </fieldset>
  );
}

const NUMERIC = ':is([data-variant="numeric"])';
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const styles = stylex.create({
  fieldset: {
    display: { default: "block", [NUMERIC]: "grid" },
    gap: "0.5rem",
    borderWidth: 0,
    minWidth: 0,
  },
  legend: {
    float: "left",
    fontSize: "0.875rem",
    color: colors.dim,
    minHeight: "1.3125rem",
    marginBottom: "0.5rem",
  },
  // Equal columns, so segment i always spans i/n to (i + 1)/n and the indicator's clip is exact.
  segments: {
    clear: "left",
    position: "relative",
    display: "grid",
    width: "fit-content",
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    outlineStyle: { default: "none", ":has(:focus-visible)": "solid" },
    outlineWidth: "2px",
    outlineColor: colors.fg,
    outlineOffset: "2px",
    // The whole control dips while pressed (emil: every pressable answers the press).
    transform: { default: null, ":active": { default: "scale(0.98)", [REDUCE]: null } },
    transitionProperty: "transform",
    transitionDuration: { default: "80ms", ":active": "120ms" },
    transitionTimingFunction: motion.outUi,
  },
  segment: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: { default: "5rem", [NUMERIC]: "3.25rem" },
    height: "42px",
    paddingInline: { default: "0.875rem", [NUMERIC]: "0.75rem" },
    borderInlineStartWidth: { default: "1px", ":first-child": 0 },
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colors.lineStrong,
    fontFamily: { default: null, [NUMERIC]: fonts.mono },
    fontSize: { default: null, [NUMERIC]: "0.875rem" },
    fontVariantNumeric: { default: null, [NUMERIC]: "tabular-nums" },
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  // The filled copy: drawn over the labels, clipped to the checked segment.
  indicator: {
    position: "absolute",
    inset: 0,
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
    backgroundColor: colors.fg,
    color: colors.bg,
    pointerEvents: "none",
    clipPath: "inset(0 var(--to) 0 var(--from))",
    // Travel between segments, ease-out so it answers at once; under reduced motion it jumps.
    transitionProperty: { default: "clip-path", [REDUCE]: "none" },
    transitionDuration: "200ms",
    transitionTimingFunction: motion.outUi,
  },
  copy: {
    borderInlineStartColor: "transparent",
    cursor: "default",
  },
  // Native radio, kept in the tab order and the accessibility tree, drawn by its label.
  radio: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    cursor: "pointer",
  },
});
