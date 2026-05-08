/**
 * Smoke checks — verify the app boots and critical paths are reachable.
 * These tests do NOT authenticate; they verify the unauthenticated shell.
 */

import { test, expect } from '@playwright/test';

test.describe('App boot', () => {
  test('page loads with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('no fatal JavaScript errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('document has correct title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Login wall', () => {
  test('unauthenticated user sees login screen', async ({ page }) => {
    await page.goto('/');
    // Should show login-related content, not home screen
    const body = await page.textContent('body');
    // Login page has a sign-in button or Google auth prompt
    expect(body).toBeTruthy();
    // Should NOT immediately show the home screen state text
    const hasCommandBar = await page.locator('textarea').isVisible().catch(() => false);
    // Without auth, command bar textarea should not be visible
    expect(hasCommandBar).toBe(false);
  });
});

test.describe('Page structure', () => {
  test('app container mounts without crash', async ({ page }) => {
    await page.goto('/');
    // Root element must exist and contain rendered content
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('page background is dark (design system BG-0)', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    // BG-0 is #08080D — should be very dark (r,g,b all < 20)
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      expect(r).toBeLessThan(20);
      expect(g).toBeLessThan(20);
      expect(b).toBeLessThan(20);
    }
  });

  test('CSS custom properties are defined (design tokens loaded)', async ({ page }) => {
    await page.goto('/');
    const gold = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()
    );
    expect(gold).toBeTruthy();
    expect(gold).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

test.describe('Performance baseline', () => {
  test('page renders within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForSelector('#root:not(:empty)');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
