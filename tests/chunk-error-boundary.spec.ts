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

  // Prime the boundary's reload-cooldown timestamp into the future (not
  // Date.now()): on a slower/contended CI runner the gap between this line
  // and the chunk error actually surfacing can exceed the real 10s cooldown,
  // letting a genuine reload fire and wipe out the fallback UI before the
  // assertion below sees it. A future timestamp makes "elapsed since last
  // reload" negative — always within the cooldown — regardless of how long
  // the rest of this test takes on a given runner. (window.location.reload
  // can't be stubbed here: browsers make `location` unforgeable, so
  // redefining it is a silent no-op, not an override.)
  await page.evaluate(() => sessionStorage.setItem("sr_chunk_reload_at", String(Date.now() + 10 * 60 * 1000)));

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
