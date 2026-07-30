import { test, expect } from "@playwright/test";

/**
 * Product/Academy/tool CTAs prefill the quote form's service + message so
 * leads arrive identified with context (see Products.tsx, Academy.tsx,
 * SecurityMaturity.tsx onQuote wiring). This exercises the URUU waitlist CTA
 * end-to-end as a representative case.
 */
test("URUU waitlist CTA prefills the quote form", async ({ page, isMobile }) => {
  await page.goto("/");

  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.locator("#mobile-nav").getByRole("button", { name: "Products", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary navigation menu" })
      .getByRole("button", { name: "Navigate to Products section" })
      .click();
  }

  await page.getByRole("button", { name: "Join the early-access waitlist" }).click();

  // Step 1: service should already be prefilled to "uruu".
  await expect(page.locator("#quote-service")).toHaveValue("uruu", { timeout: 15_000 });

  // Advance to step 2 to confirm the message was also prefilled.
  await page.fill("#quote-name", "Test Lead");
  await page.fill("#quote-email", "lead@example.com");
  await page.fill("#quote-phone", "+260000000");

  // dispatchEvent (not .click()) here: the "Continue" button is reconciled
  // in-place into the step-2 submit button (same position, same <button>
  // element reused by React), so a synthesized mousedown/mouseup pair can
  // land its mouseup on the just-swapped submit button and fire the form's
  // real submit — an artifact of coordinate-based synthetic clicks, not
  // reproducible with a genuine user click. dispatchEvent bypasses that.
  await page.getByRole("button", { name: "Continue" }).dispatchEvent("click");

  await expect(page.locator("#quote-message")).toHaveValue(
    "I'd like to join the URUU early-access waitlist.",
    { timeout: 15_000 }
  );
});
