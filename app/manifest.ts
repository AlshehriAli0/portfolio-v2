import type { MetadataRoute } from "next";
import { site, themeBg } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Ali",
    description: site.description,
    start_url: "/",
    display: "browser",
    // Dark first, like the site.
    background_color: themeBg.dark,
    theme_color: themeBg.dark,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
