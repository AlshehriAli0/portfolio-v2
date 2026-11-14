import fs from "node:fs";
import path from "node:path";

export type Size = { width: number; height: number };

const PUBLIC_DIR = path.join(process.cwd(), "public");
const cache = new Map<string, Size | null>();

/**
 * Intrinsic size of an image in /public, read from the file header at build time.
 * Supports PNG, GIF, WebP (lossy, lossless, extended) and JPEG. Returns null when unknown.
 */
export function getPublicImageSize(src: string): Size | null {
  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  const file = path.join(PUBLIC_DIR, src);
  let size: Size | null = null;
  if (file.startsWith(PUBLIC_DIR) && fs.existsSync(file)) {
    size = parse(fs.readFileSync(file));
  }
  cache.set(src, size);
  return size;
}

function parse(b: Buffer): Size | null {
  if (b.length < 30) return null;
  const ascii = (start: number, end: number) => b.toString("latin1", start, end);

  // PNG: IHDR is always the first chunk.
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  if (ascii(0, 4) === "GIF8") {
    return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return parseWebp(b, ascii(12, 16));
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    return parseJpeg(b);
  }
  return null;
}

function parseWebp(b: Buffer, chunk: string): Size | null {
  if (chunk === "VP8 ") {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }
  return null;
}

function parseJpeg(b: Buffer): Size | null {
  let offset = 2;
  while (offset + 9 < b.length) {
    if (b[offset] !== 0xff) return null;
    const marker = b[offset + 1];
    // SOF0..SOF15 carry the frame size; C4 (DHT), C8 (JPG) and CC (DAC) don't.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: b.readUInt16BE(offset + 7), height: b.readUInt16BE(offset + 5) };
    }
    offset += 2 + b.readUInt16BE(offset + 2);
  }
  return null;
}
