import { test, expect } from "@playwright/test";

async function goToTools(page: import("@playwright/test").Page, isMobile: boolean) {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: "Tools", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: "Navigate to Tools section" })
      .click();
  }
  await expect(page.getByText("Test your defenses").first()).toBeVisible({ timeout: 15_000 });
}

test.describe("security tools", () => {
  test("password analyzer scores a weak vs strong password differently", async ({ page, isMobile }) => {
    await goToTools(page, isMobile);
    const analyzer = page.locator("#tool-password");
    const input = analyzer.locator("#pw-analyzer-input");

    await input.fill("password1");
    await expect(analyzer.getByText("Very weak", { exact: true })).toBeVisible();

    await input.fill("");
    await input.fill("Tr0ub4dor&3-Zebra-Canyon-9!");
    await expect(analyzer.getByText("Strong", { exact: true }).or(analyzer.getByText("Very strong", { exact: true }))).toBeVisible();
  });

  test("phishing detector flags a suspicious sample email", async ({ page, isMobile }) => {
    await goToTools(page, isMobile);
    const sample = "From: support@paypal.com.secure-login.ru\nURGENT: verify your account now at http://192.168.1.1/login or it will be suspended!";
    await page.locator("#phish-input").fill(sample);
    await expect(page.getByText(/high risk|likely phishing|suspicious/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("security maturity assessment computes a score once all questions are answered", async ({ page, isMobile }) => {
    await goToTools(page, isMobile);
    const fieldsets = page.locator("fieldset");
    const count = await fieldsets.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await fieldsets.nth(i).getByRole("button").first().click();
    }

    await expect(page.getByText("/ 100")).toBeVisible();
  });

  test("CVE explorer responds to a search with either results or a graceful error", async ({ page, isMobile }) => {
    await goToTools(page, isMobile);
    await page.getByLabel("Search vulnerabilities by product or CVE id").fill("CVE-2021-44228");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    // Network availability for the live NVD feed varies by environment (e.g. a
    // sandboxed CI runner may block outbound access) — assert the tool responds
    // sensibly either way, never that it silently does nothing.
    await expect(
      page.locator('[role="alert"]').or(page.locator("li:has-text('CVE-')"))
    ).toBeVisible({ timeout: 15_000 });
  });
});
