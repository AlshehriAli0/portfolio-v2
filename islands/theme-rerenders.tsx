import * as stylex from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from "react";
import { defineIsland } from "@/lib/island";
import { colors, fonts } from "@/styles/tokens.stylex";
import { Button, Caption, Figure, Panel, Result, Segmented } from "./ui";

const ID = "theme-rerenders";
const MODES = [
  { value: "context", label: "In React context" },
  { value: "css", label: "Unistyles-style" },
] as const;
type Mode = (typeof MODES)[number]["value"];
type Theme = "base" | "inverse";

const HINT: Record<Mode, string> = {
  context: "Every component calls useContext(ThemeContext) for its colours.",
  css: "Colours come from CSS variables; no component reads the theme.",
};
const START = "No re-renders yet";
// Screen, Header, Card, Title, Text and Button.
const COMPONENTS = 6;
const CAPTION =
  "Real render counts in your browser. Unistyles does the theme swap on the native side; CSS variables are the web equivalent.";

/** The mock app's theme, the way many apps share one: a context every component reads. */
const ThemeContext = createContext<Theme>("base");

/** What the summary line shows: the last action and how many components it re-rendered. */
type Status = { action: string; rendered: number | null; seq: number };

/** Counts every render of the mock app, so an action can report how many it caused. */
type Probe = { renders: number; measure: (what: string, action: () => void) => void };

function createProbe(report: (what: string, rendered: number) => void): Probe {
  const probe: Probe = {
    renders: 0,
    measure(what, action) {
      const before = probe.renders;
      action();
      // Preact renders in a microtask; by the next task every render has been counted.
      window.setTimeout(() => report(what, probe.renders - before), 0);
    },
  };
  return probe;
}

// Padded to two digits (every mono glyph is 1ch), so "1 re-render" and "12 re-renders" start
// their digits in the same place; the box below is fixed at the longer label's width.
const rerenders = (n: number) => `${String(n).padStart(2, "\u00a0")} ${n === 1 ? "re-render" : "re-renders"}`;

type NodeProps = { name: string; probe: Probe; theme?: Theme; pressable?: boolean; children?: ReactNode };

/** One component of the mock app: its name and how many times it has re-rendered. */
function Box({ name, probe, theme, pressable, children }: NodeProps) {
  // Counting renders is a side effect of rendering by design, so the compiler leaves it alone.
  "use no memo";
  const renders = useRef(0);
  renders.current += 1;
  probe.renders += 1;
  const [pressed, setPressed] = useState(false);
  const count = renders.current - 1;
  // Alternates so the pulse animation restarts on every re-render; none on the first render.
  const pulse = count === 0 ? "none" : count % 2 ? "odd" : "even";
  const head = (
    <span {...stylex.props(styles.head)}>
      <span>{name}</span>
      <span {...stylex.props(styles.count)}>{rerenders(count)}</span>
    </span>
  );
  const ring = <span aria-hidden="true" data-pulse={pulse} {...stylex.props(styles.ring)} />;

  if (pressable) {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        data-theme={theme}
        onClick={() => probe.measure("Button pressed", () => setPressed(!pressed))}
        {...stylex.props(styles.node, styles.press)}
      >
        {ring}
        {head}
        <span {...stylex.props(styles.head)}>
          <span {...stylex.props(styles.state)}>{`isPressed: ${pressed}`}</span>
          <span {...stylex.props(styles.cue)}>Press me</span>
        </span>
      </button>
    );
  }
  return (
    <div data-theme={theme} {...stylex.props(styles.node)}>
      {ring}
      {head}
      {children}
    </div>
  );
}

/** The same component, reading the theme from context like most React apps do. */
function ContextBox(props: NodeProps) {
  const theme = useContext(ThemeContext);
  return <Box {...props} theme={theme} />;
}

/** The mock app: Screen > Header, Card (Title, Text), Button. */
function App({ Node, probe }: { Node: typeof Box; probe: Probe }) {
  return (
    <Node name="Screen" probe={probe}>
      <Node name="Header" probe={probe} />
      <Node name="Card" probe={probe}>
        <Node name="Title" probe={probe} />
        <Node name="Text" probe={probe} />
      </Node>
      <Node name="Button" probe={probe} pressable />
    </Node>
  );
}

