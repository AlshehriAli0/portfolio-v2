import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { defineIsland } from "@/lib/island";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { Caption, Figure, fixed, Panel, RangeField, Result, vars } from "./ui";

// The post's example fetches 100 users. The loop awaits one photo query per user.
// 999 users is 1,000 queries with the users query, so the max lands on exactly 100 marks.
const MIN = 1;
const MAX = 999;
const DEFAULT_USERS = 100;
// One mark stands for this many queries; the last one fills in proportion to the rest.
const PER_MARK = 10;
// One slot per mark at the max, all always laid out, so the panel keeps its height whatever
// the count: 100 slots fill two rows of 50 columns, or four of 25 in a narrow column.
const SLOTS = queriesBefore(MAX) / PER_MARK;
const ID = "query-count";
const CAPTION = "Counts follow from the code above: one query for the users, then one for each user’s photo.";
// One database round trip, app server to database and back: a typical figure within one
// region. The queries run one after another, so the waits add up.
const RTT_MS = 20;
const RTT_NOTE = `At ${RTT_MS}\u00a0ms per database round trip (an example, not a measurement).`;
// The widest total, "1,000 queries · 20.00 s", so every total keeps one width.
const TOTAL_WIDTH = 23;

/** The post's "before" code runs one query for the users, then one per user. */
export function queriesBefore(users: number) {
  return users + 1;
}

const count = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** Milliseconds under a second, seconds to two decimals from there. */
const wait = (queries: number) => {
  const ms = queries * RTT_MS;
  return ms < 1000 ? `${ms}\u00a0ms` : `${(ms / 1000).toFixed(2)}\u00a0s`;
};

const total = (queries: number) => `${count(queries, "query", "queries")} · ${wait(queries)}`;

/** Full marks for each 10 queries, then one mark filled to the remainder (55 is 5½ marks). */
function Marks({ count, slots }: { count: number; slots: number }) {
  const full = Math.floor(count / PER_MARK);
  const rest = (count % PER_MARK) / PER_MARK;
  return (
    <span aria-hidden="true" {...stylex.props(styles.grid)}>
      {Array.from({ length: slots }, (_, i) => {
        const state = i < full ? "on" : i === full && rest > 0 ? "part" : "off";
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed slots, never reordered
            key={i}
            data-state={state}
            style={state === "part" ? vars({ "--fill": rest }) : undefined}
            {...stylex.props(styles.mark)}
          />
        );
      })}
    </span>
  );
}

/** A label on the left and its count on the right, over that row's marks. */
function Line({ label, queries, slots }: { label: string; queries: number; slots: number }) {
  return (
    <span {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.head)}>
        <span {...stylex.props(styles.key)}>{label}</span>
        <span {...stylex.props(styles.total)}>{fixed(total(queries), TOTAL_WIDTH)}</span>
      </span>
      <Marks count={queries} slots={slots} />
    </span>
  );
}

function QueryCount() {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const before = queriesBefore(users);

  return (
    <Panel>
      <RangeField
        id={`${ID}-users`}
        label="Users fetched"
        value={users}
        display={fixed(users.toLocaleString("en-US"), 5)}
        min={MIN}
        max={MAX}
        step={1}
        valueText={`${count(users, "user", "users")}: ${total(before)} before, ${total(1)} after`}
        onValue={setUsers}
      />

      <Caption>{RTT_NOTE}</Caption>

      <Result spacing="groups">
        <Line label="Before" queries={before} slots={SLOTS} />
        <Line label="After" queries={1} slots={1} />
        <span aria-hidden="true" {...stylex.props(styles.contain)}>
          <span {...stylex.props(styles.grid, styles.legend)}>
            <span data-state="on" {...stylex.props(styles.mark)} />
            <span {...stylex.props(styles.legendText)}>= {PER_MARK} queries</span>
          </span>
        </span>
      </Result>

      <Caption>{CAPTION}</Caption>
    </Panel>
  );
}

/** The counts and waits at three sizes, for readers without JavaScript. Server-only. */
function QueryCountText() {
  return (
    <Figure caption={`${CAPTION} ${RTT_NOTE}`} xstyle={styles.fallback}>
      {[10, 100, 1000].map(n => (
        <p
          key={n}
          {...stylex.props(styles.line)}
        >{`${count(n, "user", "users")}: ${total(queriesBefore(n))} before, ${total(1)} after.`}</p>
      ))}
    </Figure>
  );
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";
// From here 50 columns stay at least about 6px wide. Each row is its own query container.
const wideRow = "@container (min-width: 28rem)";

const styles = stylex.create({
  // A label and its count on one line, over the marks.
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "1rem",
    minHeight: "1.3125rem",
  },
  key: {
    fontSize: "0.875rem",
    color: colors.dim,
  },
  // Right-aligned tabular digits padded to one width, so the count and wait change in place
  // as the slider moves. They update instantly: a fade on every drag step would only flicker.
  total: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    textAlign: "end",
  },
  fallback: {
    gap: "0.25rem",
  },
  line: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
  },
  row: {
    display: "grid",
    gap: "0.5rem",
    containerType: "inline-size",
  },
  // The legend's own query container, so it picks the same columns as the rows.
  contain: {
    display: "block",
    containerType: "inline-size",
  },
  // Every row of marks (and the legend) shares one grid: 50 equal columns, 25 in a narrow
  // column, so 100 marks fill whole rows edge to edge and a mark is the same width in
  // every row. Sized from the panel's width, not the viewport's.
  grid: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(25, minmax(0, 1fr))", [wideRow]: "repeat(50, minmax(0, 1fr))" },
    gap: "0.1875rem",
    minWidth: 0,
  },
  // Every slot is always laid out; a mark only fades and grows from its baseline, so moving
  // the slider never reflows the row. The partial mark scales from its left edge to --fill.
  // Leaving marks go faster (100ms) than arriving ones (160ms).
  mark: {
    display: "block",
    height: "1rem",
    backgroundColor: colors.fg,
    transformOrigin: "left bottom",
    opacity: { default: 1, ':is([data-state="off"])': 0 },
    transform: {
      default: "none",
      ':is([data-state="part"])': "scaleX(var(--fill))",
      ':is([data-state="off"])': { default: "scaleY(0.4)", [REDUCE]: "none" },
    },
    transitionProperty: { default: "opacity, transform", [REDUCE]: "none" },
    transitionDuration: { default: "160ms", ':is([data-state="off"])': "100ms" },
    transitionTimingFunction: motion.outUi,
  },
  // The key under the rows, in the caption's dim size.
  legend: {
    alignItems: "center",
    fontSize: "0.8125rem",
    lineHeight: "1rem",
    color: colors.dim,
  },
  legendText: {
    gridColumn: "2 / -1",
    marginLeft: "0.1875rem",
    whiteSpace: "nowrap",
  },
});

export default defineIsland({ component: QueryCount, fallback: QueryCountText });
