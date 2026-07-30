import { test, expect } from "@playwright/test";
import { SECTIONS } from "./fixtures";

async function goToSection(page: import("@playwright/test").Page, isMobile: boolean, target: string, label: string) {
  if (target === "home") return; // already there after goto("/")
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: label, exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: `Navigate to ${label} section` })
      .click();
  }
}

test.describe("no horizontal overflow", () => {
  for (const section of SECTIONS) {
    test(`${section.label} page fits the viewport width`, async ({ page, isMobile }) => {
      await page.goto("/");
      await goToSection(page, isMobile, section.target, section.label);
      await expect(page.getByText(section.expectText).first()).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(300); // let any entrance animation settle

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));

      expect(scrollWidth - clientWidth, `horizontal overflow on ${section.label}`).toBeLessThanOrEqual(1);
    });
  }
});
