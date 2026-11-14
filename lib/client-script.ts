import { themeBg } from "./site";

/**
 * The site's entire client-side JavaScript, inlined at the end of <body>. Pages ship
 * no framework runtime, so this is plain event delegation:
 * - [data-theme-toggle]: switch theme (one crossfade where View Transitions exist)
 * - [data-copy]: copy the email address on Contact
 * - page links swap the next page in (soft navigation), so the nav is never rebuilt
 */
function client(bg: Record<string, string>, islands: () => void) {
  const d = document;
  const root = d.documentElement;

  const current = () =>
    root.classList.contains("dark")
      ? "dark"
      : root.classList.contains("light")
        ? "light"
        : matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

  // The label names the action, so it tracks the theme you'd switch to.
  const label = () => {
    const next = current() === "dark" ? "light" : "dark";
    for (const button of d.querySelectorAll("[data-theme-toggle]")) {
      button.setAttribute("aria-label", `Switch to ${next} theme`);
    }
  };

  const setTheme = (theme: string) => {
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    label();
    // iOS Safari only re-tints the status bar for a new theme-color tag, not an edited one,
    // so the per-scheme tags give way to one fresh tag for the chosen theme.
    for (const meta of d.querySelectorAll("meta[name=theme-color]")) meta.remove();
    const meta = d.createElement("meta");
    meta.name = "theme-color";
    meta.content = bg[theme] ?? "";
    d.head.append(meta);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // storage blocked: the theme still applies for this visit
    }
  };

  // While .theme-switching is on, globals.css eases every colour to the new theme and the
  // icon morphs; it comes off once that's done, so hover transitions are normal again.
  let switching = 0;
  const toggleTheme = () => {
    root.classList.add("theme-switching");
    setTheme(current() === "dark" ? "light" : "dark");
    clearTimeout(switching);
    switching = window.setTimeout(() => root.classList.remove("theme-switching"), 400);
  };

  let timer = 0;
  const copy = (button: Element) => {
    const text = button.getAttribute("data-copy");
    if (!text) return;
    const flash = (result: string) => {
      button.setAttribute("data-copied", result);
      const status = button.nextElementSibling;
      if (status) status.textContent = result === "ok" ? "Copied to clipboard" : "Copy failed";
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.removeAttribute("data-copied");
        if (status) status.textContent = "";
      }, 1600);
    };
    // No Clipboard API (insecure context, old browser): say so rather than do nothing.
    if (!navigator.clipboard) return flash("failed");
    navigator.clipboard.writeText(text).then(
      () => flash("ok"),
      () => flash("failed")
    );
  };

  label();

  d.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("[data-theme-toggle]")) return toggleTheme();
    const copyButton = target?.closest("[data-copy]");
    if (copyButton) copy(copyButton);
  });

  // Soft navigation: page links fetch the next page and swap in its content ([data-page]:
  // <main> and the footer) and its per-page head (tags, pruned CSS), so the nav stays the
  // same nodes and keeps its :hover and cursor. Anything unexpected falls back to a full load.
  const pageLink = (event: Event) => {
    const a = event.target instanceof Element ? event.target.closest("a") : null;
    return a?.origin === location.origin &&
      !a.target &&
      !a.hasAttribute("download") &&
      !/\.\w+$|^\/(api|opengraph-image)\b/.test(a.pathname)
      ? a
      : null;
  };
  const cache = new Map<string, Promise<string>>();
  const load = (path: string) => {
    let page = cache.get(path);
    if (!page) {
      page = fetch(path).then(res => {
        if (!(res.ok || res.status === 404) || !res.headers.get("content-type")?.includes("html")) throw 0;
        return res.text();
      });
      page.catch(() => cache.delete(path));
      cache.set(path, page);
    }
    return page;
  };
  // Hovering, pressing or focusing a link warms the cache (a failed fetch is dropped from
  // it, so it never rejects unhandled); pages are static, so it holds for the visit.
  const warm = (event: Event) => {
    const a = pageLink(event);
    if (a && a.pathname !== location.pathname) load(a.pathname + a.search);
  };
  for (const type of ["pointerover", "pointerdown", "focusin"]) d.addEventListener(type, warm, { passive: true });

  // Scroll positions by history entry, restored on back and forward. The browser restores
  // them itself for full loads (a reload), so it's only off while the page is shown.
  addEventListener("pageshow", () => {
    history.scrollRestoration = "manual";
  });
  addEventListener("pagehide", () => {
    history.scrollRestoration = "auto";
  });
  const scrolls = new Map<number, number>();
  let entry = history.state?.k ?? Date.now();
  history.replaceState({ k: entry }, "");
  let shown = location.pathname + location.search;
  let latest = 0;

  // `y` is set when going back or forward (the URL has already changed).
  const go = async (href: string, y?: number) => {
    const url = new URL(href);
    const id = ++latest;
    const full = () => (y === undefined ? location.assign(href) : location.reload());
    let next: Document;
    try {
      next = new DOMParser().parseFromString(await load(url.pathname + url.search), "text/html");
    } catch {
      return full();
    }
    if (id !== latest) return;
    const page = d.querySelector("[data-page]");
    const content = next.querySelector("[data-page]");
    const main = content?.querySelector("main");
    if (!page || !content || !main) return full();
    if (y === undefined) scrolls.set(entry, scrollY);
    const swap = () => {
      // Only the tags that differ: re-adding the viewport tag would abort the transition.
      const fresh = [...next.head.querySelectorAll("[data-next-head], style")];
      for (const el of d.head.querySelectorAll("[data-next-head], style")) {
        const same = fresh.findIndex(tag => tag.isEqualNode(el));
        // The old page's CSS stays until its ghost has faded out (below).
        if (same >= 0) fresh.splice(same, 1);
        else if (el.tagName === "STYLE") stale.push(el);
        else el.remove();
      }
      d.head.append(...fresh);
      page.replaceChildren(...content.childNodes);
      const links = next.querySelectorAll("[data-nav-link]");
      d.querySelectorAll("[data-nav-link]").forEach((link, i) => {
        const current = links[i]?.getAttribute("aria-current");
        if (current) link.setAttribute("aria-current", current);
        else link.removeAttribute("aria-current");
      });
      if (y === undefined) {
        if (href === location.href) history.replaceState({ k: entry }, "");
        else {
          entry = Date.now();
          history.pushState({ k: entry }, "", href);
        }
      }
      shown = url.pathname + url.search;
      const target = url.hash && d.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) target.scrollIntoView();
      else scrollTo(0, y ?? 0);
      // Focus lands on the new page's <main> (tabIndex -1), so screen readers and the
      // keyboard start there; the new <title> is already in place.
      main.focus({ preventScroll: true });
      islands();
    };
    // A crossfade without a View Transition (its snapshot made the blended nav flash): a copy
    // of the old content, fixed where it was, fades out over the new page while its title
    // slides in. The copy sits under the nav, so the nav is never touched.
    const stale: Element[] = [];
    const ghost = page.cloneNode(true) as HTMLElement;
    for (const el of ghost.querySelectorAll("[id], [data-island]")) el.removeAttribute("id"), el.removeAttribute("data-island");
    ghost.removeAttribute("data-page");
    ghost.setAttribute("data-ghost", "");
    ghost.inert = true;
    Object.assign(ghost.style, {
      position: "fixed",
      top: `${-scrollY}px`,
      left: "0",
      right: "0",
      zIndex: "48",
      pointerEvents: "none",
      background: getComputedStyle(d.body).backgroundColor,
    });
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches && ghost.animate;
    if (motion) d.body.append(ghost);
    swap();
    const done = () => {
      ghost.remove();
      for (const el of stale) el.remove();
    };
    if (motion)
      ghost.animate({ opacity: [1, 0] }, { duration: 260, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }).finished.then(done, done);
    else done();
  };

  d.addEventListener("click", event => {
    const a = pageLink(event);
    if (
      !a ||
      event.defaultPrevented ||
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (a.hash && a.pathname + a.search === shown)
    )
      return;
    event.preventDefault();
    go(a.href);
  });
  addEventListener("popstate", () => {
    // A hash change on the same page is the browser's to scroll.
    if (location.pathname + location.search === shown) return;
    scrolls.set(entry, scrollY);
    entry = history.state?.k;
    go(location.href, scrolls.get(entry) ?? 0);
  });

  islands();
}

