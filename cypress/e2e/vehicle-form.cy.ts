describe('Vehicle Form Page (Create and Edit)', () => {
  const mockVehicle = {
    id: 123,
    placa: 'AAA-1234',
    marca: 'Ford',
    modelo: 'F-150',
    anio: 2022,
    color: 'Negro'
  };

  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
  });

  describe('Creation Mode', () => {
    beforeEach(() => {
      cy.visit('/vehicles/new');
    });

    it('should show validation error for invalid placa format', () => {
      cy.get('input[formControlName="placa"]').type('123-ABC').blur();
      cy.contains('Formato inválido (Ej: ABC-1234).').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should disable submit button when form is incomplete', () => {
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[formControlName="placa"]').type('AAA-1234');
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[formControlName="marca"]').type('Ford');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should create a vehicle successfully', () => {
      cy.intercept('POST', '**/Vehiculos*', {
        statusCode: 201,
        body: { data: mockVehicle }
      }).as('createRequest');

      cy.get('input[formControlName="placa"]').type('BBB-5678');
      cy.get('input[formControlName="marca"]').type('Mazda');
      cy.get('input[formControlName="modelo"]').type('CX-5');
      cy.get('input[formControlName="anio"]').clear().type('2023');
      cy.get('input[formControlName="color"]').type('Gris');

      cy.get('button[type="submit"]').contains('Guardar Vehículo').click();
      cy.wait('@createRequest');
      cy.url().should('match', /\/vehicles$/);
    });
  });

  describe('Editing Mode', () => {
    it('should load vehicle data and update successfully', () => {
      cy.intercept('GET', '**/Vehiculos/123', {
        statusCode: 200,
        body: { data: mockVehicle }
      }).as('getVehicle');

      cy.intercept('PUT', '**/Vehiculos/123', {
        statusCode: 200,
        body: { data: { ...mockVehicle, color: 'Blanco' } }
      }).as('updateRequest');

      cy.visit('/vehicles/edit/123');
      cy.wait('@getVehicle');

      cy.get('input[formControlName="placa"]').should('have.value', 'AAA-1234');
      cy.get('input[formControlName="marca"]').should('have.value', 'Ford');
      
      cy.get('input[formControlName="color"]').clear().type('Blanco');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@updateRequest');
      cy.url().should('match', /\/vehicles$/);
    });

    it('should show error when loading fails', () => {
      cy.intercept('GET', '**/Vehiculos/999', {
        statusCode: 404,
        body: { Message: 'Vehículo no encontrado' }
      }).as('getVehicleError');

      cy.visit('/vehicles/edit/999');
      cy.wait('@getVehicleError');
      cy.contains('No se pudo cargar la información del vehículo.').should('be.visible');
    });
  });
});
