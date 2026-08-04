import { gql } from "./graphql-client.js";
import { adminUser, danielUser } from "../fixtures/user.fixture.js";

interface AuthPayload {
  register: {
    token: string;
    user: { id: string; email: string; createdAt: string };
  };
  login: {
    token: string;
    user: { id: string; email: string; createdAt: string };
  };
}

const REGISTER = `
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user {
        id
        email
        createdAt
      }
    }
  }
`;

const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        createdAt
      }
    }
  }
`;

export async function getAuthToken(
  email: string,
  password: string,
  mode: "login" | "register" = "login"
): Promise<{ token: string; userId: string }> {
  const mutation = mode === "login" ? LOGIN : REGISTER;

  const result = await gql.mutate<AuthPayload>(mutation, { email, password });

  if (result.errors) {
    throw new Error(`Auth failed: ${result.errors[0].message}`);
  }

  const payload = mode === "login" ? result.data!.login : result.data!.register;

  return { token: payload.token, userId: payload.user.id };
}

let adminToken: string | null = null;
let danielToken: string | null = null;

export async function getAdminToken(): Promise<string> {
  if (!adminToken) {
    const result = await getAuthToken(adminUser.email, adminUser.password);
    adminToken = result.token;
  }
  return adminToken;
}

export async function getDanielToken(): Promise<string> {
  if (!danielToken) {
    const result = await getAuthToken(danielUser.email, danielUser.password);
    danielToken = result.token;
  }
  return danielToken;
}

export function resetTokens(): void {
  adminToken = null;
  danielToken = null;
}
