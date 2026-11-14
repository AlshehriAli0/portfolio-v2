import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { defineIsland } from "@/lib/island";
import { colors, fonts, motion } from "@/styles/tokens.stylex";
import { Caption, Figure, fixed, Panel, RangeField, Result } from "./ui";

// The post's example fetches 100 users. The loop awaits one photo query per user.
const MIN = 1;
const MAX = 1000;
const DEFAULT_USERS = 100;
// Marks drawn per row; the rest are counted as "+ N more". The "before" row always renders
// every slot, so it keeps its height whatever the count.
const MARKS = 60;
const ID = "query-count";
const CAPTION = "Counts follow from the code above: one query for the users, then one for each user’s photo.";

/** The post's "before" code runs one query for the users, then one per user. */
export const queriesBefore = (users: number) => users + 1;

const count = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

function Marks({ count, slots }: { count: number; slots: number }) {
  const more = count - MARKS;
  // Only a full row can overflow; it always holds its "+ N more" line, empty or not.
  const overflows = slots === MARKS;
  return (
    <span aria-hidden="true" {...stylex.props(styles.marksRow)}>
      <span {...stylex.props(styles.marks)}>
        {Array.from({ length: slots }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed slots, never reordered
          <span key={i} data-state={i < count ? "on" : "off"} {...stylex.props(styles.mark)} />
        ))}
      </span>
      {overflows ? (
        <span {...stylex.props(styles.more)}>{more > 0 ? `+ ${more.toLocaleString("en-US")} more` : ""}</span>
      ) : null}
    </span>
  );
}

/** A label on the left and its count on the right, over that row's marks. */
function Line({ label, queries, slots }: { label: string; queries: number; slots: number }) {
  return (
    <span {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.head)}>
        <span {...stylex.props(styles.key)}>{label}</span>
        <span {...stylex.props(styles.total)}>{fixed(count(queries, "query", "queries"), 13)}</span>
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
        valueText={`${count(users, "user", "users")}, ${count(before, "query", "queries")} before, 1 after`}
        onValue={setUsers}
      />

      <Result spacing="groups">
        <Line label="Before" queries={before} slots={MARKS} />
        <Line label="After" queries={1} slots={1} />
      </Result>

      <Caption>{CAPTION}</Caption>
    </Panel>
  );
}

/** The counts at three sizes, for readers without JavaScript. Server-only. */
function QueryCountText() {
  return (
    <Figure caption={CAPTION} xstyle={styles.fallback}>
      {[10, 100, 1000].map(n => (
        <p
          key={n}
          {...stylex.props(styles.line)}
        >{`${n.toLocaleString("en-US")} users: ${queriesBefore(n).toLocaleString("en-US")} queries before, 1 after.`}</p>
      ))}
    </Figure>
  );
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";

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
  // Right-aligned tabular digits, so the count changes in place as the slider moves.
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
  },
  // The marks, then the "+ N more" count on its own line, so the label never sits
  // beside a wrapped row.
  marksRow: {
    display: "grid",
    gap: "0.375rem",
  },
  marks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
    flexGrow: 1,
    minWidth: 0,
  },
  // Every slot is always laid out; a mark only fades and grows from its baseline, so moving
  // the slider never reflows the row. Leaving marks go faster (100ms) than arriving ones (160ms).
  mark: {
    display: "block",
    width: "0.375rem",
    height: "1rem",
    backgroundColor: colors.fg,
    transformOrigin: "bottom",
    opacity: { default: 1, ':is([data-state="off"])': 0 },
    transform: { default: "none", ':is([data-state="off"])': { default: "scaleY(0.4)", [REDUCE]: "none" } },
    transitionProperty: { default: "opacity, transform", [REDUCE]: "none" },
    transitionDuration: { default: "160ms", ':is([data-state="off"])': "100ms" },
    transitionTimingFunction: motion.outUi,
  },
  // Always one line tall, empty or not, so the panel never changes height.
  more: {
    minHeight: "1rem",
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    lineHeight: "1rem",
    fontVariantNumeric: "tabular-nums",
    color: colors.dim,
  },
});

export default defineIsland({ component: QueryCount, fallback: QueryCountText });
