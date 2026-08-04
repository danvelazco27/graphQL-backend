# Tests

## Estructura

```
tests/
├── README.md
├── config/
│   └── setup.ts                    # Configuración global (env vars)
├── api/
│   ├── helpers/
│   │   ├── graphql-client.ts        # Cliente GraphQL vía Axios
│   │   └── auth-helper.ts           # Cache de tokens (login/register)
│   ├── fixtures/
│   │   ├── user.fixture.ts          # Datos de usuarios de prueba
│   │   └── contact.fixture.ts       # Datos de contactos de prueba
│   ├── queries/
│   │   ├── me.test.ts               # Tests de query me (auth, error)
│   │   ├── contacts.test.ts         # Tests de query contacts (lista, auth)
│   │   └── contact.test.ts          # Tests de query contact (single, ownership)
│   └── mutations/
│       ├── register.test.ts         # Tests de register (válido, duplicado, validación)
│       ├── login.test.ts            # Tests de login (válido, credenciales inválidas)
│       ├── createContact.test.ts    # Tests de createContact (válido, auth, validación)
│       ├── updateContact.test.ts    # Tests de updateContact (válido, auth, ownership)
│       └── deleteContact.test.ts    # Tests de deleteContact (válido, auth, ownership)
└── contracts/
    ├── consumer/
    │   ├── user.consumer.test.ts    # Pact consumer: login + register
    │   └── contact.consumer.test.ts # Pact consumer: contacts + createContact
    ├── provider/
    │   ├── pact-setup.ts            # Setup de DB para provider verification
    │   ├── user.provider.test.ts    # Pact provider verification
    │   └── contact.provider.test.ts # Pact provider verification
    └── pacts/
        └── GraphQLClient-GraphQLBackend.json  # Contrato generado
```

---

## Requisitos

- Node.js 22+
- Base de datos SQLite inicializada: `npx prisma db push && npx tsx prisma/seed.ts`
- Servidor corriendo para API tests y provider contract tests: `npm run dev`

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run test:api` | Tests funcionales de la API GraphQL |
| `npm run test:api:watch` | Modo watch de los tests API |
| `npm run test:contracts:consumer` | Tests de contrato (consumer) — no necesita servidor |
| `npm run test:contracts:provider` | Verificación de contrato (provider) — necesita servidor |
| `npm run test:contracts` | Consumer + provider en secuencia |
| `npm run test:all` | API tests + contract tests |
| `npm run report:allure:api` | Generar reporte HTML de Allure para API tests |
| `npm run report:allure:contract` | Generar reporte HTML de Allure para contract tests |

---

## API Tests (25 tests)

Pruebas funcionales contra el servidor GraphQL en `http://localhost:4000/`.

### Features cubiertas

- **Autenticación**: login válido, credenciales inválidas, register válido, email duplicado, validación de campos
- **Autorización**: queries protegidas sin token, ownership de contactos (forbidden)
- **CRUD de contactos**: crear, listar, obtener uno, actualizar, eliminar
- **Manejo de errores**: not found, bad user input, unauthenticated, forbidden

### Configuración

Las variables de entorno se definen en `tests/config/setup.ts`:

```
API_URL      → http://localhost:4000/
DATABASE_URL → file:./prisma/dev.db
JWT_SECRET   → super-secret-key
PORT         → 4000
```

---

## Contract Tests (PactJS)

### Consumer

Los tests consumer definen las interacciones esperadas contra un mock server de Pact. Validan que el cliente maneje correctamente las respuestas. Generan el archivo `tests/contracts/pacts/GraphQLClient-GraphQLBackend.json`.

- **Login**: define respuesta con matchers (`like()`) para token, id, createdAt
- **Register**: define respuesta con matchers para token, id, createdAt
- **Contacts**: define respuesta con `eachLike(template, 0)` para array de contacts
- **CreateContact**: define respuesta con matchers para id, createdAt

Campos dinámicos (token JWT, UUID, fecha) usan matchers de Pact para verificar solo el tipo, no el valor exacto.

### Provider

Los tests provider verifican que el servidor real cumpla con el contrato generado por los consumer tests. El Verifier de Pact envía cada request del contrato al servidor y compara la respuesta.

1. `pact-setup.ts` crea un usuario de prueba con ID conocido (`00000000-0000-0000-0000-000000000001`) para que el JWT de los endpoints auth-protected sea válido.
2. El Verifier ejecuta las 4 interacciones del contrato.
3. Se verifica que status code, headers y body coincidan con las reglas de matching.

### Flujo completo en CI

```
Setup DB → Build → Start server → API tests → Consumer tests → Provider tests → Stop server
```

El workflow de GitHub Actions (`../.github/workflows/api-tests.yml`) ejecuta todos los pasos en orden secuencial.

---

## Reportes

- **JUnit**: `reports/junit/{api,contract}-tests.xml`
- **Allure**: `allure-results/` (resultados crudos) + `reports/html/` (reportes generados)

Para ver el reporte HTML de Allure localmente:

```bash
npx allure generate ./allure-results -o ./reports/html --clean
npx allure open ./reports/html
```
