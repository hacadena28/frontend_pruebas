describe('Login Page Exhaustive Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    // Clear localStorage to ensure a clean state
    cy.clearLocalStorage();
  });

  describe('UI and Form Validations', () => {
    it('should display the login page with all expected elements', () => {
      cy.contains('Gestión de Vehículos').should('be.visible');
      cy.contains('Inicie sesión para continuar').should('be.visible');
      cy.get('label[for="email"]').should('contain', 'Correo Electrónico');
      cy.get('label[for="password"]').should('contain', 'Contraseña');
      cy.get('button[type="submit"]').should('contain', 'Ingresar').and('be.disabled');
    });

    it('should show validation error for invalid email format', () => {
      cy.get('#email').type('invalid-email').blur();
      cy.contains('Ingrese un correo válido.').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should show validation error for short password', () => {
      cy.get('#password').type('12345').blur();
      cy.contains('La contraseña debe tener al menos 6 caracteres.').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should enable submit button when form is valid', () => {
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  describe('Login Submission', () => {
    it('should show error message on 401 Unauthorized', () => {
      cy.intercept('POST', '**/Auth/login', {
        statusCode: 401,
        body: { Message: 'Credenciales inválidas' }
      }).as('login401');

      cy.get('#email').type('wrong@test.com');
      cy.get('#password').type('wrongpass');
      cy.get('button[type="submit"]').click();

      cy.wait('@login401');
      cy.contains('Credenciales inválidas').should('be.visible');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should show default error message on 500 Internal Server Error', () => {
      cy.intercept('POST', '**/Auth/login', {
        statusCode: 500,
        body: {}
      }).as('login500');

      cy.get('#email').type('admin@test.com');
      cy.get('#password').type('admin123');
      cy.get('button[type="submit"]').click();

      cy.wait('@login500');
      cy.contains('Error al iniciar sesión. Verifique sus credenciales.').should('be.visible');
    });

    it('should show loading spinner during request', () => {
      cy.intercept('POST', '**/Auth/login', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: { token: 'delayed-token' }
        });
      }).as('loginDelayed');

      cy.get('#email').type('admin@test.com');
      cy.get('#password').type('admin123');
      cy.get('button[type="submit"]').click();

      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('button[type="submit"] svg.animate-spin').should('be.visible');
      
      cy.wait('@loginDelayed');
      cy.url().should('include', '/vehicles');
    });

    it('should login successfully, store token, and redirect', () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoyNTE2MjM5MDIyfQ';
      
      cy.intercept('POST', '**/Auth/login', {
        statusCode: 200,
        body: { token: fakeToken }
      }).as('loginSuccess');

      cy.get('#email').type('admin@test.com');
      cy.get('#password').type('admin123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginSuccess');
      cy.url().should('include', '/vehicles');
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal(fakeToken);
      });
    });
  });

  describe('Session Management', () => {
    it('should persist session after page refresh', () => {
      const fakeToken = 'persisted-token';
      localStorage.setItem('token', fakeToken);
      
      cy.visit('/vehicles');
      cy.url().should('include', '/vehicles');
      
      cy.reload();
      cy.url().should('include', '/vehicles');
      cy.contains('Listado de Vehículos').should('be.visible');
    });

    it('should logout correctly', () => {
      localStorage.setItem('token', 'active-token');
      cy.visit('/vehicles');
      
      // Mock vehicles request to avoid error
      cy.intercept('GET', '**/Vehiculo', {
        statusCode: 200,
        body: []
      });

      cy.get('button').contains('Cerrar Sesión').click();
      
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });
});
