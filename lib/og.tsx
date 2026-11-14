import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const SITE = "ALI-SH.COM";
const NAME = "Ali Alshehri";
const ROLE = "Software engineer";
const HANDLE = "@alicantcode";

const color = {
  bg: "#0a0a0a",
  fg: "#ecebe6",
  dim: "#8d8c86",
  faint: "#4c4b47",
  hairline: "rgba(236,235,230,0.1)",
};

// Grid, in px. The frame sits INSET from every edge, split into a header band,
// a body, and a footer band. The header and footer are cut into three equal cells.
const INSET = 40;
const BAND = 52;
const PAD = 24;
const FRAME_W = OG_SIZE.width - INSET * 2;
const CELL_W = FRAME_W / 3;
const COLS = [INSET, INSET + CELL_W, INSET + CELL_W * 2, OG_SIZE.width - INSET];
const ROWS = [INSET, INSET + BAND, OG_SIZE.height - INSET - BAND, OG_SIZE.height - INSET];
const BODY_H = ROWS[2] - ROWS[1];
const TEXT_W = FRAME_W - PAD * 2;

const MONO_SIZE = 15;
const DISPLAY_LEADING = 0.92;

// Same tracking as the post title on the site, a touch tighter at poster sizes.
function trackingFor(size: number) {
  return size >= 88 ? -0.045 : -0.035;
}

// Advance widths (per 1000 em) of Saans 560 for ASCII 32-126, read from og-saans-560.ttf.
// Used to pick the largest title size that wraps into at most three lines.
const SAANS_560_ADVANCE = [
  209, 246, 354, 711, 604, 830, 672, 188, 277, 277, 508, 588, 224, 399, 222, 457, 648, 357, 576, 593, 639, 586, 622,
  542, 605, 622, 230, 235, 589, 591, 589, 510, 922, 687, 627, 730, 693, 574, 557, 761, 715, 253, 568, 646, 543, 927,
  717, 787, 618, 787, 651, 600, 587, 688, 669, 995, 588, 635, 595, 292, 457, 292, 546, 543, 299, 536, 602, 545, 603,
  558, 342, 595, 581, 227, 227, 529, 227, 893, 581, 581, 603, 602, 376, 479, 354, 581, 497, 766, 470, 515, 484, 310,
  243, 310, 603,
];
const FALLBACK_ADVANCE = 640;

function textWidth(text: string, size: number) {
  const tracking = trackingFor(size) * 1000;
  let units = 0;
  for (const char of text) {
    units += (SAANS_560_ADVANCE[char.charCodeAt(0) - 32] ?? FALLBACK_ADVANCE) + tracking;
  }
  return (units / 1000) * size;
}

function lineCount(words: string[], size: number, maxWidth: number) {
  let lines = 1;
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) <= maxWidth || !line) {
      line = next;
      continue;
    }
    lines += 1;
    line = word;
  }
  return lines;
}

const MAX_TITLE_SIZE = 128;
const MIN_TITLE_SIZE = 52;
// The home card stacks the name like the site's hero: two light lines, 0.75 apart
// (no descenders). "Alshehri" is 3.12em wide, so 322px spans ~94% of the text column,
// and two lines fit between the top rule and the footer band.
const HOME_NAME_SIZE = 322;
const HOME_LEADING = 0.75;
const MAX_TITLE_LINES = 3;
// Three lines at full size would crowd the header band, so cap the block height.
const MAX_TITLE_BLOCK = 300;

function fitTitle(title: string) {
  const words = title.split(/\s+/).filter(Boolean);
  // Keep a margin for kerning, which the advance table ignores.
  const maxWidth = TEXT_W * 0.94;
  for (let size = MAX_TITLE_SIZE; size > MIN_TITLE_SIZE; size -= 4) {
    const longestWord = Math.max(...words.map(word => textWidth(word, size)));
    const lines = lineCount(words, size, maxWidth);
    const fits = longestWord <= maxWidth && lines <= MAX_TITLE_LINES;
    if (fits && lines * size * DISPLAY_LEADING <= MAX_TITLE_BLOCK) return size;
  }
  return MIN_TITLE_SIZE;
}

function formatDate(iso: string | undefined) {
  const date = iso ? new Date(iso) : undefined;
  if (!date || Number.isNaN(date.getTime())) return String(new Date().getUTCFullYear());
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}

export type OgCard = { kind: "home" } | { kind: "post"; title: string; date?: string; minutes?: number };

function Mono({ children, color: tone = color.dim }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: "Mono",
        fontSize: MONO_SIZE,
        letterSpacing: MONO_SIZE * 0.06,
        textTransform: "uppercase",
        color: tone,
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}

function Line({ x, y, vertical }: { x?: number; y?: number; vertical?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: color.hairline,
        ...(vertical
          ? { left: x, top: 0, width: 1, height: OG_SIZE.height }
          : { top: y, left: 0, height: 1, width: OG_SIZE.width }),
      }}
    />
  );
}

const CROSS = 11;

function Cross({ x, y }: { x: number; y: number }) {
  const arm = { position: "absolute", backgroundColor: color.dim } as const;
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: x - (CROSS - 1) / 2,
        top: y - (CROSS - 1) / 2,
        width: CROSS,
        height: CROSS,
      }}
    >
      <div style={{ ...arm, left: (CROSS - 1) / 2, top: 0, width: 1, height: CROSS }} />
      <div style={{ ...arm, top: (CROSS - 1) / 2, left: 0, height: 1, width: CROSS }} />
    </div>
  );
}

