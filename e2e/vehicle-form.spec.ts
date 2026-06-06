import { test, expect } from '@playwright/test';

test.describe('Vehicle Form Page (Create and Edit)', () => {
  const mockVehicle = {
    id: 123,
    placa: 'AAA-1234',
    marca: 'Ford',
    modelo: 'F-150',
    anio: 2022,
    color: 'Negro'
  };

  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('token', 'fake-token'));
  });

  test.describe('Creation Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/vehicles/new');
    });

    test('should show validation error for invalid placa format', async ({ page }) => {
      await page.fill('input[formControlName="placa"]', '123-ABC');
      await page.locator('input[formControlName="placa"]').blur();
      await expect(page.locator('text=Formato inválido (Ej: ABC-1234).')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should disable submit button when form is incomplete', async ({ page }) => {
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      await page.fill('input[formControlName="placa"]', 'AAA-1234');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      await page.fill('input[formControlName="marca"]', 'Ford');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should create a vehicle successfully', async ({ page }) => {
      await page.route('**/Vehiculo*', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ data: mockVehicle }),
          });
        }
      });

      await page.fill('input[formControlName="placa"]', 'BBB-5678');
      await page.fill('input[formControlName="marca"]', 'Mazda');
      await page.fill('input[formControlName="modelo"]', 'CX-5');
      await page.fill('input[formControlName="anio"]', '2023');
      await page.fill('input[formControlName="color"]', 'Gris');

      await page.click('button:has-text("Guardar Vehículo")');
      await expect(page).toHaveURL(/.*\/vehicles$/);
    });
  });

  test.describe('Editing Mode', () => {
    test('should load vehicle data and update successfully', async ({ page }) => {
      await page.route('**/Vehiculo/123', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockVehicle }),
        });
      });

      await page.route('**/Vehiculo/123', async route => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: { ...mockVehicle, color: 'Blanco' } }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/vehicles/edit/123');
      
      await expect(page.locator('input[formControlName="placa"]')).toHaveValue('AAA-1234');
      await expect(page.locator('input[formControlName="marca"]')).toHaveValue('Ford');
      
      await page.fill('input[formControlName="color"]', 'Blanco');
      await page.click('button:has-text("Guardar Vehículo")');
      
      await expect(page).toHaveURL(/.*\/vehicles$/);
    });

    test('should show error when loading fails', async ({ page }) => {
      await page.route('**/Vehiculo/999', async route => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ Message: 'Vehículo no encontrado' }),
        });
      });

      await page.goto('/vehicles/edit/999');
      await expect(page.locator('text=No se pudo cargar la información del vehículo.')).toBeVisible();
    });
  });
});
