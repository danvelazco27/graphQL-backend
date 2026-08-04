# GraphQL Contacts API

Local GraphQL backend for Postman practice. Contacts CRUD API with JWT authentication.

## Prerequisites

| Software | Version |
|----------|---------|
| Node.js | 22 LTS |
| npm | 10+ |
| Git | any version |

### VS Code Extensions (Recommended)

- GraphQL
- Prisma
- ESLint
- Prettier

---

## Installation

```bash
# Clone the repository
git clone https://github.com/danvelazco27/graphQL-backend.git
cd graphQL-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push

# Seed test data
npm run db:seed
```

---

## Start the Server

```bash
# Development mode (with hot-reload)
npm run dev

# Production mode
npm run build
npm start
```

The server starts at `http://localhost:4000/`

---

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `DATABASE_URL` | SQLite path | `file:./prisma/dev.db` |
| `JWT_SECRET` | JWT secret | `super-secret-key` |
| `PORT` | Server port | `4000` |

---

## Architecture

```
Postman / Client
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

### Project Structure

```
├── prisma/
│   ├── schema.prisma           # Data models
│   ├── seed.ts                 # Initial data
│   └── dev.db                  # SQLite database
├── src/
│   ├── graphql/
│   │   ├── schema.ts           # GraphQL schema (types, queries, mutations)
│   │   └── resolvers/
│   │       └── index.ts        # Resolvers
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication
│   ├── services/
│   │   ├── user.service.ts     # User logic
│   │   └── contact.service.ts  # Contact logic
│   ├── utils/
│   │   ├── jwt.ts              # Token generation/verification
│   │   └── validation.ts       # Validations
│   ├── generated/
│   │   └── prisma/             # Generated Prisma client
│   ├── db.ts                   # Prisma instance
│   ├── context.ts              # Apollo Server context
│   └── server.ts               # Entry point
├── .env
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## Database

### Entity-Relationship Model

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

### Relationships

- **User 1 → N Contact**: A user has many contacts
- **Contact N → 1 Contact.owner**: A contact belongs to a user

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

### Database Commands

```bash
# Sync schema with database
npm run db:push

# Create migration
npm run db:migrate

# Seed test data
npm run db:seed

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## Authentication (JWT)

### Flow

```
Register → User Created → Login → JWT Generated → Protected Queries
```

### Header

```http
Authorization: Bearer <token>
```

### Token Payload

```json
{
  "userId": "uuid",
  "email": "user@test.com",
  "iat": 1783784363,
  "exp": 1783870763
}
```

### Expiration

24 hours

### Protected Endpoints

| Query/Mutation | Requires Auth |
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

## GraphQL Schema

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

## Usage Examples

### Register

```graphql
mutation {
  register(email: "new@test.com", password: "Password123") {
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

### Get Contacts

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

### Get Contact by ID

```graphql
query {
  contact(id: "contact-uuid") {
    id
    name
    email
    phone
  }
}
```

### Create Contact

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

### Update Contact

```graphql
mutation {
  updateContact(id: "contact-uuid", phone: "3001112233") {
    id
    name
    phone
  }
}
```

### Delete Contact

```graphql
mutation {
  deleteContact(id: "contact-uuid")
}
```

---

## Test Data

### Users

| Email | Password |
|-------|----------|
| admin@test.com | Password123 |
| daniel@test.com | Password123 |

### Contacts

| Name | Email | Phone | Owner |
|------|-------|-------|-------|
| John Doe | john@example.com | 3001234567 | admin@test.com |
| Jane Doe | jane@example.com | 3009876543 | admin@test.com |
| Bruce Wayne | bruce@example.com | 3112223344 | daniel@test.com |

---

## Error Handling

| Error | Code | Description |
|-------|------|-------------|
| `Unauthorized` | `UNAUTHENTICATED` | Missing or invalid token |
| `Invalid credentials` | `UNAUTHENTICATED` | Incorrect email or password |
| `Email already exists` | `BAD_USER_INPUT` | Email already registered |
| `Invalid email format` | `BAD_USER_INPUT` | Invalid email format |
| `Password must be at least 8 characters` | `BAD_USER_INPUT` | Password too short |
| `Contact not found` | `NOT_FOUND` | Contact does not exist |
| `User not found` | `NOT_FOUND` | User does not exist |
| `Missing required field` | `BAD_USER_INPUT` | Missing required field |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Server with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled version |
| `npm run db:push` | Sync schema |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed test data |

---

## Introspection

Introspection is enabled to allow Auto Fetch in Postman.

To get the schema in Postman:
1. Create a GraphQL POST request to `http://localhost:4000/`
2. Click on the "Schema" tab
3. Click "Fetch" - it will automatically detect the schema

---

## Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22 LTS | Runtime |
| TypeScript | 7.0 | Language |
| Apollo Server | 5.5 | GraphQL Server |
| Prisma | 7.8 | ORM |
| SQLite | - | Database |
| JWT | 9.0 | Authentication |
| bcrypt | 6.0 | Password hashing |
| dotenv | 17.4 | Environment variables |
