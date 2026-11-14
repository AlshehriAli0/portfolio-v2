import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { defineIsland } from "@/lib/island";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { Caption, Controls, fixed, Num, Panel, RangeField, Result, Row, Segmented, vars } from "./ui";

// The post's example: <img srcset="… 480w, … 768w, … 1280w" sizes="(max-width: 768px) 100vw, 50vw">
const CANDIDATES = [
  { file: "image-small.jpg", width: 480 },
  { file: "image-medium.jpg", width: 768 },
  { file: "image-large.jpg", width: 1280 },
] as const;
const DENSITIES = [
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 3, label: "3×" },
] as const;
type Density = (typeof DENSITIES)[number]["value"];
const MIN = 320;
const MAX = 1920;
// The widest request the controls can make: a 1920px window at 3x needs 960 × 3.
const SCALE = (MAX / 2) * 3;
const ID = "srcset-picker";

/** What the browser does with the post's srcset and sizes, minus caching and network hints. */
export function pick(viewport: number, density: number) {
  const narrow = viewport <= 768;
  const slot = narrow ? viewport : Math.round(viewport / 2);
  const needed = slot * density;
  // The smallest file that covers the slot at this density, or the largest there is.
  const chosen = CANDIDATES.find(c => c.width >= needed) ?? CANDIDATES[CANDIDATES.length - 1];
  return { narrow, slot, needed, chosen };
}

const px = (n: number) => `${n.toLocaleString("en-US")} px`;

function SrcsetPicker() {
  const [viewport, setViewport] = useState(390);
  const [density, setDensity] = useState<Density>(3);
  const { narrow, slot, needed, chosen } = pick(viewport, density);

  return (
    <Panel>
      <Controls>
        <RangeField
          id={`${ID}-width`}
          label="Viewport width"
          value={viewport}
          display={fixed(px(viewport), 8)}
          min={MIN}
          max={MAX}
          step={10}
          valueText={`${viewport} pixels, needs ${needed}`}
          onValue={setViewport}
        />
        <Segmented
          legend="Pixel density"
          name={`${ID}-density`}
          options={DENSITIES}
          value={density}
          onChange={setDensity}
          variant="numeric"
        />
      </Controls>

      <Result>
        <Row label="Matched sizes rule">
          {/* The whole sizes value with the matched rule lit: the text never changes, so the
              row never reflows, and it shows the order the browser reads the rules in. */}
          <code {...stylex.props(styles.code)}>
            <span
              data-state={narrow ? "on" : "off"}
              aria-hidden={narrow ? undefined : "true"}
              {...stylex.props(styles.rule)}
            >
              (max-width: 768px) 100vw
            </span>
            <span aria-hidden="true" {...stylex.props(styles.comma)}>
              ,{" "}
            </span>
            <span
              data-state={narrow ? "off" : "on"}
              aria-hidden={narrow ? "true" : undefined}
              {...stylex.props(styles.rule)}
            >
              50vw
            </span>
          </code>
        </Row>
        <Row label="Slot width">
          <Num>{fixed(px(slot), 6)}</Num>
        </Row>
        <Row label="Pixels needed">
          <span {...stylex.props(styles.sum)}>
            <Num>{`${fixed(String(slot), 3)} × ${density} = ${fixed(px(needed), 8)}`}</Num>
          </span>
        </Row>
        <Row label="Downloads">
          <code {...stylex.props(styles.code, styles.strong, styles.file)}>{chosen.file}</code>
        </Row>
      </Result>

      {/* biome-ignore lint/a11y/useSemanticElements: the post's prose styles target ul/li; a role keeps them out */}
      <div role="list" aria-label="Candidates in the srcset" {...stylex.props(styles.candidates)}>
        {CANDIDATES.map(c => {
          const isChosen = c === chosen;
          return (
            // biome-ignore lint/a11y/useSemanticElements: see the list above
            <div
              key={c.file}
              role="listitem"
              data-state={isChosen ? "chosen" : "idle"}
              aria-current={isChosen ? "true" : undefined}
              {...stylex.props(styles.candidate)}
            >
              <span {...stylex.props(styles.candidateName)}>{`${c.width}w`}</span>
              <span aria-hidden="true" {...stylex.props(styles.track)}>
                <span style={vars({ "--width": `${(c.width / SCALE) * 100}%` })} {...stylex.props(styles.bar)}>
                  <span data-state={isChosen ? "chosen" : "idle"} {...stylex.props(styles.fill)} />
                </span>
              </span>
            </div>
          );
        })}
        <span aria-hidden="true" style={vars({ "--at": Math.min(needed / SCALE, 1) })} {...stylex.props(styles.need)} />
      </div>

      <Caption>Simplified: browsers may reuse a cached larger file or pick a smaller one on slow connections.</Caption>
    </Panel>
  );
}

