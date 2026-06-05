import { test, expect } from '@playwright/test';

test.describe('AuthGuard E2E Tests', () => {
  
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Attempt to access a protected route
    await page.goto('/vehicles');

    // Verify that the AuthGuard intercepted and redirected to /login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Optionally verify that the login form is visible
    // Update the selector if your login page uses different elements
    // const loginHeading = page.getByRole('heading', { name: /login/i });
    // await expect(loginHeading).toBeVisible();
  });

});
