# VehicleManagementUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## SonarQube Analysis & Coverage

To analyze the project and see the code coverage in SonarQube, follow these steps:

1.  **Generate Coverage Report**:
    Run the following command to execute tests and generate the `lcov.info` report:
    ```bash
    npm run test:coverage
    ```

2.  **Run SonarQube Scanner**:
    Ensure your SonarQube server is running and your token is correctly configured in `sonar-project.properties`. Then run:
    ```bash
    npm run sonar
    ```

After the analysis finishes, you can view the results at `http://localhost:9000` (or your configured SonarQube URL).

## End-to-End (E2E) Testing

Este proyecto utiliza **Cypress** para las pruebas de extremo a extremo.

### Configuración

Se ha configurado Cypress con los siguientes archivos:
- `cypress.config.ts`: Configuración base (URL: `http://localhost:4200`).
- `cypress/e2e/`: Contiene las especificaciones de las pruebas (specs).
- `cypress/support/commands.ts`: Comandos personalizados como `cy.login()`.

### Ejecución de Pruebas

Para ejecutar las pruebas E2E, primero asegúrate de que la aplicación esté corriendo:

```bash
npm start
```

Luego, puedes ejecutar las pruebas de dos formas:

1. **Modo Interactivo (UI):**
   Abre el Test Runner de Cypress para seleccionar y ver las pruebas en tiempo real.
   ```bash
   npm run e2e:open
   ```

2. **Modo Consola (Headless):**
   Ejecuta todas las pruebas en segundo plano desde la terminal.
   ```bash
   npm run e2e
   ```

### Pruebas Incluidas
- `login.cy.ts`: Pruebas de carga de la página de inicio y validación básica.
- `vehicles.cy.ts`: Pruebas de navegación y listado de vehículos.
- `create-vehicle.cy.ts`: Flujo completo de creación de un vehículo.

## Guía Paso a Paso: Creando una prueba E2E válida

Para que tus pruebas sean profesionales y no dependan siempre de que el backend esté encendido, seguimos este patrón:

### 1. El Flujo de Login
En `cypress/e2e/login.cy.ts` verás:
1.  **Visita:** `cy.visit('/login')`.
2.  **Intercepción:** `cy.intercept('POST', '**/Auth/login', {...})`. **Nota:** Los endpoints son sensibles a mayúsculas/minúsculas.
3.  **Interacción:** Se buscan los inputs por su ID (`#email`, `#password`) y se escribe en ellos.
4.  **Aserción:** Se verifica que la URL cambie a `/vehicles` tras el clic.

### 2. El Flujo de Creación de Vehículo
En `cypress/e2e/create-vehicle.cy.ts`:
1.  **Pre-requisito:** Se usa un comando personalizado `cy.login()` en el `beforeEach`.
2.  **Identificación por Atributo:** Cuando un input no tiene ID, lo buscamos por su atributo de Angular: `cy.get('input[formControlName="placa"]')`.
3.  **Simulación de API:** Usamos `cy.intercept('POST', '**/Vehiculos/', { statusCode: 201, ... })` para simular el guardado. Es fundamental usar el path exacto `/Vehiculos/` para que Cypress atrape la petición correctamente.
4.  **Validación de UI:** Se comprueba que el nuevo vehículo aparezca en la lista final con `cy.contains('Marca Modelo')`.

### Consejos para nuevas pruebas:
- Usa `cy.intercept()` para probar casos de error (ej: simular un error 500 del servidor).
- Evita usar selectores CSS genéricos como `.btn`; prefiere `[formControlName]` o IDs.
- Mantén las pruebas independientes: cada `it` debe poder ejecutarse solo.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
