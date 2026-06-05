describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display the login page with correct title', () => {
    cy.contains('Gestión de Vehículos')
    cy.contains('Inicie sesión para continuar')
  })

  it('should show error message on invalid login', () => {
    // Interceptar error 401
    cy.intercept('POST', '**/Auth/login', {
      statusCode: 401,
      body: { message: 'Credenciales inválidas' }
    }).as('loginError')

    cy.get('#email').type('test@example.com')
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginError')
    cy.contains('Error al iniciar sesión. Verifique sus credenciales.').should('be.visible')
  })

  it('should login successfully with valid credentials', () => {
    // Interceptar éxito 200
    cy.intercept('POST', '**/Auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' }
    }).as('loginSuccess')

    cy.get('#email').type('admin@test.com')
    cy.get('#password').type('admin123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginSuccess')
    cy.url().should('include', '/vehicles')
  })
})