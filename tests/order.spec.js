import { test, expect } from '@playwright/test';

test.describe('Brew Haven - Place Order', () => {

  test('can add item and open order form', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: /add to cart/i }).first().click();

    await page.getByRole('link', { name: /cart/i }).click();
    await page.getByRole('button', { name: /place order/i }).click();

    await expect(page.getByText('Place Your Order')).toBeVisible();
  });

});