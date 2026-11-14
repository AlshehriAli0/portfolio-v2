import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { defineIsland } from "@/lib/island";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { Button, Caption, Figure, Panel, Segmented, vars } from "./ui";

// The post's figures: about 3 s a page before, and the three responses in its screenshot after.
const BEFORE_MS = 3000;
const AFTER_MS = [230, 252, 225] as const;
const PER_PAGE = 3;
const ID = "load-delay";
// A page's three rows arrive one after another, 40 then 50ms apart (emil: a 30–80ms stagger,
// uneven so it reads as a cascade, not a metronome).
const STAGGER_MS = [0, 40, 90] as const;

const MODES = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
] as const;
type Mode = (typeof MODES)[number]["value"];

const seconds = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

function LoadDelay() {
  const [mode, setMode] = useState<Mode>("before");
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  // Bumped on every click so the progress bar remounts and its animation starts over.
  const [run, setRun] = useState(0);
  const [delay, setDelay] = useState(BEFORE_MS);
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const afterIndex = useRef(0);

  function load() {
    // A second click restarts the wait instead of queueing another page.
    window.clearTimeout(timer.current);
    let ms: number = BEFORE_MS;
    if (mode === "after") {
      ms = AFTER_MS[afterIndex.current % AFTER_MS.length] ?? AFTER_MS[0];
      afterIndex.current += 1;
    }
    const next = pages + 1;
    setDelay(ms);
    setRun(run + 1);
    setLoading(true);
    setAnnouncement("");
    timer.current = window.setTimeout(() => {
      setPages(next);
      setLoading(false);
      setAnnouncement(`Page ${next} loaded in ${seconds(ms)}`);
    }, ms);
  }

  // "done" keeps the finished bar so it can fade out instead of snapping back to empty.
  const state = loading ? "loading" : run > 0 ? "done" : "idle";
  const rows = Array.from({ length: pages * PER_PAGE }, (_, i) => i);

  return (
    <Panel dense>
      <div {...stylex.props(styles.controls)}>
        <Segmented legend="Query" name={`${ID}-mode`} options={MODES} value={mode} onChange={setMode} />
        <Button onClick={load}>Load next page</Button>
      </div>

      <div {...stylex.props(styles.progressRow)}>
        <span data-state={state} {...stylex.props(styles.track)}>
          <span
            key={run}
            data-state={state}
            style={vars({ "--duration": `${delay}ms` })}
            {...stylex.props(styles.fill)}
          />
        </span>
        <span data-state={state} {...stylex.props(styles.loadingText)}>
          {`Loading… (${seconds(delay)})`}
        </span>
      </div>

      <div {...stylex.props(styles.feed)}>
        {/* biome-ignore lint/a11y/useSemanticElements: the post's prose styles target ul/li; a role keeps them out */}
        <div
          id={`${ID}-feed`}
          role="list"
          aria-label="Feed"
          aria-busy={loading ? "true" : "false"}
          {...stylex.props(styles.list)}
        >
          {rows.map(i => (
            // biome-ignore lint/a11y/useSemanticElements: see the list above
            <div
              key={i}
              role="listitem"
              // The first page is in the server HTML; only rows a click adds animate in.
              data-state={i < PER_PAGE ? "static" : "new"}
              style={vars({ "--delay": `${STAGGER_MS[i % PER_PAGE] ?? 0}ms` })}
              {...stylex.props(styles.item)}
            >
              <span aria-hidden="true" {...stylex.props(styles.thumb)} />
              <span {...stylex.props(styles.lines)}>
                <span {...stylex.props(styles.itemLabel)}>{`Post ${i + 1}, page ${Math.floor(i / PER_PAGE) + 1}`}</span>
                <span
                  aria-hidden="true"
                  style={vars({ "--width": `${55 + ((i * 17) % 35)}%` })}
                  {...stylex.props(styles.line)}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <output aria-live="polite" {...stylex.props(styles.status)}>
        {announcement}
      </output>
      <Caption>Simulated delay, no network request. Delays are the post’s figures.</Caption>
    </Panel>
  );
}

/** Two bars at the post's figures, for readers without JavaScript. Server-only. */
function LoadDelayBars() {
  const bars = [
    { label: "Before", value: "3 s", fraction: 1 },
    { label: "After", value: "≈ 0.25 s", fraction: 0.25 / 3 },
  ];
  return (
    <Figure caption="Time to load the next page of the feed, from the post’s figures." xstyle={styles.bars}>
      {bars.map(b => (
        <div key={b.label} {...stylex.props(styles.barRow)}>
          <span {...stylex.props(styles.barLabel)}>{b.label}</span>
          <span aria-hidden="true" {...stylex.props(styles.barTrack)}>
            <span style={vars({ "--width": `${b.fraction * 100}%` })} {...stylex.props(styles.barFill)} />
          </span>
          <span {...stylex.props(styles.barValue)}>{b.value}</span>
        </div>
      ))}
    </Figure>
  );
}

const grow = stylex.keyframes({
  from: { transform: "scaleX(0)" },
  to: { transform: "scaleX(1)" },
});

const enter = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "none" },
});

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const REDUCE = "@media (prefers-reduced-motion: reduce)";
const LOADING = ':is([data-state="loading"])';
const DONE = ':is([data-state="done"])';

