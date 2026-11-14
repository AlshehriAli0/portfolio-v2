import { themeBg } from "./site";

/**
 * The site's entire client-side JavaScript, inlined at the end of <body>. Pages ship
 * no framework runtime, so this is plain event delegation:
 * - [data-theme-toggle]: switch theme (one crossfade where View Transitions exist)
 * - [data-copy]: copy the email address on Contact
 * - the post title you clicked morphs into the post header (cross-document View Transition)
 * - the nav link you clicked stays hovered on the new page until the pointer moves
 * - hover prefetch for browsers without Speculation Rules
 */
function client(bg: Record<string, string>) {
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
    // Both tags (light and dark media) take the chosen theme, so the browser UI follows the toggle.
    for (const meta of d.querySelectorAll<HTMLMetaElement>("meta[name=theme-color]")) meta.content = bg[theme] ?? "";
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // storage blocked: the theme still applies for this visit
    }
  };

  // While .vt-theme is on, globals.css turns off every CSS transition and gives the
  // icon its own View Transition layer, so the switch is one crossfade plus the icon morph.
  let switching: unknown;
  const toggleTheme = () => {
    const next = current() === "dark" ? "light" : "dark";
    root.classList.add("vt-theme");
    const transition = d.startViewTransition?.(() => setTheme(next));
    switching = transition;
    if (!transition) setTheme(next);
    // Without View Transitions, reading offsetWidth applies the new colours before
    // transitions come back on. A second click skips the running transition, so only
    // the latest one turns the class off.
    (transition ? transition.finished : Promise.resolve(root.offsetWidth)).then(
      () => switching === transition && root.classList.remove("vt-theme")
    );
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

  // Only the post title you clicked (or came back from) joins the cross-document
  // View Transition; naming every row would make the others ghost over the new page.
  const morph = (url?: string) => {
    if (!url) return;
    const title = d.querySelector<HTMLElement>(`a[href="${new URL(url).pathname}"] [data-morph]`);
    if (title) {
      title.style.viewTransitionName = title.dataset.morph ?? "";
      title.style.setProperty("view-transition-class", "post-title");
    }
  };
  type Swap = Event & { viewTransition: unknown; activation?: { entry?: { url?: string } } };
  type Nav = { activation?: { from?: { url?: string } } };
  addEventListener("pageswap", event => {
    const e = event as Swap;
    if (e.viewTransition) morph(e.activation?.entry?.url);
    // The new page has no :hover until the pointer moves, so carry the hovered nav link over.
    try {
      sessionStorage.nav = d.querySelector("[data-nav-link]:is(:hover,:active)")?.getAttribute("href");
    } catch {
      // storage blocked: the new page waits for the pointer to move
    }
  });
  // A View Transition already brought this page in, so .vt stops the title slide-ins replaying.
  addEventListener("pagereveal", event => {
    if ((event as Swap).viewTransition) {
      root.classList.add("vt");
      morph((window as unknown as { navigation?: Nav }).navigation?.activation?.from?.url);
    }
    // data-hover stands in for :hover (globals.css, drawn without a transition) until the
    // first pointer move, when the real :hover takes over in the same frame.
    try {
      const link = d.querySelector(`[data-nav-link][href="${sessionStorage.nav}"]`);
      link?.setAttribute("data-hover", "");
      d.addEventListener("pointermove", () => link?.removeAttribute("data-hover"), { once: true });
    } catch {
      // storage blocked: no hover to carry over
    }
  });

  // A page prerendered before a theme switch on this one would open in the old theme.
  d.addEventListener("prerenderingchange", () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved && !root.classList.contains(saved)) setTheme(saved);
    } catch {
      // storage blocked: the page keeps the theme it rendered with
    }
  });

  // Chromium prerenders on hover via Speculation Rules; everyone else gets a prefetch.
  if (!HTMLScriptElement.supports?.("speculationrules")) {
    const seen = new Set<string>();
    const prefetch = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='/']") : null;
      if (!link || seen.has(link.pathname) || link.pathname === location.pathname) return;
      seen.add(link.pathname);
      const hint = d.createElement("link");
      hint.rel = "prefetch";
      hint.href = link.href;
      d.head.append(hint);
    };
    d.addEventListener("pointerover", prefetch, { passive: true });
    d.addEventListener("touchstart", prefetch, { passive: true });
  }
}

/**
 * Post islands (components/island.tsx): once one comes within 200px of the viewport,
 * import its module and hydrate it with its JSON props. A string, not a function, so
 * the bundler leaves the native import() alone. Pages without islands do nothing.
 */
const islandLoader = `{const l=document.querySelectorAll("[data-island]");if(l.length){const o=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){const t=e.target;o.unobserve(t);import(t.dataset.src).then(m=>m.default(t.firstElementChild,JSON.parse(t.lastElementChild.textContent)))}},{rootMargin:"200px"});for(const t of l)o.observe(t)}}`;

// SWC compiles this file, so .toString() yields plain JS for the inline <script>.
export const clientScript = `(${client.toString()})(${JSON.stringify(themeBg)});${islandLoader}`;

// Runs in <head> after the theme-color tags, so a saved theme sets them before first paint too.
export const themeScript = `try{var t=localStorage.getItem("theme"),b=${JSON.stringify(themeBg)};if(b[t]){document.documentElement.classList.add(t);for(var m of document.querySelectorAll("meta[name=theme-color]"))m.content=b[t]}}catch(e){}`;

// Same-site page links, never the page you're on.
const pages = {
  and: [
    { href_matches: "/*" },
    { not: { href_matches: "/api/*" } },
    { not: { selector_matches: "[aria-current=page]" } },
  ],
};

/**
 * Chromium's intent ladder, cheapest first:
 * - prefetch the nav's few links as soon as the page loads (static HTML, a few KB each)
 * - prefetch any other page link on the first sign of intent (eager: a brief hover, or on
 *   mobile a link that settles in the viewport)
 * - prerender on a deliberate hover (moderate: about 200ms) or on pointerdown
 * Chrome turns prerendering off while DevTools automation is attached
 * (PrerenderingDisabledByDevTools), so a CDP-driven browser only ever shows the prefetch.
 */
export const speculationRules = JSON.stringify({
  prefetch: [
    { where: { selector_matches: "header a:not([aria-current=page])" }, eagerness: "immediate" },
    { where: pages, eagerness: "eager" },
  ],
  prerender: [{ where: pages, eagerness: "moderate" }],
});
