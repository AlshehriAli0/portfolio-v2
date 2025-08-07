"use client";

import TransitionProvider from "./components/TransitionProvider";

export default function Template({ children }: { children: React.ReactNode }) {
  return <TransitionProvider>{children}</TransitionProvider>;
}