function ThemeRerenders() {
  const [mode, setMode] = useState<Mode>("context");
  const [theme, setTheme] = useState<Theme>("base");
  // Bumped by "Reset counts": a new key remounts the app with fresh counters.
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState<Status>({ action: START, rendered: null, seq: 0 });
  const [probe] = useState(() =>
    createProbe((action, rendered) => setStatus(s => ({ action, rendered, seq: s.seq + 1 })))
  );
  const frame = useRef<HTMLDivElement>(null);

  // Built once per mode and run, so the demo's own state never re-renders the app.
  const app = useMemo(
    () => <App key={`${mode}-${run}`} Node={mode === "context" ? ContextBox : Box} probe={probe} />,
    [mode, run, probe]
  );

  function switchTheme() {
    probe.measure("Theme switched", () => {
      if (mode === "context") {
        setTheme(theme === "base" ? "inverse" : "base");
        return;
      }
      // Unistyles-style: the theme changes outside React, on the frame's attribute.
      const el = frame.current;
      if (el) el.dataset.theme = el.dataset.theme === "inverse" ? "base" : "inverse";
    });
  }

  function changeMode(next: Mode) {
    // Carry the current theme across, so only where it lives changes.
    const el = frame.current;
    if (el && next === "css") el.dataset.theme = theme;
    if (next === "context") setTheme(el?.dataset.theme === "inverse" ? "inverse" : "base");
    setMode(next);
    setStatus(s => ({ action: START, rendered: null, seq: s.seq + 1 }));
  }

  return (
    <Panel>
      <div {...stylex.props(styles.controls)}>
        <Segmented
          legend="Where the theme lives"
          name={`${ID}-mode`}
          options={MODES}
          value={mode}
          onChange={changeMode}
        />
        <div {...stylex.props(styles.buttons)}>
          <Button onClick={switchTheme}>Switch theme</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRun(run + 1);
              setStatus(s => ({ action: "Counts reset", rendered: null, seq: s.seq + 1 }));
            }}
          >
            Reset counts
          </Button>
        </div>
      </div>
      {/* Both hints share one cell, so the line is always as tall as the longer one. */}
      <div {...stylex.props(styles.hints)}>
        {MODES.map(m => (
          <p key={m.value} data-state={m.value === mode ? "on" : "off"} {...stylex.props(styles.hint)}>
            {HINT[m.value]}
          </p>
        ))}
      </div>

      <div id={`${ID}-app`} ref={frame} {...stylex.props(styles.frame)}>
        <ThemeContext.Provider value={theme}>{app}</ThemeContext.Provider>
      </div>

      <Result>
        {/* A new key per action re-adds the text, so screen readers announce a repeat too. */}
        <span key={status.seq} {...stylex.props(styles.status)}>
          <span {...stylex.props(styles.action)}>{status.action}</span>{" "}
          <span {...stylex.props(styles.rendered)}>
            {status.rendered === null ? "\u00a0" : `${status.rendered} of ${COMPONENTS} re-rendered`}
          </span>
        </span>
      </Result>
      <Caption>{CAPTION}</Caption>
    </Panel>
  );
}

/** The outcome in two columns, for readers without JavaScript. Server-only. */
function ThemeRerendersSummary() {
  return (
    <Figure caption="Local state, like a pressed button, still re-renders the component in both.">
      <div {...stylex.props(styles.summary)}>
        <p {...stylex.props(styles.cell)}>
          <strong {...stylex.props(styles.cellHead)}>Theme in context</strong>
          Every consumer re-renders.
        </p>
        <p {...stylex.props(styles.cell)}>
          <strong {...stylex.props(styles.cellHead)}>Unistyles</strong>0 re-renders, styles update natively.
        </p>
      </div>
    </Figure>
  );
}

// The two names differ only so the animation restarts on every re-render: identical keyframes
// would share one hashed name, and the browser would not replay it.
const pulseOdd = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});
const pulseEven = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0.001 },
});

const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const INVERSE = ':is([data-theme="inverse"])';
const BASE = ':is([data-theme="base"])';
const PRESSED = ':is([aria-pressed="true"])';
const WIDE = "@media (min-width: 30rem)";

