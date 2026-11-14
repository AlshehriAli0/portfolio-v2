// Average adult silent-reading speed.
const WORDS_PER_MINUTE = 250;

/** Counts prose words in an MDX/Markdown string, ignoring tables and markup. */
export function countWords(content: string): number {
  return content
    .replace(/<table[\s\S]*?<\/table>/gi, "") // HTML tables
    .replace(/^\|.*\|.*$/gm, "") // Markdown table rows
    .replace(/<[^>]*>/g, " ") // HTML tags
    .replace(/[\r\n]+/g, " ")
    .replace(/[.,!?;:(){}[\]"]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Reading time in whole minutes, never less than one. */
export function calculateReadingTime(content: string): number {
  return Math.max(1, Math.floor(countWords(content) / WORDS_PER_MINUTE));
}
