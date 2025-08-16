"use client";

import { usePrefetch } from "@/lib/usePrefetch";

interface PrefetchProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that triggers aggressive prefetching on mount
 * This should be placed high in the component tree (ideally in layout)
 */
export const PrefetchProvider = ({ children }: PrefetchProviderProps) => {
  // This hook will prefetch all routes on mount
  usePrefetch();

  // Just render children - prefetching happens in the background
  return <>{children}</>;
};
