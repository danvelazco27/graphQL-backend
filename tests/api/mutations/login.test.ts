import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { adminUser } from "../fixtures/user.fixture.js";

const LOGIN_MUTATION = `
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

interface LoginData {
  login: {
    token: string;
    user: { id: string; email: string; createdAt: string };
  };
}

describe("Mutation login", () => {
  it("should login with valid credentials", async () => {
    const result = await gql.mutate<LoginData>(LOGIN_MUTATION, {
      email: adminUser.email,
      password: adminUser.password,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.login).toBeDefined();
    expect(result.data?.login.token).toBeTruthy();
    expect(result.data?.login.user.email).toBe(adminUser.email);
  });

  it("should reject invalid password", async () => {
    const result = await gql.mutate<LoginData>(LOGIN_MUTATION, {
      email: adminUser.email,
      password: "WrongPassword1",
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("UNAUTHENTICATED");
    expect(result.errors![0].message).toBe("Invalid credentials");
  });

  it("should reject non-existent user", async () => {
    const result = await gql.mutate<LoginData>(LOGIN_MUTATION, {
      email: "nonexistent@test.com",
      password: adminUser.password,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("UNAUTHENTICATED");
  });
});
