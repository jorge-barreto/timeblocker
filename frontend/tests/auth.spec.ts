import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    // Generate unique test data
    const timestamp = Date.now();
    const testData = {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'testpassword123'
    };

    // Step 1: Navigate to register page
    await page.goto('/');
    await page.getByText('Get Started').click();
    await expect(page).toHaveURL('/register');

    // Step 2: Fill in registration form
    await page.getByLabel('Name').fill(testData.name);
    await page.getByLabel('Email').fill(testData.email);
    await page.getByLabel('Password').fill(testData.password);
    
    // Step 3: Submit registration
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Step 4: Verify registration success (should redirect to dashboard)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome to TimeBlocker')).toBeVisible();

    // Step 5: Logout
    await page.getByText('Logout').click();
    await expect(page).toHaveURL('/');

    // Step 6: Navigate to login page
    await page.getByText('Sign In').click();
    await expect(page).toHaveURL('/login');

    // Step 7: Login with the same credentials
    await page.getByLabel('Email').fill(testData.email);
    await page.getByLabel('Password').fill(testData.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Step 8: Verify login success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome to TimeBlocker')).toBeVisible();
  });
});