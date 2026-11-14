import type { NextRequest } from "next/server";
import { ogImageResponse } from "@/lib/og";

// The template reads its fonts from disk.
export const runtime = "nodejs";

const MAX_TITLE_LENGTH = 140;

// GET /api/og?title=<post title>&date=<ISO date, optional>&min=<reading minutes, optional>
// Without a title it falls back to the site card.
export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title")?.trim().slice(0, MAX_TITLE_LENGTH);
  if (!title) return ogImageResponse({ kind: "home" });
  const minutes = Number(searchParams.get("min"));
  return ogImageResponse({
    kind: "post",
    title,
    date: searchParams.get("date") ?? undefined,
    minutes: Number.isInteger(minutes) && minutes > 0 && minutes < 1000 ? minutes : undefined,
  });
}
