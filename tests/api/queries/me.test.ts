import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken } from "../helpers/auth-helper.js";

const ME_QUERY = `
  query Me {
    me {
      id
      email
      createdAt
    }
  }
`;

describe("Query me", () => {
  it("should return the authenticated user", async () => {
    const token = await getAdminToken();

    const result = await gql.query<{ me: { id: string; email: string; createdAt: string } }>(
      ME_QUERY,
      undefined,
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.me).toBeDefined();
    expect(result.data?.me.email).toBe("admin@test.com");
    expect(result.data?.me.id).toBeTruthy();
    expect(result.data?.me.createdAt).toBeTruthy();
  });

  it("should return null when not authenticated", async () => {
    const result = await gql.query<{ me: null }>(ME_QUERY);

    expect(result.data?.me).toBeNull();
  });

  it("should reject invalid token", async () => {
    const result = await gql.query<{ me: null }>(ME_QUERY, undefined, "Bearer invalid-token");

    expect(result.data?.me).toBeNull();
  });
});
