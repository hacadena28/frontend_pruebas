describe('Vehicle Management', () => {
  beforeEach(() => {
    // We assume a user exists or we mock the login response
    cy.login('admin@test.com', '123456')
  })

  it('should list vehicles', () => {
    cy.url().should('include', '/vehicles')
    cy.contains('Listado de Vehículos')
  })

  it('should navigate to add vehicle page', () => {
    cy.contains('Nuevo Vehículo').click()
    cy.url().should('include', '/vehicles/new')
    cy.contains('h2', 'Nuevo Vehículo').should('be.visible')
  })
})
