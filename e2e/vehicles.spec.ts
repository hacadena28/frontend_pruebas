import { test, expect } from '@playwright/test';

test.describe('Vehicle List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('token', 'fake-token'));
  });

  test('should display empty state when no vehicles are returned', async ({ page }) => {
    await page.route('**/Vehiculo*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/vehicles');
    await expect(page.locator('text=No hay vehículos registrados.')).toBeVisible();
  });

  test('should display a list of vehicles', async ({ page }) => {
    const mockVehicles = [
      { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2020, color: 'Rojo' },
      { id: 2, placa: 'XYZ-987', marca: 'Honda', modelo: 'Civic', anio: 2021, color: 'Azul' }
    ];

    await page.route('**/Vehiculo*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockVehicles),
      });
    });

    await page.goto('/vehicles');
    
    const items = page.locator('li');
    await expect(items).toHaveCount(2);
    await expect(page.locator('text=Toyota Corolla (2020)')).toBeVisible();
    await expect(page.locator('text=Honda Civic (2021)')).toBeVisible();
  });

  test('should show error message when API fails', async ({ page }) => {
    await page.route('**/Vehiculo*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ Message: 'Error de servidor' }),
      });
    });

    await page.goto('/vehicles');
    await expect(page.locator('text=Error de servidor')).toBeVisible();
  });

  test('should delete a vehicle successfully', async ({ page }) => {
    const mockVehicles = [
      { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2020, color: 'Rojo' }
    ];

    await page.route('**/Vehiculo*', async (route) => {
      if (route.request().method() === 'GET') {
        // Return 1 vehicle first, then 0 after delete
        // But Playwright route is stateless by default, so we use a flag
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockVehicles),
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, body: JSON.stringify({ message: 'OK' }) });
      }
    });

    await page.goto('/vehicles');
    await expect(page.locator('li')).toHaveCount(1);

    // Re-route GET to return empty list for the refresh
    await page.route('**/Vehiculo*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      } else {
        await route.continue();
      }
    });

    await page.click('button:has-text("Eliminar")');
    await expect(page.locator('text=No hay vehículos registrados.')).toBeVisible();
  });
});
