import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { newUser, invalidEmail, shortPassword } from "../fixtures/user.fixture.js";

const REGISTER_MUTATION = `
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

interface RegisterData {
  register: {
    token: string;
    user: { id: string; email: string; createdAt: string };
  };
}

describe("Mutation register", () => {
  it("should register a new user", async () => {
    const result = await gql.mutate<RegisterData>(REGISTER_MUTATION, {
      email: newUser.email,
      password: newUser.password,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.register).toBeDefined();
    expect(result.data?.register.token).toBeTruthy();
    expect(result.data?.register.user.email).toBe(newUser.email);
    expect(result.data?.register.user.id).toBeTruthy();
  });

  it("should reject duplicate email", async () => {
    const result = await gql.mutate<RegisterData>(REGISTER_MUTATION, {
      email: newUser.email,
      password: newUser.password,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("should reject invalid email format", async () => {
    const result = await gql.mutate<RegisterData>(REGISTER_MUTATION, {
      email: invalidEmail,
      password: newUser.password,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("should reject short password", async () => {
    const result = await gql.mutate<RegisterData>(REGISTER_MUTATION, {
      email: `short-${Date.now()}@test.com`,
      password: shortPassword,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain("at least 8 characters");
  });
});
