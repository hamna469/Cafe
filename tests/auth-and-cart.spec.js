import { test, expect } from '@playwright/test';

test.describe('Brew Haven - Login/Signup', () => {

  test('login button opens the auth modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByPlaceholder(/enter your username/i)).toBeVisible();
  });

  test('shows error on empty login submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Modal ke andar wala Log In button (last() se navbar wala avoid hoga)
    await page.getByRole('button', { name: 'Log In' }).last().click();

    await expect(page.locator('text=/required|invalid|enter/i').first()).toBeVisible();
  });

});

test.describe('Brew Haven - Cart', () => {

  test('adding item shows it in cart page', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: /add to cart/i }).first().click();

    // Navbar ke 'Cart' LINK par click karein, page.goto NAHI
    // (React state preserve rehta hai click se, reload se nahi)
    await page.getByRole('link', { name: /cart/i }).click();

    await expect(page.getByText('Cart items will appear here.')).not.toBeVisible();
  });

  test('empty cart shows placeholder message', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Cart items will appear here.')).toBeVisible();
  });

});