const ROWS = [
  { device: "Phone", viewport: 390, density: 3 },
  { device: "Tablet", viewport: 768, density: 2 },
  { device: "Laptop", viewport: 1440, density: 1 },
  { device: "Laptop", viewport: 1440, density: 2 },
] as const;

/** The same answers as a table, for readers without JavaScript. Server-only. */
function SrcsetTable() {
  return (
    <table {...stylex.props(styles.table)}>
      <caption {...stylex.props(styles.caption)}>Which file the post’s srcset downloads</caption>
      <thead>
        <tr>
          <th scope="col" {...stylex.props(styles.th)}>
            Device
          </th>
          <th scope="col" {...stylex.props(styles.th)}>
            Slot
          </th>
          <th scope="col" {...stylex.props(styles.th)}>
            Needs
          </th>
          <th scope="col" {...stylex.props(styles.th)}>
            Downloads
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(r => {
          const { slot, needed, chosen } = pick(r.viewport, r.density);
          return (
            <tr key={`${r.viewport}@${r.density}`}>
              <th scope="row" {...stylex.props(styles.td, styles.rowHead)}>
                {`${r.device} ${r.viewport} px @ ${r.density}×`}
              </th>
              <td {...stylex.props(styles.td)}>
                <Num>{px(slot)}</Num>
              </td>
              <td {...stylex.props(styles.td)}>
                <Num>{px(needed)}</Num>
              </td>
              <td {...stylex.props(styles.td)}>
                <code {...stylex.props(styles.code)}>{chosen.file}</code>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";

const styles = stylex.create({
  code: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
  },
  rule: {
    color: { default: colors.dim, ':is([data-state="on"])': colors.fg },
    transitionProperty: "color",
    transitionDuration: { default: "100ms", ':is([data-state="on"])': "160ms" },
    transitionTimingFunction: "ease",
  },
  comma: {
    color: colors.dim,
  },
  // Fixed at the longest name (image-medium.jpg) and left-aligned, so a shorter name never
  // moves where the text starts.
  file: {
    display: "inline-block",
    width: "calc(16ch + 1em)",
    textAlign: "start",
  },
  // Holds "1,920 × 3 = 5,760 px", so the row never switches between one line and two.
  sum: {
    display: "inline-block",
    minWidth: "20ch",
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    textAlign: "end",
  },
  strong: {
    fontWeight: 600,
  },
  candidates: {
    position: "relative",
    containerType: "inline-size",
    display: "grid",
    gap: "0.5rem",
  },
  candidate: {
    display: "grid",
    gridTemplateColumns: "3.5rem minmax(0, 1fr)",
    alignItems: "center",
    gap: "0.75rem",
    color: { default: colors.dim, ':is([data-state="chosen"])': colors.fg },
    transitionProperty: "color",
    transitionDuration: { default: "100ms", ':is([data-state="chosen"])': "160ms" },
    transitionTimingFunction: "ease",
  },
  candidateName: {
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    display: "block",
    height: "0.75rem",
  },
  bar: {
    display: "block",
    height: "100%",
    backgroundColor: colors.lineStrong,
    width: "var(--width)",
  },
  // The chosen bar fills in place: an opacity crossfade, never a width change, so the bars keep
  // their lengths (they are the data). Arriving 160ms, leaving 100ms.
  fill: {
    display: "block",
    height: "100%",
    backgroundColor: colors.fg,
    opacity: { default: 0, ':is([data-state="chosen"])': 1 },
    transitionProperty: "opacity",
    transitionDuration: { default: "100ms", ':is([data-state="chosen"])': "160ms" },
    transitionTimingFunction: motion.outUi,
  },
  // A hairline at the pixels needed, on the bars' scale: the chosen bar is the first to cross it.
  // It sits at the tracks' start and moves by transform (cqw is the list's width), so dragging
  // the slider never lays anything out. Ease-out at 150ms: it follows the thumb with no lag.
  need: {
    position: "absolute",
    top: "-0.25rem",
    bottom: "-0.25rem",
    left: "4.25rem",
    width: "1px",
    backgroundColor: colors.fg,
    transform: "translateX(calc((100cqw - 4.25rem) * var(--at)))",
    transitionProperty: { default: "transform", [REDUCE]: "none" },
    transitionDuration: "150ms",
    transitionTimingFunction: motion.outUi,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9375rem",
    color: colors.fg,
  },
  caption: {
    captionSide: "bottom",
    paddingTop: "0.75rem",
    textAlign: "start",
    fontSize: "0.8125rem",
    color: colors.dim,
  },
  th: {
    paddingBlock: "0.5rem",
    paddingRight: "1rem",
    textAlign: "start",
    fontWeight: 500,
    fontSize: "0.8125rem",
    color: colors.dim,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.lineStrong,
  },
  td: {
    paddingBlock: "0.5rem",
    paddingRight: "1rem",
    textAlign: "start",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
  },
  rowHead: {
    fontWeight: 400,
    whiteSpace: "nowrap",
  },
});

export default defineIsland({ component: SrcsetPicker, fallback: SrcsetTable });
