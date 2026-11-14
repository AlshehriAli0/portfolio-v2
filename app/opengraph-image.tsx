import { OG_CONTENT_TYPE, OG_SIZE, ogImageResponse } from "@/lib/og";

export const alt = "Ali Alshehri, software engineer.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImageResponse({ kind: "home" });
}
