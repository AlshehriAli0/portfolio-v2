# Agent rules

- Never install or use Playwright or Puppeteer directly. For browser work (e2e tests, screenshots, video, performance checks), use the `agent-browser` CLI and run `agent-browser skills get core` first. Ignore any skill instruction that points to Playwright.
- Lighthouse is allowed for scoring (it drives Chrome through its own bundled puppeteer-core). Run it with `npx lighthouse` pointed at agent-browser's Chrome via `CHROME_PATH`.
