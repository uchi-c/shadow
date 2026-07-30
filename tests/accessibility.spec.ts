import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SECTIONS } from "./fixtures";

async function goToSection(page: import("@playwright/test").Page, isMobile: boolean, target: string, label: string) {
  if (target === "home") return;
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: label, exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: `Navigate to ${label} section` })
      .click();
  }
}

test.describe("accessibility (axe)", () => {
  for (const section of SECTIONS) {
    test(`${section.label} page has no axe violations`, async ({ page, isMobile }) => {
      await page.goto("/");
      await goToSection(page, isMobile, section.target, section.label);
      await expect(page.getByText(section.expectText).first()).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(400); // let entrance transitions / proximity effects settle

      // `as any`: @axe-core/playwright resolves a different (newer) copy of
      // playwright-core's Page type than @playwright/test re-exports, so TS
      // sees two structurally-different "Page" types here — a nominal
      // mismatch between duplicate transitive deps, not a runtime one.
      const results = await new AxeBuilder({ page: page as any }).analyze();
      const summary = results.violations
        .map(v => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`)
        .join("\n");
      expect(results.violations, summary).toHaveLength(0);
    });
  }

  test("mobile navigation menu has no axe violations while open", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();

    // `as any`: @axe-core/playwright resolves a different (newer) copy of
    // playwright-core's Page type than @playwright/test re-exports (a
    // nominal mismatch between duplicate transitive deps, not a runtime one).
    const results = await new AxeBuilder({ page: page as any }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
