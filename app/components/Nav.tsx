"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export const Nav = () => {
  const activePath = usePathname(); // Get current path

  return (
    <header className="pt-8 md:pt-16 pb-16 px-4 md:px-0 flex justify-between">
      <Link
        href="/"
        className="group transition"
        aria-label="Ali Alshehri home"
      >
        <h1 className="text-base font-mono font-semibold text-slate-950">as</h1>
        <span
          className={`block ${
            activePath === "/" ? "max-w-full" : "max-w-0"
          } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950`}
        />
      </Link>
      <nav className="flex gap-4">
        <Link
          href="/info"
          className="text-950 text-sm group transition tracking-tighter font-mono font-semibold"
          aria-label="Information about Ali Alshehri"
        >
          Information
          <span
            className={`block ${
              activePath === "/info" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950`}
          />
        </Link>
        <Link
          href="/posts"
          className="text-950 group transition text-sm tracking-tighter font-mono font-semibold"
          aria-label="Writing by Ali Alshehri"
        >
          Writing
          <span
            className={`block ${
              activePath === "/posts" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950`}
          />
        </Link>
        <Link
          href="/contact"
          className="text-950 group transition text-sm tracking-tighter font-mono font-semibold"
          aria-label="Contact Ali Alshehri"
        >
          Contact
          <span
            className={`block ${
              activePath === "/contact" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950`}
          />
        </Link>
      </nav>
    </header>
  );
};
