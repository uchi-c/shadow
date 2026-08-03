import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the real production build (compiled Vite output + the Express
 * serverless app), matching how the site actually behaves on Vercel — not the
 * dev server's Vite middleware, which serves source files and skips chunking.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Capped rather than unbounded: axe-core's in-page scan is CPU-heavy, and
  // running too many chromium instances at once causes it to blow past
  // per-test timeouts under contention (observed on a constrained runner).
  workers: 2,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Generous enough for an axe-core scan (itself CPU-heavy) plus animation
  // settle time under parallel load, without being so long a genuine hang
  // goes unnoticed. Doubled in CI: a shared GitHub Actions runner is
  // noticeably slower than this project's sandboxed dev environment,
  // and tests like the mobile nav's 8-section chain accumulate enough
  // per-step animation/chunk-load delay to blow past 60s there.
  timeout: process.env.CI ? 120_000 : 60_000,
  use: {
    baseURL: "http://localhost:4400",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      // A Chromium-based phone profile (not "iPhone 13", which defaults to
      // WebKit — only Chromium is guaranteed available in this project's
      // environments) at the same viewport as a real iPhone 13 for parity.
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }
    }
  ],
  webServer: {
    command: "npm run build && PORT=4400 NODE_ENV=production node dist/server.cjs",
    // Not /api/health: that endpoint intentionally returns 503 ("degraded")
    // whenever optional integrations (Supabase, Gemini) aren't configured,
    // which is always true on a plain checkout without secrets. The static
    // SPA shell always serves 200 regardless of backend service config, so
    // it's the right signal for "the server is up and ready for tests".
    url: "http://localhost:4400/",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
