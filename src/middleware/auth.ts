import { GraphQLError } from "graphql";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";

export interface AuthContext {
  user: JwtPayload | null;
}

export function getUserFromToken(token: string | undefined): JwtPayload | null {
  if (!token) return null;

  const bearerToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  try {
    return verifyToken(bearerToken);
  } catch {
    return null;
  }
}

export function requireAuth(user: JwtPayload | null): JwtPayload {
  if (!user) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return user;
}
