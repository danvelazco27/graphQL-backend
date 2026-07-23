# GraphQL Contacts API

Backend local GraphQL para prácticas con Postman. API CRUD de contactos con autenticación JWT.

## Requisitos Previos

| Software | Versión |
|----------|---------|
| Node.js | 22 LTS |
| npm | 10+ |
| Git | cualquier versión |

### Extensiones VS Code (recomendadas)

- GraphQL
- Prisma
- ESLint
- Prettier

---

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd graphQL-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Generar cliente Prisma
npx prisma generate

# Crear base de datos
npx prisma db push

# Poblar datos de prueba
npm run db:seed
```

---

## Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor arranca en `http://localhost:4000/`

---

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | Ruta a SQLite | `file:./prisma/dev.db` |
| `JWT_SECRET` | Secreto para JWT | `super-secret-key` |
| `PORT` | Puerto del servidor | `4000` |

---

## Arquitectura

```
Postman / Cliente
       │
       ▼
   GraphQL Endpoint (POST /)
       │
       ▼
   Apollo Server
       │
       ▼
   Resolvers
       │
       ▼
   Services (user, contact)
       │
       ▼
   Prisma ORM
       │
       ▼
   SQLite
```

### Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma           # Modelos de datos
│   ├── seed.ts                 # Datos iniciales
│   └── dev.db                  # Base de datos SQLite
├── src/
│   ├── graphql/
│   │   ├── schema.ts           # Schema GraphQL (types, queries, mutations)
│   │   └── resolvers/
│   │       └── index.ts        # Resolvers
│   ├── middleware/
│   │   └── auth.ts             # Autenticación JWT
│   ├── services/
│   │   ├── user.service.ts     # Lógica de usuarios
│   │   └── contact.service.ts  # Lógica de contactos
│   ├── utils/
│   │   ├── jwt.ts              # Generación/verificación de tokens
│   │   └── validation.ts       # Validaciones
│   ├── generated/
│   │   └── prisma/             # Cliente Prisma generado
│   ├── db.ts                   # Instancia de Prisma
│   ├── context.ts              # Contexto de Apollo Server
│   └── server.ts               # Entry point
├── .env
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## Base de Datos

### Modelo Entity-Relationship

```
┌──────────────┐         ┌──────────────────┐
│     User     │         │     Contact      │
├──────────────┤         ├──────────────────┤
│ id        PK │◄───┐    │ id            PK │
│ email     UQ │    │    │ name              │
│ passwordHash │    └────│ ownerId       FK  │
│ createdAt    │         │ email             │
└──────────────┘         │ phone             │
                         │ createdAt         │
                         └──────────────────┘
```

### Relaciones

- **User 1 → N Contact**: Un usuario tiene muchos contactos
- **Contact N → 1 Contact.owner**: Un contacto pertenece a un usuario

### Prisma Schema

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  contacts     Contact[]
}

model Contact {
  id        String   @id @default(uuid())
  name      String
  email     String
  phone     String
  createdAt DateTime @default(now())
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
}
```

### Comandos de Base de Datos

```bash
# Sincronizar esquema con la base de datos
npm run db:push

# Crear migración
npm run db:migrate

# Poblar datos de prueba
npm run db:seed

# Abrir Prisma Studio (GUI)
npx prisma studio
```

---

## Autenticación (JWT)

### Flujo

```
Register → User Created → Login → JWT Generated → Protected Queries
```

### Header

```http
Authorization: Bearer <token>
```

### Payload del Token

```json
{
  "userId": "uuid",
  "email": "user@test.com",
  "iat": 1783784363,
  "exp": 1783870763
}
```

### Expiración

24 horas

### Endpoints Protegidos

| Query/Mutation | Requiere Auth |
|----------------|---------------|
| `me` | ✅ |
| `contacts` | ✅ |
| `contact(id)` | ✅ |
| `register` | ❌ |
| `login` | ❌ |
| `createContact` | ✅ |
| `updateContact` | ✅ |
| `deleteContact` | ✅ |

---

## Schema GraphQL

### Types

```graphql
type User {
  id: ID!
  email: String!
  createdAt: String!
}

