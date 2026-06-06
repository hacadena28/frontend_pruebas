import { test, expect } from '@playwright/test';

test.describe('Login Page Exhaustive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Clear localStorage to ensure a clean state
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('UI and Form Validations', () => {
    test('should display the login page with all expected elements', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Gestión de Vehículos');
      await expect(page.locator('p')).toContainText('Inicie sesión para continuar');
      await expect(page.locator('label[for="email"]')).toContainText('Correo Electrónico');
      await expect(page.locator('label[for="password"]')).toContainText('Contraseña');
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toContainText('Ingresar');
      await expect(submitBtn).toBeDisabled();
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      await page.fill('#email', 'invalid-email');
      await page.locator('#email').blur();
      await expect(page.locator('text=Ingrese un correo válido.')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.fill('#password', '12345');
      await page.locator('#password').blur();
      await expect(page.locator('text=La contraseña debe tener al menos 6 caracteres.')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should enable submit button when form is valid', async ({ page }) => {
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password123');
      await expect(page.locator('button[type="submit"]')).not.toBeDisabled();
    });
  });

  test.describe('Login Submission', () => {
    test('should show error message on 401 Unauthorized', async ({ page }) => {
      await page.route('**/Auth/login', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ Message: 'Credenciales inválidas' }),
        });
      });

      await page.fill('#email', 'wrong@test.com');
      await page.fill('#password', 'wrongpass');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).not.toBeDisabled();
    });

    test('should show default error message on 500 Internal Server Error', async ({ page }) => {
      await page.route('**/Auth/login', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      });

      await page.fill('#email', 'admin@test.com');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Error al iniciar sesión. Verifique sus credenciales.')).toBeVisible();
    });

    test('should show loading spinner during request', async ({ page }) => {
      await page.route('**/Auth/login', async route => {
        // Delay response
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'delayed-token' }),
        });
      });

      await page.fill('#email', 'admin@test.com');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      await expect(page.locator('button[type="submit"] svg.animate-spin')).toBeVisible();
      
      await expect(page).toHaveURL(/.*\/vehicles/);
    });

    test('should login successfully, store token, and redirect', async ({ page }) => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoyNTE2MjM5MDIyfQ';
      
      await page.route('**/Auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: fakeToken }),
        });
      });

      await page.fill('#email', 'admin@test.com');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/vehicles/);
      
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBe(fakeToken);
    });
  });

  test.describe('Session Management', () => {
    test('should persist session after page refresh', async ({ page }) => {
      const fakeToken = 'persisted-token';
      await page.evaluate((token) => localStorage.setItem('token', token), fakeToken);
      
      await page.goto('/vehicles');
      await expect(page).toHaveURL(/.*\/vehicles/);
      
      await page.reload();
      await expect(page).toHaveURL(/.*\/vehicles/);
      await expect(page.locator('h2')).toContainText('Listado de Vehículos');
    });

    test('should logout correctly', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('token', 'active-token'));
      
      // Mock vehicles request to avoid error
      await page.route('**/Vehiculo', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/vehicles');
      await page.click('button:has-text("Cerrar Sesión")');
      
      await expect(page).toHaveURL(/.*\/login/);
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });
  });
});