const styles = stylex.create({
  controls: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "1rem",
  },
  progressRow: {
    display: "grid",
    alignItems: "center",
    height: "1.5rem",
  },
  track: {
    gridArea: "1 / 1",
    display: { default: "block", [REDUCE]: "none" },
    height: "3px",
    overflow: "hidden",
    backgroundColor: colors.line,
  },
  // Fills over the simulated wait, then fades out once the page lands (120ms, faster than it
  // filled). The curve front-loads progress a little, like a real request, and still reaches the
  // end exactly when the rows arrive.
  fill: {
    display: "block",
    height: "100%",
    backgroundColor: colors.fg,
    transformOrigin: "left",
    transform: "scaleX(0)",
    opacity: { default: 1, [DONE]: 0 },
    animationName: { default: "none", [LOADING]: grow, [DONE]: grow },
    animationTimingFunction: "cubic-bezier(0.3, 0.5, 0.5, 1)",
    animationFillMode: "forwards",
    animationDuration: "var(--duration)",
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: motion.outUi,
  },
  loadingText: {
    gridArea: "1 / 1",
    display: { default: "none", [REDUCE]: { default: "none", ':is([data-state="loading"])': "block" } },
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    color: colors.dim,
  },
  // The feed keeps a fixed height and stays pinned to its newest row, so loading a
  // page never pushes the rest of the post down.
  feed: {
    display: "flex",
    flexDirection: "column-reverse",
    height: "12.5rem",
    overflowY: "auto",
    overscrollBehavior: "contain",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
  },
  // Top-aligned until the feed overflows, then pinned to the newest row.
  list: {
    display: "grid",
    marginBottom: "auto",
  },
  // New rows rise 6px and fade in (240ms ease-out); under reduced motion they only fade.
  item: {
    animationName: {
      default: "none",
      ':is([data-state="new"])': { default: enter, [REDUCE]: fadeIn },
    },
    animationDuration: "240ms",
    animationDelay: "var(--delay)",
    animationTimingFunction: motion.outUi,
    animationFillMode: "backwards",
    display: "flex",
    alignItems: "center",
    gap: "0.875rem",
    paddingBlock: "0.625rem",
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: colors.line,
  },
  thumb: {
    flexShrink: 0,
    width: "2.25rem",
    height: "2.25rem",
    backgroundColor: colors.line,
  },
  lines: {
    display: "grid",
    gap: "0.375rem",
    flexGrow: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    color: colors.dim,
  },
  line: {
    display: "block",
    height: "0.5rem",
    backgroundColor: colors.line,
    width: "var(--width)",
  },
  status: {
    display: "block",
    minHeight: "1.5em",
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  bars: {
    gap: "0.625rem",
    fontSize: "0.9375rem",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "4rem minmax(0, 1fr) 5.5rem",
    alignItems: "center",
    gap: "0.75rem",
  },
  barLabel: {
    color: colors.dim,
  },
  barTrack: {
    display: "block",
    height: "0.75rem",
  },
  barFill: {
    display: "block",
    height: "100%",
    backgroundColor: colors.fg,
    width: "var(--width)",
  },
  barValue: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    textAlign: "end",
  },
});

export default defineIsland({ component: LoadDelay, fallback: LoadDelayBars });
