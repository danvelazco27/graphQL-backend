# PRD Completo - Backend Local GraphQL para Prácticas con Postman

## 1. Resumen Ejecutivo

Este proyecto tiene como objetivo crear una API GraphQL completamente local orientada al aprendizaje y automatización de pruebas utilizando Postman.

El sistema permitirá:

- Registro de usuarios.
- Login mediante JWT.
- CRUD completo de contactos.
- Consultas GraphQL protegidas.
- Mutations GraphQL protegidas.
- Introspection habilitada para Auto Fetch en Postman.
- Persistencia local mediante SQLite.
- Ejecución local sin Docker.
- Automatización con Newman.

---

# 2. Objetivos

## Objetivo Principal

Disponer de una API GraphQL simple pero realista para practicar:

- Queries
- Mutations
- Variables GraphQL
- Authentication
- Authorization
- Validaciones
- Error Handling
- Collections Postman
- Newman

## Objetivos Secundarios

- Aprender Apollo Server.
- Aprender Prisma.
- Practicar diseño de schemas.
- Practicar JWT.
- Practicar pruebas automatizadas.

---

# 3. Alcance

## Incluido

- Backend GraphQL.
- SQLite.
- JWT.
- CRUD Contactos.
- Registro de Usuarios.
- Login.
- Prisma ORM.
- TypeScript.
- Postman Collection.

## No Incluido

- Frontend.
- Docker.
- OAuth.
- Roles avanzados.
- Refresh Tokens.
- Microservicios.
- Kubernetes.

---

# 4. Prerequisitos

## Sistema Operativo

- macOS 13+
- Windows 11+
- Ubuntu 22+

## Hardware

- 8 GB RAM
- 2 GB libres

## Software

### Node.js

Versión recomendada:

22 LTS

### Git

### Visual Studio Code

### Postman Desktop

## Extensiones VSCode

- GraphQL
- Prisma
- ESLint
- Prettier

---

# 5. Tecnologías

## Runtime

- Node.js

## Lenguaje

- TypeScript

## API

- Apollo Server
- GraphQL

## ORM

- Prisma

## Base de Datos

- SQLite

## Seguridad

- JWT
- bcrypt

## Configuración

- dotenv

---

# 6. Arquitectura

```text
Postman
   |
GraphQL Endpoint
   |
Apollo Server
   |
Resolvers
   |
Prisma ORM
   |
SQLite
```

---

# 7. Estructura del Proyecto

```text
project/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── graphql/
│   │   ├── schema.ts
│   │   ├── queries/
│   │   ├── mutations/
│   │   └── resolvers/
│   │
│   ├── middleware/
│   │   └── auth.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   └── contact.service.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── validation.ts
│   │
│   ├── context.ts
│   └── server.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

# 8. Modelo de Datos

## User

Campos:

- id
- email
- passwordHash
- createdAt

## Contact

Campos:

- id
- name
- email
- phone
- createdAt
- ownerId

Relación:

```text
User 1 ---- N Contact
```

---

# 9. Prisma Schema

Entidades esperadas:

```text
User
Contact
```

Relaciones:

```text
User.contacts
Contact.owner
```

---

# 10. Variables de Entorno

Archivo:

```text
.env
```

Variables:

```env
DATABASE_URL="file:./database.db"
JWT_SECRET="super-secret-key"
PORT=4000
```

---

# 11. Schema GraphQL

## User

```graphql
type User {
 id: ID!
 email: String!
 createdAt: String!
}
```

## Contact

```graphql
type Contact {
 id: ID!
 name: String!
 email: String!
 phone: String!
 createdAt: String!
}
```

## AuthPayload

```graphql
type AuthPayload {
 token: String!
 user: User!
}
```

## Queries

```graphql
type Query {
 me: User
 contacts: [Contact!]!
 contact(id: ID!): Contact
}
```

## Mutations

```graphql
type Mutation {
 register(email:String!, password:String!): AuthPayload!
 login(email:String!, password:String!): AuthPayload!
 createContact(name:String!, email:String!, phone:String!): Contact!
 updateContact(id:ID!, name:String, email:String, phone:String): Contact!
 deleteContact(id:ID!): Boolean!
}
```

---

# 12. Seguridad

## JWT

Header:

```http
Authorization: Bearer <token>
```

Payload:

```json
{
  "userId":"123",
  "email":"user@test.com"
}
```

Expiración:

24 horas.

---

# 13. Reglas de Negocio

## Usuarios

- Email único.
- Password mínimo 8 caracteres.
- Email válido.

## Contactos

- Nombre obligatorio.
- Email válido.
- Teléfono obligatorio.
- Usuario solo puede ver sus propios contactos.

---

# 14. Resolvers Requeridos

## Query Resolvers

- me
- contacts
- contact

## Mutation Resolvers

- register
- login
- createContact
- updateContact
- deleteContact

---

# 15. Flujo de Autenticación

```text
Register
   ↓
