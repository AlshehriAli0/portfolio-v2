import { getAllPosts } from "@/lib/articles";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await getAllPosts({
      includeDrafts: process.env.NODE_ENV === "development",
    });

    // Return only the necessary data for prefetching (href is what we need)
    const postRoutes = posts.map((post) => ({
      href: post.href,
      slug: post.slug,
    }));

    return NextResponse.json(postRoutes);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-static";
