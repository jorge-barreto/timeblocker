import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common operations across tests
 */

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Login with demo account
   */
  async loginAsDemo() {
    await this.page.goto('/');
    await this.page.getByText('Try Demo').click();
    await expect(this.page).toHaveURL('/dashboard');
  }

  /**
   * Create and login with a new test user
   */
  async createAndLoginUser(suffix?: string) {
    const timestamp = Date.now();
    const uniqueSuffix = suffix || timestamp;
    const testUser = {
      name: `Test User ${uniqueSuffix}`,
      email: `test${uniqueSuffix}@example.com`,
      password: 'testpassword123'
    };

    // Register user
    await this.page.goto('/register');
    await this.page.getByLabel('Name').fill(testUser.name);
    await this.page.getByLabel('Email').fill(testUser.email);
    await this.page.getByLabel('Password').fill(testUser.password);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
    
    // Verify registration success
    await expect(this.page).toHaveURL('/dashboard');
    
    return testUser;
  }

  /**
   * Logout current user
   */
  async logout() {
    // Handle both desktop and mobile logout
    const isMobile = await this.page.getByRole('button', { name: 'menu' }).isVisible();
    
    if (isMobile) {
      await this.page.getByRole('button', { name: 'menu' }).click();
      await this.page.getByText('Logout').click();
    } else {
      await this.page.getByText('Logout').click();
    }
    
    await expect(this.page).toHaveURL('/');
  }

  /**
   * Navigate to a specific page (handles mobile navigation)
   */
  async navigateTo(pageName: 'Dashboard' | 'Tasks' | 'Calendar') {
    const isMobile = await this.page.getByRole('button', { name: 'menu' }).isVisible();
    
    if (isMobile) {
      await this.page.getByRole('button', { name: 'menu' }).click();
      await this.page.getByText(pageName).click();
    } else {
      await this.page.getByText(pageName).click();
    }
    
    // Verify navigation
    const expectedUrl = pageName === 'Calendar' ? '/day' : `/${pageName.toLowerCase()}`;
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Wait for toast notification to appear
   */
  async waitForToast(type: 'success' | 'error' | 'info' = 'success') {
    const toastSelector = `.Toastify__toast--${type}`;
    await expect(this.page.locator(toastSelector)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for toast notification with specific text
   */
  async waitForToastWithText(text: string, type: 'success' | 'error' | 'info' = 'success') {
    const toastSelector = `.Toastify__toast--${type}`;
    await expect(this.page.locator(toastSelector)).toContainText(text, { timeout: 5000 });
  }

  /**
   * Fill form fields by label
   */
  async fillForm(fields: Record<string, string>) {
    for (const [label, value] of Object.entries(fields)) {
      await this.page.getByLabel(label).fill(value);
    }
  }

  /**
   * Click button by name/text
   */
  async clickButton(name: string) {
    await this.page.getByRole('button', { name }).click();
  }

  /**
   * Set mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Take screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for page to be in authenticated state
   */
  async waitForAuthentication() {
    await expect(this.page.getByText('Dashboard')).toBeVisible();
    await expect(this.page.getByText('Logout')).toBeVisible();
  }

  /**
   * Wait for page to be in unauthenticated state
   */
  async waitForUnauthentication() {
    await expect(this.page.getByText('Sign In')).toBeVisible();
    await expect(this.page.getByText('Sign Up')).toBeVisible();
  }
}