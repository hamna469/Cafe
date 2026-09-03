import { test, expect } from '@playwright/test';

test.describe('Brew Haven - Homepage & Menu', () => {

  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/this-title-does-not-exist-xyz/i);
  });

  test('menu page shows menu items', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByText('Espresso').first()).toBeVisible();
  });

  test('menu page shows at least one price', async ({ page }) => {
    await page.goto('/menu');
    const priceText = page.locator('text=/[0-9]+/').first();
    await expect(priceText).toBeVisible();
  });

});