function Band({ y, cells }: { y: number; cells: React.ReactNode[] }) {
  return (
    <div style={{ position: "absolute", left: INSET, top: y, width: FRAME_W, height: BAND, display: "flex" }}>
      {cells.map((cell, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional and never reorder
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: index === cells.length - 1 ? "flex-end" : "flex-start",
            width: CELL_W,
            height: BAND,
            paddingLeft: PAD,
            paddingRight: PAD,
          }}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

function PostTitle({ title }: { title: string }) {
  const size = fitTitle(title);
  return (
    <div
      style={{
        position: "absolute",
        left: INSET + PAD,
        top: ROWS[1],
        width: TEXT_W,
        height: BODY_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: PAD + 8,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Saans",
          fontWeight: 500,
          fontSize: size,
          letterSpacing: size * trackingFor(size),
          lineHeight: DISPLAY_LEADING,
          color: color.fg,
          textWrap: "balance",
          wordBreak: "break-word",
          // Pull the stems flush with the text column; Saans has a wide left bearing at display sizes.
          marginLeft: -size * 0.04,
        }}
      >
        {title}
      </div>
    </div>
  );
}

// "Ali" with the tagline in the field to its right, "Alshehri" across the frame:
// the same composition as the site's first screen.
function HomeName() {
  // Each line box is 0.76em; the glyphs overhang it the same way they do on the site.
  const line = { display: "flex", height: HOME_NAME_SIZE * HOME_LEADING, lineHeight: HOME_LEADING } as const;
  return (
    <div
      style={{
        position: "absolute",
        left: INSET + PAD,
        top: INSET,
        width: TEXT_W,
        height: ROWS[2] - INSET,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: 0,
        fontFamily: "Saans",
        fontWeight: 300,
        fontSize: HOME_NAME_SIZE,
        // A touch looser than the site (-0.058em): the card is height-bound, so the tracking
        // takes up the width the size cannot.
        letterSpacing: HOME_NAME_SIZE * -0.036,
        color: color.fg,
      }}
    >
      <div style={{ ...line, justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ marginLeft: -HOME_NAME_SIZE * 0.02 }}>Ali</span>
      </div>
      <div style={line}>
        <span style={{ marginLeft: -HOME_NAME_SIZE * 0.02 }}>Alshehri</span>
      </div>
    </div>
  );
}

export function OgCardView({ card }: { card: OgCard }) {
  const home = card.kind === "home";
  const rows = home ? [ROWS[0], ROWS[2], ROWS[3]] : ROWS;
  const bands = home ? [ROWS[2]] : [ROWS[0], ROWS[2]];
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", backgroundColor: color.bg }}>
      {rows.map(y => (
        <Line key={`r${y}`} y={y} />
      ))}
      {[COLS[0], COLS[3]].map(x => (
        <Line key={`c${x}`} x={x} vertical />
      ))}
      {bands.flatMap(y =>
        [COLS[1], COLS[2]].map(x => (
          <div
            key={`d${x}-${y}`}
            style={{ position: "absolute", left: x, top: y, width: 1, height: BAND, backgroundColor: color.hairline }}
          />
        ))
      )}
      {card.kind === "post" ? (
        <>
          <Band
            y={ROWS[0]}
            cells={[
              <Mono key="site">{SITE}</Mono>,
              <Mono key="section">Writing</Mono>,
              <Mono key="stamp">{formatDate(card.date)}</Mono>,
            ]}
          />
          <PostTitle title={card.title} />
        </>
      ) : (
        <HomeName />
      )}
      <Band
        y={ROWS[2]}
        cells={[
          <Mono key="name" color={color.fg}>
            {home ? SITE : NAME}
          </Mono>,
          <Mono key="detail">{card.kind === "post" && card.minutes ? `${card.minutes} min read` : ROLE}</Mono>,
          <Mono key="handle">{HANDLE}</Mono>,
        ]}
      />
      {rows.flatMap(y => COLS.map(x => <Cross key={`x${x}-${y}`} x={x} y={y} />))}
    </div>
  );
}

// Literal paths so output file tracing bundles the fonts with the serverless function.
// Satori needs TTF/OTF; the site's woff2 files will not load here. The weights are
// the site's own: 300 for the name, 400 for text, 560 for post titles.
function loadFonts() {
  return Promise.all([
    readFile(join(process.cwd(), "app/fonts/og-saans-300.ttf")),
    readFile(join(process.cwd(), "app/fonts/og-saans-400.ttf")),
    readFile(join(process.cwd(), "app/fonts/og-saans-560.ttf")),
    readFile(join(process.cwd(), "app/fonts/og-mono-500.ttf")),
  ]);
}

export async function ogImageResponse(card: OgCard) {
  const [saans300, saans400, saans560, mono500] = await loadFonts();
  return new ImageResponse(<OgCardView card={card} />, {
    ...OG_SIZE,
    fonts: [
      { name: "Saans", data: saans300, weight: 300, style: "normal" },
      { name: "Saans", data: saans400, weight: 400, style: "normal" },
      // Satori only takes hundreds; this file is the 560 instance.
      { name: "Saans", data: saans560, weight: 500, style: "normal" },
      { name: "Mono", data: mono500, weight: 500, style: "normal" },
    ],
  });
}
