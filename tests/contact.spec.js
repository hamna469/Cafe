import { test, expect } from '@playwright/test';

test.describe('Brew Haven - Contact Form', () => {

  test('contact page loads with all fields', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByPlaceholder('Your Name')).toBeVisible();
    await expect(page.getByPlaceholder('Email Address')).toBeVisible();
    await expect(page.getByPlaceholder('Subject')).toBeVisible();
    await expect(page.getByPlaceholder('Your Message')).toBeVisible();
  });

  test('can fill and submit contact form', async ({ page }) => {
    await page.goto('/contact');

    await page.getByPlaceholder('Your Name').fill('Ayesha Khan');
    await page.getByPlaceholder('Email Address').fill('ayesha@example.com');
    await page.getByPlaceholder('Subject').fill('Test Inquiry');
    await page.getByPlaceholder('Your Message').fill('This is a test message from Playwright.');

    await page.getByRole('button', { name: /contact us/i }).click();

    await expect(page.getByPlaceholder('Your Name')).toHaveValue('');
  });

});