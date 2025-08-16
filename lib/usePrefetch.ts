"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
interface PostRoute {
  href: string;
  slug: string;
}

export const usePrefetch = () => {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once per session
    if (hasPrefetched.current) return;

    const prefetchAllRoutes = async () => {
      try {
        // Static routes to prefetch
        const staticRoutes = ["/info", "/posts", "/contact"];

        // Prefetch static routes
        staticRoutes.forEach((route) => {
          router.prefetch(route);
        });

        // Fetch all blog post routes from API
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const posts: PostRoute[] = await response.json();

        // Prefetch all blog post routes
        posts.forEach((post) => {
          router.prefetch(post.href);
        });

        hasPrefetched.current = true;

        // Optional: Log prefetching completion in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🚀 Prefetched ${staticRoutes.length} static routes and ${posts.length} blog posts`
          );
        }
      } catch (error) {
        console.error("Error prefetching routes:", error);
      }
    };

    // Add a small delay to not interfere with initial page load
    const timeoutId = setTimeout(prefetchAllRoutes, 100);

    return () => clearTimeout(timeoutId);
  }, [router]);
};
