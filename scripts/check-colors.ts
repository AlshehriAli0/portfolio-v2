/**
 * Fails the build on a colour literal outside styles/palette.ts, so every colour is a
 * themed role there. Also checks that each palette role has its StyleX token.
 * Runs before `next build`; `bun scripts/check-colors.ts` to run it alone.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { Glob } from "bun";
import { type ColorRole, cssVar, palette } from "../styles/palette";

const root = path.join(import.meta.dir, "..");
const DIRS = ["app", "components", "islands", "lib", "pages", "scripts", "styles"];
const ALLOWED = new Set(["styles/palette.ts"]);
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|light-dark)\(/g;

const problems: string[] = [];
for (const dir of DIRS) {
  for (const file of new Glob(`${dir}/**/*.{ts,tsx,css}`).scanSync(root)) {
    if (ALLOWED.has(file)) continue;
    readFileSync(path.join(root, file), "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const [match] of line.matchAll(COLOR)) problems.push(`${file}:${i + 1}: ${match}`);
      });
  }
}

const tokens = readFileSync(path.join(root, "styles/tokens.stylex.ts"), "utf8");
for (const role of Object.keys(palette) as ColorRole[]) {
  if (!tokens.includes(`${role}: "var(${cssVar(role)})"`))
    problems.push(`styles/tokens.stylex.ts: no token for ${role}`);
}

if (problems.length) {
  console.error(`Colours belong in styles/palette.ts as a role with light and dark values:\n${problems.join("\n")}`);
  process.exit(1);
}
