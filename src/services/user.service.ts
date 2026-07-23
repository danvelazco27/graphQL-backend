import bcrypt from "bcrypt";
import { prisma } from "../db.js";
import { signToken } from "../utils/jwt.js";
import { validateEmail, validatePassword } from "../utils/validation.js";
import { GraphQLError } from "graphql";

export async function register(email: string, password: string) {
  const emailError = validateEmail(email);
  if (!emailError) {
    throw new GraphQLError("Invalid email format", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new GraphQLError(passwordError, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new GraphQLError("Email already exists", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new GraphQLError("Invalid credentials", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new GraphQLError("Invalid credentials", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new GraphQLError("User not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
