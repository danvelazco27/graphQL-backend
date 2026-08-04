import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const PACT_TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
const PACT_TEST_USER_EMAIL = "pact-test@test.com";

export function getPactDb() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

export async function setupPactDb() {
  const prisma = getPactDb();

  try {
    await prisma.$connect();

    const passwordHash = await bcrypt.hash("Password123", 10);

    // Ensure the pact test user (for auth-protected endpoints) exists
    await prisma.user.upsert({
      where: { id: PACT_TEST_USER_ID },
      update: {},
      create: {
        id: PACT_TEST_USER_ID,
        email: PACT_TEST_USER_EMAIL,
        passwordHash,
      },
    });

    // Remove register test user if they already exist (from a previous run)
    await prisma.user.deleteMany({ where: { email: "pact-register@test.com" } });
  } finally {
    await prisma.$disconnect();
  }
}

export async function teardownPactDb() {
  const prisma = getPactDb();

  try {
    await prisma.$connect();

    await prisma.contact.deleteMany({ where: { ownerId: PACT_TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: PACT_TEST_USER_ID } });
  } finally {
    await prisma.$disconnect();
  }
}