const styles = stylex.create({
  controls: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "1rem",
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  hints: {
    display: "grid",
    marginTop: "-0.75rem",
  },
  hint: {
    gridArea: "1 / 1",
    fontSize: "0.875rem",
    color: colors.dim,
    opacity: { default: 1, ':is([data-state="off"])': 0 },
    visibility: { default: "visible", ':is([data-state="off"])': "hidden" },
    transitionProperty: "opacity, visibility",
    transitionDuration: { default: "150ms", ':is([data-state="off"])': "100ms" },
    transitionTimingFunction: "ease",
  },
  // The mock app's own two themes, from the site's tokens. Set here by default, and on a
  // component when it reads the theme from context.
  frame: {
    "--app-bg": { default: colors.bg, [INVERSE]: colors.fg },
    "--app-fg": { default: colors.fg, [INVERSE]: colors.bg },
  },
  node: {
    "--app-bg": { default: null, [BASE]: colors.bg, [INVERSE]: colors.fg },
    "--app-fg": { default: null, [BASE]: colors.fg, [INVERSE]: colors.bg },
    position: "relative",
    display: "grid",
    gap: "0.5rem",
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.dim,
    backgroundColor: "var(--app-bg)",
    color: "var(--app-fg)",
    font: "inherit",
    textAlign: "start",
    // The theme swap crossfades (Apple: ease light/dark changes, never a hard flash). Colour
    // only, so nothing is laid out again.
    transitionProperty: "background-color, color, border-color",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
  },
  // Flashes on each re-render: an inset ring that only fades (opacity), so it can never move or
  // resize anything. It stays under reduced motion, where a fade is not movement and is what
  // shows which components re-rendered.
  ring: {
    position: "absolute",
    inset: 0,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--ring, var(--app-fg))",
    opacity: 0,
    pointerEvents: "none",
    animationName: {
      default: "none",
      ':is([data-pulse="odd"])': pulseOdd,
      ':is([data-pulse="even"])': pulseEven,
    },
    animationDuration: "300ms",
    animationTimingFunction: "ease",
  },
  // The Button looks like one: a full-strength border, a fill on hover, a dip when pressed
  // (scale 0.97 over 120ms, back in 80ms), and a solid fill while isPressed is true.
  press: {
    "--ring": { default: null, [PRESSED]: "var(--app-bg)" },
    cursor: "pointer",
    borderColor: "var(--app-fg)",
    backgroundColor: {
      default: "var(--app-bg)",
      ":hover": { default: null, [HOVER]: "color-mix(in srgb, var(--app-fg) 10%, var(--app-bg))" },
      [PRESSED]: "var(--app-fg)",
    },
    color: { default: "var(--app-fg)", [PRESSED]: "var(--app-bg)" },
    transform: { default: null, ":active": { default: "scale(0.97)", [REDUCE]: null } },
    transitionProperty: "transform, background-color, color, border-color",
    transitionDuration: { default: "80ms, 200ms, 200ms, 200ms", ":active": "120ms, 200ms, 200ms, 200ms" },
    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1), ease, ease, ease",
    outlineWidth: "2px",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineColor: "var(--app-fg)",
    outlineOffset: "2px",
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "1rem",
    fontSize: "0.875rem",
  },
  // Fixed at the width of "isPressed: false", so toggling never resizes the line.
  state: {
    width: "16ch",
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    textAlign: "start",
    opacity: 0.7,
  },
  // Mono and tabular, fixed at the width of "12 re-renders", so a count never moves anything.
  count: {
    width: "13ch",
    flexShrink: 0,
    fontFamily: fonts.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "pre",
  },
  // A fixed grid: the action on the left and its count in a column held at the width of
  // "6 of 6 re-rendered". Narrow screens stack them in two rows. Either way every box keeps its
  // size and place, and only the words inside change.
  status: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "minmax(0, 1fr) auto" },
    gridTemplateRows: { default: "1.5em 1.5em", [WIDE]: "1.5em" },
    columnGap: "1rem",
    alignItems: "baseline",
  },
  action: {
    color: colors.dim,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rendered: {
    width: "18ch",
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    textAlign: { default: "start", [WIDE]: "end" },
  },
  cue: {
    fontSize: "0.8125rem",
    opacity: 0.7,
  },
  summary: {
    display: "grid",
    marginBottom: "0.75rem",
    gridTemplateColumns: { default: "minmax(0, 1fr)", "@media (min-width: 36rem)": "repeat(2, minmax(0, 1fr))" },
    gap: "0.75rem",
    fontSize: "0.9375rem",
  },
  cell: {
    display: "grid",
    gap: "0.25rem",
    padding: "0.75rem 1rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.line,
  },
  cellHead: {
    fontWeight: 500,
  },
});

export default defineIsland({ component: ThemeRerenders, fallback: ThemeRerendersSummary });
