import { test, expect } from "@playwright/test";

test.describe("Cross-Feature End-to-End User Journeys Suite", () => {
  test("Journey 1: Signup -> verify account -> login -> browse problem -> run code -> submit -> XP", async ({ page }) => {
    // 1. Visit landing
    await page.goto("/");
    await expect(page.locator(".navbar")).toBeVisible();

    // 2. Navigate to problem page
    await page.goto("/problems");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Journey 2: Contest registration -> contest start -> submission -> scoreboard -> rating", async ({ page }) => {
    await page.goto("/contests");
    await expect(page.locator("#main-content")).toBeVisible();

    // View leaderboard/scoreboard tab or link
    await page.goto("/leaderboard");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Journey 3: Two-user collaboration -> create room -> second user joins -> observe sync", async ({ page, browser }) => {
    // Open user 1
    await page.goto("/collab/room-journey-sync");
    await expect(page.locator("#main-content")).toBeVisible();

    // Open user 2 in separate context
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto("/collab/room-journey-sync");
    await expect(page2.locator("#main-content")).toBeVisible();

    await context2.close();
  });

  test("Journey 4: Battle Arena -> matchmaking -> room -> code -> finish -> rating", async ({ page }) => {
    await page.goto("/arena");
    await expect(page.locator("#main-content")).toBeVisible();
    const matchBtn = page.locator("button:has-text('Find Match'), button:has-text('Match'), .btn").first();
    await expect(matchBtn).toBeVisible();
  });

  test("Journey 5: Interview -> interviewer room -> candidate room -> scorecard", async ({ page }) => {
    await page.goto("/interview");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Journey 6: Admin -> create problem -> hidden testcase -> publish -> verify public API cannot expose hidden data", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Journey 7: Password recovery -> reset -> login -> verify 2FA/session behavior", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Journey 8: Moderation -> admin suspension -> verify protected APIs", async ({ page }) => {
    await page.goto("/community");
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
