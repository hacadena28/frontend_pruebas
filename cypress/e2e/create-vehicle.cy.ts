describe('Vehicle Creation', () => {
  beforeEach(() => {
    // 1. Interceptar el login
    // Nota: El endpoint es case-sensitive en el interceptor. Usamos **/Auth/login
    cy.intercept('POST', '**/Auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token', user: { email: 'admin@test.com' } }
    }).as('loginRequest');

    // 2. Interceptar la carga inicial de vehículos
    // El endpoint real es /Vehiculos/
    cy.intercept('GET', '**/Vehiculos/', {
      statusCode: 200,
      body: { data: [] }
    }).as('getVehicles');

    // 3. Realizar el login
    cy.login('admin@test.com', 'admin123');
    
    // 4. Esperar a que el login se procese
    cy.wait('@loginRequest');
    cy.url().should('include', '/vehicles');
  });

  it('Debe mostrar el formulario y permitir crear un vehículo', () => {
    // IMPORTANTE: El endpoint es **/Vehiculos/
    // Interceptamos la creación del vehículo ANTES de navegar a la página, para asegurarnos de que el interceptor esté activo cuando se haga la petición POST.
    cy.intercept('POST', '**/Vehiculos/', {
      statusCode: 201,
      body: { message: 'Vehículo creado' }
    }).as('createRequest');

    // Navegar manualmente a la página de nuevo vehículo
    cy.visit('/vehicles/new');

    // Verificación de encabezado
    cy.contains('h2', 'Nuevo Vehículo').should('be.visible');

    // Llenado del formulario
    cy.get('input[formControlName="placa"]').should('be.visible').type('ABC-1234');
    cy.get('input[formControlName="marca"]').type('Toyota');
    cy.get('input[formControlName="modelo"]').type('Corolla');
    
    cy.get('input[formControlName="anio"]').clear().type('2024');
    cy.get('input[formControlName="color"]').type('Blanco');

    // Enviar
    cy.get('button[type="submit"]').should('not.be.disabled').click();

    // Ahora el interceptor SI debería atrapar la petición
    cy.wait('@createRequest');
    
    // Verificamos redirección al listado
    cy.url().should('match', /\/vehicles$/);
    // cy.contains('Vehículo creado').should('be.visible'); // Opcional, según tu app
  });
});
