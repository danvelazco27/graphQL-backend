import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash,
    },
  });

  const daniel = await prisma.user.upsert({
    where: { email: "daniel@test.com" },
    update: {},
    create: {
      email: "daniel@test.com",
      passwordHash,
    },
  });

  await prisma.contact.deleteMany();

  const john = await prisma.contact.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "3001234567",
      ownerId: admin.id,
    },
  });

  const jane = await prisma.contact.create({
    data: {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "3009876543",
      ownerId: admin.id,
    },
  });

  const bruce = await prisma.contact.create({
    data: {
      name: "Bruce Wayne",
      email: "bruce@example.com",
      phone: "3112223344",
      ownerId: daniel.id,
    },
  });

  console.log("Seed data created:");
  console.log("  Users: admin@test.com, daniel@test.com (Password123)");
  console.log(`  Contacts: ${john.name}, ${jane.name}, ${bruce.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