/**
 * Post islands (components/island.tsx): once one comes within 200px of the viewport,
 * import its module and hydrate it with its JSON props. Runs on load and after each soft
 * navigation. A string, not a function, so the bundler leaves the native import() alone.
 * Pages without islands do nothing.
 */
const islandLoader = `()=>{const l=document.querySelectorAll("[data-island]");if(l.length){const o=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){const t=e.target;o.unobserve(t);import(t.dataset.src).then(m=>m.default(t.firstElementChild,JSON.parse(t.lastElementChild.textContent)))}},{rootMargin:"200px"});for(const t of l)o.observe(t)}}`;

// SWC compiles this file, so .toString() yields plain JS for the inline <script>.
export const clientScript = `(${client.toString()})(${JSON.stringify(themeBg)},${islandLoader});`;

// Runs in <head> after the theme-color tags, so a saved theme sets them before first paint too.
export const themeScript = `try{var t=localStorage.getItem("theme"),b=${JSON.stringify(themeBg)};if(b[t]){document.documentElement.classList.add(t);for(var m of document.querySelectorAll("meta[name=theme-color]"))m.remove();m=document.createElement("meta");m.name="theme-color";m.content=b[t];document.head.append(m)}}catch(e){}`;

// Same-site page links, never the page you're on.
const pages = {
  and: [
    { href_matches: "/*" },
    { not: { href_matches: "/api/*" } },
    { not: { selector_matches: "[aria-current=page]" } },
  ],
};

/**
 * Chromium's prefetch ladder, cheapest first. Soft navigation fetches pages itself, so
 * this only speeds up the full loads it falls back to (no prerender: nothing would use it).
 * - the nav's few links as soon as the page loads (static HTML, a few KB each)
 * - any other page link on the first sign of intent (eager: a brief hover, or on
 *   mobile a link that settles in the viewport)
 */
export const speculationRules = JSON.stringify({
  prefetch: [
    { where: { selector_matches: "header a:not([aria-current=page])" }, eagerness: "immediate" },
    { where: pages, eagerness: "eager" },
  ],
});