type Contact {
  id: ID!
  name: String!
  email: String!
  phone: String!
  createdAt: String!
}

type AuthPayload {
  token: String!
  user: User!
}
```

### Queries

```graphql
type Query {
  me: User
  contacts: [Contact!]!
  contact(id: ID!): Contact
}
```

### Mutations

```graphql
type Mutation {
  register(email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  createContact(name: String!, email: String!, phone: String!): Contact!
  updateContact(id: ID!, name: String, email: String, phone: String): Contact!
  deleteContact(id: ID!): Boolean!
}
```

---

## Ejemplos de Uso

### Register

```graphql
mutation {
  register(email: "nuevo@test.com", password: "Password123") {
    token
    user {
      id
      email
    }
  }
}
```

### Login

```graphql
mutation {
  login(email: "admin@test.com", password: "Password123") {
    token
    user {
      id
      email
    }
  }
}
```

### Obtener Contactos

```graphql
query {
  contacts {
    id
    name
    email
    phone
  }
}
```

### Obtener Contacto por ID

```graphql
query {
  contact(id: "uuid-del-contacto") {
    id
    name
    email
    phone
  }
}
```

### Crear Contacto

```graphql
mutation {
  createContact(name: "Peter Parker", email: "peter@example.com", phone: "3005551234") {
    id
    name
    email
    phone
  }
}
```

### Actualizar Contacto

```graphql
mutation {
  updateContact(id: "uuid-del-contacto", phone: "3001112233") {
    id
    name
    phone
  }
}
```

### Eliminar Contacto

```graphql
mutation {
  deleteContact(id: "uuid-del-contacto")
}
```

---

## Datos de Prueba

### Usuarios

| Email | Password |
|-------|----------|
| admin@test.com | Password123 |
| daniel@test.com | Password123 |

### Contactos

| Nombre | Email | Teléfono | Dueño |
|--------|-------|----------|-------|
| John Doe | john@example.com | 3001234567 | admin@test.com |
| Jane Doe | jane@example.com | 3009876543 | admin@test.com |
| Bruce Wayne | bruce@example.com | 3112223344 | daniel@test.com |

---

## Manejo de Errores

| Error | Código | Descripción |
|-------|--------|-------------|
| `Unauthorized` | `UNAUTHENTICATED` | Token faltante o inválido |
| `Invalid credentials` | `UNAUTHENTICATED` | Email o password incorrectos |
| `Email already exists` | `BAD_USER_INPUT` | Email ya registrado |
| `Invalid email format` | `BAD_USER_INPUT` | Formato de email inválido |
| `Password must be at least 8 characters` | `BAD_USER_INPUT` | Password muy corto |
| `Contact not found` | `NOT_FOUND` | Contacto no existe |
| `User not found` | `NOT_FOUND` | Usuario no existe |
| `Missing required field` | `BAD_USER_INPUT` | Campo obligatorio faltante |

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar versión compilada |
| `npm run db:push` | Sincronizar esquema |
| `npm run db:migrate` | Crear migración |
| `npm run db:seed` | Poblar datos de prueba |

---

## Introspection

Introspection está habilitada para permitir Auto Fetch en Postman.

Para obtener el schema en Postman:
1. Crear una request GraphQL POST a `http://localhost:4000/`
2. Click en "Schema" tab
3. Click en "Fetch" - detectará el schema automáticamente

---

## Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 22 LTS | Runtime |
| TypeScript | 7.0 | Lenguaje |
| Apollo Server | 5.5 | GraphQL Server |
| Prisma | 7.8 | ORM |
| SQLite | - | Base de datos |
| JWT | 9.0 | Autenticación |
| bcrypt | 6.0 | Hashing de passwords |
| dotenv | 17.4 | Variables de entorno |
