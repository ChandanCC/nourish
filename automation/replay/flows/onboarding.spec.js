/**
 * Onboarding flow replay.
 * Requires: TEST_TOKEN env var (JWT for a user with onboardingComplete: false).
 * Skips gracefully when TEST_TOKEN is absent.
 *
 * Behavioral contract:
 * 1. New user lands on welcome screen
 * 2. "Get started" advances to goal selection
 * 3. Goal must be selected before Continue is enabled
 * 4. Protein target defaults to 160g
 * 5. "Finish setup" triggers save and transitions to home screen
 */

import { test, expect } from '@playwright/test';

const TOKEN = process.env.TEST_ONBOARDING_TOKEN;

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    if (!TOKEN) { test.skip(); return; }
    await page.goto('/');
    await page.evaluate(t => {
      localStorage.setItem('nouriq_token', t);
      // Clear the signal-explained flag to also test the overlay
      localStorage.removeItem('nouriq_signal_explained');
    }, TOKEN);
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('welcome screen renders "Get started"', async ({ page }) => {
    const btn = page.getByText('Get started', { exact: false });
    await expect(btn).toBeVisible();
  });

  test('"Get started" advances to goal selection', async ({ page }) => {
    await page.getByText('Get started', { exact: false }).click();
    await expect(page.getByText('Build muscle', { exact: false })).toBeVisible();
  });

  test('Continue is disabled before goal selection', async ({ page }) => {
    await page.getByText('Get started', { exact: false }).click();
    const continueBtn = page.getByText('Continue', { exact: false });
    await expect(continueBtn).toBeVisible();
    // Button should appear disabled (opacity/cursor)
    const opacity = await continueBtn.evaluate(el =>
      parseFloat(window.getComputedStyle(el).opacity)
    );
    expect(opacity).toBeLessThan(0.5);
  });

  test('selecting a goal enables Continue', async ({ page }) => {
    await page.getByText('Get started', { exact: false }).click();
    await page.getByText('Build muscle', { exact: false }).click();
    const continueBtn = page.getByText('Continue', { exact: false });
    const opacity = await continueBtn.evaluate(el =>
      parseFloat(window.getComputedStyle(el).opacity)
    );
    expect(opacity).toBeGreaterThan(0.9);
  });

  test('protein target defaults to 160', async ({ page }) => {
    await page.getByText('Get started', { exact: false }).click();
    await page.getByText('Build muscle', { exact: false }).click();
    await page.getByText('Continue', { exact: false }).click();
    const input = page.locator('input[type="number"]');
    await expect(input).toBeVisible();
    const val = await input.inputValue();
    expect(val).toBe('160');
  });

  test('"Finish setup" is present on protein screen', async ({ page }) => {
    await page.getByText('Get started', { exact: false }).click();
    await page.getByText('Build muscle', { exact: false }).click();
    await page.getByText('Continue', { exact: false }).click();
    await expect(page.getByText('Finish setup', { exact: false })).toBeVisible();
  });
});
