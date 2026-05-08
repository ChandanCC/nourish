/**
 * Auth wall — behavioral replay for unauthenticated users.
 * No TEST_TOKEN required. Always runs.
 */

import { test, expect } from '@playwright/test';

test.describe('Unauthenticated user flow', () => {
  test('landing on / shows login, not home screen', async ({ page }) => {
    // Clear any stored auth
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Home screen command bar (textarea) must NOT be visible without auth
    const textarea = page.locator('textarea');
    await expect(textarea).not.toBeVisible();
  });

  test('login page does not crash on render', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('login page contains a sign-in action', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should have a button or link related to signing in
    const body = await page.textContent('body');
    const hasSignIn = /sign\s*in|log\s*in|google|continue/i.test(body ?? '');
    expect(hasSignIn).toBe(true);
  });

  test('direct navigation without token stays on login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('nouriq_token'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    const hasCommandBar = await page.locator('textarea').count();
    expect(hasCommandBar).toBe(0);
  });
});
