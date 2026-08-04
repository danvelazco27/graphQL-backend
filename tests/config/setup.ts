import "dotenv/config";

process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "super-secret-key";
process.env.PORT = process.env.PORT ?? "4000";
process.env.API_URL = process.env.API_URL ?? "http://localhost:4000/";
