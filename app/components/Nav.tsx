"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export const Nav = () => {
  const activePath = usePathname();

  return (
    <header className="pt-8 md:pt-16 pb-16 px-6 md:px-0 flex justify-between items-center">
      <Link href="/" className="group transition" aria-label="Ali Alshehri home" prefetch={true}>
        <h1 className="text-base font-mono font-semibold text-slate-950 dark:text-slate-50">Ali</h1>
        <span
          className={`block ${
            activePath === "/" ? "max-w-full" : "max-w-0"
          } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950 dark:bg-slate-50`}
        />
      </Link>
      <nav className="flex gap-4 items-center">
        <Link
          href="/info"
          className="text-slate-950 dark:text-slate-50 text-sm group transition tracking-tighter font-mono font-semibold"
          aria-label="Information about Ali Alshehri"
          prefetch={true}
        >
          Information
          <span
            className={`block ${
              activePath === "/info" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950 dark:bg-slate-50`}
          />
        </Link>
        <Link
          href="/posts"
          className="text-slate-950 dark:text-slate-50 group transition text-sm tracking-tighter font-mono font-semibold"
          aria-label="Writing by Ali Alshehri"
          prefetch={true}
        >
          Writing
          <span
            className={`block ${
              activePath === "/posts" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950 dark:bg-slate-50`}
          />
        </Link>
        <Link
          href="/contact"
          className="text-slate-950 dark:text-slate-50 group transition text-sm tracking-tighter font-mono font-semibold"
          aria-label="Contact Ali Alshehri"
          prefetch={true}
        >
          Contact
          <span
            className={`block ${
              activePath === "/contact" ? "max-w-full" : "max-w-0"
            } group-hover:max-w-full transition-all duration-500 h-0.5 bg-slate-950 dark:bg-slate-50`}
          />
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
};
