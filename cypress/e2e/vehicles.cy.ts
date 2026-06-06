describe('Vehicle List Page', () => {
  beforeEach(() => {
    // Intercept login to bypass it or just set token
    cy.intercept('POST', '**/Auth/login', {
      statusCode: 200,
      body: { token: 'fake-token' }
    });
    
    // Set token in localStorage
    localStorage.setItem('token', 'fake-token');
  });

  it('should display empty state when no vehicles are returned', () => {
    cy.intercept('GET', '**/Vehiculos*', {
      statusCode: 200,
      body: []
    }).as('getVehiclesEmpty');

    cy.visit('/vehicles');
    cy.wait('@getVehiclesEmpty');
    cy.contains('No hay vehículos registrados.').should('be.visible');
  });

  it('should display a list of vehicles', () => {
    const mockVehicles = [
      { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2020, color: 'Rojo' },
      { id: 2, placa: 'XYZ-987', marca: 'Honda', modelo: 'Civic', anio: 2021, color: 'Azul' }
    ];

    cy.intercept('GET', '**/Vehiculos*', {
      statusCode: 200,
      body: { data: mockVehicles }
    }).as('getVehicles');

    cy.visit('/vehicles');
    cy.wait('@getVehicles');
    
    cy.get('li').should('have.length', 2);
    cy.contains('Toyota Corolla (2020)').should('be.visible');
    cy.contains('Honda Civic (2021)').should('be.visible');
    cy.contains('Placa: ABC-123').should('be.visible');
    cy.contains('Color: Rojo').should('be.visible');
  });

  it('should show error message when API fails', () => {
    cy.intercept('GET', '**/Vehiculos*', {
      statusCode: 500,
      body: { Message: 'Error de servidor' }
    }).as('getVehiclesError');

    cy.visit('/vehicles');
    cy.wait('@getVehiclesError');
    cy.contains('No se pudieron cargar los vehículos. Verifique la conexión con el servidor.').should('be.visible');
  });

  it('should delete a vehicle successfully', () => {
    const mockVehicles = [
      { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2020, color: 'Rojo' }
    ];

    cy.intercept('GET', '**/Vehiculos*', {
      statusCode: 200,
      body: { data: mockVehicles }
    }).as('getVehicles');

    cy.visit('/vehicles');
    cy.wait('@getVehicles');

    cy.intercept('DELETE', '**/Vehiculos/1', {
      statusCode: 200,
      body: { message: 'Eliminado' }
    }).as('deleteRequest');
    
    cy.get('button').contains('Eliminar').click();
    cy.wait('@deleteRequest');
    
    cy.contains('No hay vehículos registrados.').should('be.visible');
  });
});
