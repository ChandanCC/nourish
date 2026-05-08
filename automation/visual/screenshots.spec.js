/**
 * Visual drift detection — screenshot key screens at stable 390×844 viewport.
 *
 * First run (--update-snapshots): saves baselines to visual/baselines/
 * Subsequent runs: diffs against baseline.
 *
 * Philosophy: catch meaningful drift, not pixel-perfect snapshots.
 * Threshold is permissive (10%) to avoid noise from antialiasing and font rendering.
 */

import { test, expect } from '@playwright/test';

const SNAPSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.10, // 10% pixel tolerance — detects layout shifts, not subpixel diffs
  animations: 'disabled',
};

// Wait for fonts and CSS custom properties to settle
async function waitForSettle(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400); // allow CSS animations to begin (not complete)
}

test.describe('Login screen', () => {
  test('login screen visual baseline', async ({ page }) => {
    await page.goto('/');
    await waitForSettle(page);
    await expect(page).toHaveScreenshot('login-screen.png', SNAPSHOT_OPTIONS);
  });
});

test.describe('Onboarding screens', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate onboarding state by injecting a mock auth token
    // Skip if TEST_TOKEN not provided — visual only runs in configured environments
    const token = process.env.TEST_TOKEN;
    if (!token) {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.evaluate(t => localStorage.setItem('nouriq_token', t), token);
    await page.reload();
    await waitForSettle(page);
  });

  test('welcome screen baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('onboarding-welcome.png', SNAPSHOT_OPTIONS);
  });
});

test.describe('Home screen (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    const token = process.env.TEST_TOKEN;
    if (!token) { test.skip(); return; }
    await page.goto('/');
    await page.evaluate(t => localStorage.setItem('nouriq_token', t), token);
    await page.reload();
    await waitForSettle(page);
  });

  test('SIGNAL zone baseline', async ({ page }) => {
    const signalZone = page.locator('.signal-zone, [data-zone="signal"]').first();
    if (await signalZone.isVisible()) {
      await expect(signalZone).toHaveScreenshot('signal-zone.png', SNAPSHOT_OPTIONS);
    } else {
      // Capture full home
      await expect(page).toHaveScreenshot('home-screen.png', SNAPSHOT_OPTIONS);
    }
  });

  test('command bar baseline', async ({ page }) => {
    // Command bar is at the bottom — scroll to bottom then capture
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await expect(page).toHaveScreenshot('home-command-bar.png', {
      ...SNAPSHOT_OPTIONS,
      clip: { x: 0, y: 700, width: 390, height: 144 },
    });
  });

  test('TODAY zone baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('home-full.png', SNAPSHOT_OPTIONS);
  });
});
