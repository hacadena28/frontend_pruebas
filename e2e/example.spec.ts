import { test, expect } from '@playwright/test';

test('has title', async ({ page }) =>想定
  await page.goto('/');

  // Expect a title "to contain" a substring. (Adjust according to actual Angular app title)
  await expect(page).toHaveTitle(/VehicleManagementUi/i);
});
