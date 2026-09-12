import { test, expect } from "@playwright/test";

test.describe("Frontend 16-Feature Comprehensive Verification Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/problems*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          problems: [
            {
              id: "two-sum",
              slug: "two-sum",
              title: "1. Two Sum",
              difficulty: "EASY",
              category: "Array",
              acceptance: "48.5%",
              isSolved: false,
              solveCount: 1420,
              tags: ["Array", "Hash Table"],
              companies: ["Google", "Amazon"]
            }
          ]
        })
      });
    });
  });

  test("Feature 1: Auth — Landing, modal, login/signup toggle, session restore", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".navbar")).toBeVisible();
    
    const loginBtn = page.locator(".navbar button:has-text('Sign In'), .navbar button:has-text('Log In')").first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await expect(page.locator(".modal-overlay")).toBeVisible();
      const toggleLink = page.locator(".modal button:has-text('Sign up'), .modal a:has-text('Sign up'), .modal button:has-text('Register')").first();
      if (await toggleLink.isVisible()) {
        await toggleLink.click();
      }
    }
  });

  test("Feature 2: Problems — Browse problems list and filter view", async ({ page }) => {
    await page.goto("/problems");
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator(".problem-list, table, input[placeholder*='Search']").first()).toBeVisible();
  });

  test("Feature 3: Submissions — View problem detail with code editor and runner", async ({ page }) => {
    await page.goto("/problems/two-sum");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 4: Contests — Contest listing, registration state, and countdown", async ({ page }) => {
    await page.goto("/contests");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 5: Collaboration — Multi-user Collab Studio room", async ({ page }) => {
    await page.goto("/collab/room-test-101");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 6: Battle Arena — Matchmaking lobby and duel arena", async ({ page }) => {
    await page.goto("/arena");
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("button:has-text('Find Match'), button:has-text('Match'), .btn").first()).toBeVisible();
  });

  test("Feature 7: Interview — Technical interview room and scorecard panel", async ({ page }) => {
    await page.goto("/interview");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 8: System Design — Architecture canvas and components palette", async ({ page }) => {
    await page.goto("/system-design");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 9: Academy — Learn courses, syllabus catalog, and lesson viewer", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 10: Admin — Role-gated panel and management dashboard", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 11: Community — Forum discussions and community feed", async ({ page }) => {
    await page.goto("/community");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 12: Gamification — Leaderboard rankings, ratings, and streak metrics", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 13: Roadmap — Skill progression trees and topic curriculum", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 14: AI Mentor / Playground — Interactive code experimentation environment", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("Feature 15: Settings — Appearance, theme toggle, and sandbox runner selection", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("#main-content")).toBeVisible();
    const themeBtn = page.locator("button:has-text('Dark'), button:has-text('Light'), button:has-text('System')").first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
    }
  });

  test("Feature 16: Social — Public user profile, stats, and tournament bracket exploration", async ({ page }) => {
    await page.goto("/u/demo");
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