User Created
   ↓
Login
   ↓
JWT Generated
   ↓
Protected Queries
```

---

# 16. Casos de Error

- Unauthorized
- Invalid Credentials
- User Not Found
- Contact Not Found
- Duplicate Email
- Invalid JWT
- Missing Required Field

---

# 17. Escenarios de Prueba Manual

## Registro Exitoso

Debe devolver:

- token
- user

## Login Exitoso

Debe devolver:

- token

## Crear Contacto

Debe crear registro.

## Actualizar Contacto

Debe devolver cambios.

## Eliminar Contacto

Debe devolver true.

---

# 18. Escenarios Negativos

- Login con password inválido.
- Login sin usuario.
- Crear contacto sin token.
- Consultar contactos sin token.
- Actualizar contacto inexistente.
- Eliminar contacto inexistente.

---

# 19. Automatización Postman

Validaciones:

- Status Code.
- Tiempo de respuesta.
- Campos obligatorios.
- Validación JWT.
- Validación de errores.

Variables:

```text
baseUrl
jwt
contactId
```

---

# 20. Colección Postman Recomendada

Folder 1:

- Register
- Login

Folder 2:

- Create Contact
- Get Contacts
- Get Contact
- Update Contact
- Delete Contact

Folder 3:

- Negative Tests

---

# 21. Newman

Objetivo:

Ejecutar toda la colección desde línea de comandos.

Comando esperado:

```bash
newman run graphql-contacts.postman_collection.json
```

---

# 22. Definición de Éxito

El sistema será considerado terminado cuando:

- La API inicie correctamente.
- SQLite persista datos.
- Register funcione.
- Login funcione.
- JWT proteja recursos.
- CRUD funcione.
- Auto Fetch funcione en Postman.
- Los tests de Postman pasen.
- Newman ejecute la colección completa.

---

# 23. Roadmap de Implementación

Fase 1

- Inicializar proyecto.
- Configurar TypeScript.
- Configurar Apollo.

Fase 2

- Configurar Prisma.
- Crear modelos.
- Ejecutar migraciones.

Fase 3

- Implementar Register.
- Implementar Login.
- Implementar JWT.

Fase 4

- Implementar CRUD Contactos.

Fase 5

- Validaciones.
- Manejo de errores.

Fase 6

- Crear colección Postman.
- Automatizar pruebas.
- Ejecutar Newman.


---

# 24. Datos de Prueba Iniciales (Seed Data)

## Objetivo

Disponer de datos iniciales para comenzar las pruebas manuales y automatizadas desde Postman inmediatamente después de levantar la aplicación.

## Usuario Inicial

```text
Email: admin@test.com
Password: Password123
```

## Usuario Adicional

```text
Email: daniel@test.com
Password: Password123
```

## Contactos Iniciales

### Contacto 1

```text
Nombre: John Doe
Email: john@example.com
Teléfono: 3001234567
```

### Contacto 2

```text
Nombre: Jane Doe
Email: jane@example.com
Teléfono: 3009876543
```

### Contacto 3

```text
Nombre: Bruce Wayne
Email: bruce@example.com
Teléfono: 3112223344
```

## Casos de Prueba Recomendados

### Login Exitoso

Utilizar:

```text
admin@test.com
Password123
```

### Login Fallido

Utilizar:

```text
admin@test.com
WrongPassword
```

### Consulta de Contactos

Verificar que la respuesta incluya los tres contactos iniciales.

### Actualización

Modificar el teléfono de John Doe y validar la persistencia.

### Eliminación

Eliminar Jane Doe y validar que la consulta de contactos devuelva únicamente dos registros.

## Beneficios

- Permite probar la API inmediatamente.
- Facilita la creación de colecciones Postman.
- Simplifica la automatización con Newman.
- Proporciona datos consistentes para pruebas repetibles.
