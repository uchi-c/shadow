import { test, expect } from "@playwright/test";
import { SECTIONS } from "./fixtures";

test.describe("primary navigation", () => {
  test("desktop nav reaches every section with no console errors", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only nav bar; mobile flow is covered separately below");

    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));

    await page.goto("/");
    await expect(page.locator("h1")).toContainText(SECTIONS[0].expectText);

    for (const section of SECTIONS.slice(1)) {
      await page.getByRole("navigation", { name: "Primary navigation menu" })
        .getByRole("button", { name: `Navigate to ${section.label} section` })
        .click();
      await expect(page.getByText(section.expectText).first()).toBeVisible({ timeout: 15_000 });
    }

    expect(consoleErrors, `Unexpected page errors: ${consoleErrors.join(" | ")}`).toHaveLength(0);
  });

  test("mobile hamburger menu reaches every section", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only hamburger flow");

    await page.goto("/");
    await expect(page.locator("h1")).toContainText(SECTIONS[0].expectText);

    for (const section of SECTIONS.slice(1)) {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      const menu = page.locator("#mobile-nav");
      await expect(menu).toBeVisible();
      await menu.getByRole("button", { name: section.label, exact: true }).click();
      await expect(menu).toBeHidden();
      await expect(page.getByText(section.expectText).first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test("mobile menu toggles closed via the X button", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only");

    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.getByRole("button", { name: "Close navigation menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeHidden();
  });
});
