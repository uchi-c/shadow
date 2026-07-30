import { test, expect } from "@playwright/test";

/**
 * ChunkErrorBoundary catches a failed lazy-chunk fetch (the scenario when a
 * visitor keeps an old tab open across a deploy and a hashed chunk filename
 * 404s). Rather than deleting a build artifact by its hash-dependent filename,
 * this intercepts the network request for the target route's chunk and aborts
 * it — deterministic regardless of the current build's content hash.
 */
test("shows a recovery card when a routed chunk fails to load", async ({ page, isMobile }) => {
  await page.route("**/assets/Products-*.js", (route) => route.abort("failed"));
  await page.goto("/");

  // Refresh the boundary's reload-cooldown timestamp immediately before
  // triggering the error (not via addInitScript before goto — a slow initial
  // load, e.g. waiting out blocked external font/video requests, can let that
  // earlier timestamp go stale past the 10s cooldown by the time the error
  // actually fires, causing a real reload instead of the observable fallback).
  await page.evaluate(() => sessionStorage.setItem("sr_chunk_reload_at", String(Date.now())));

  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: "Products", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: "Navigate to Products section" })
      .click();
  }

  await expect(page.getByText("This section didn't load")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Reload" })).toBeVisible();
});

test("other pages remain usable after a chunk failure elsewhere", async ({ page, isMobile }) => {
  await page.route("**/assets/Products-*.js", (route) => route.abort("failed"));
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("sr_chunk_reload_at", String(Date.now())));

  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: "Services", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: "Navigate to Services section" })
      .click();
  }

  await expect(page.getByText("Comprehensive services for security")).toBeVisible({ timeout: 15_000 });
});
