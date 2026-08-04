import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken, getDanielToken } from "../helpers/auth-helper.js";

const CONTACTS_QUERY = `
  query Contacts {
    contacts {
      id
      name
      email
      phone
      createdAt
    }
  }
`;

describe("Query contacts", () => {
  it("should return all contacts for the authenticated user", async () => {
    const token = await getAdminToken();

    const result = await gql.query<{ contacts: Array<{ id: string; name: string; email: string; phone: string; createdAt: string }> }>(
      CONTACTS_QUERY,
      undefined,
      token
    );

    expect(result.errors).toBeUndefined();
    expect(Array.isArray(result.data?.contacts)).toBe(true);
    expect(result.data!.contacts.length).toBeGreaterThanOrEqual(2);
  });

  it("should return different contacts for different users", async () => {
    const adminToken = await getAdminToken();
    const danielToken = await getDanielToken();

    const [adminResult, danielResult] = await Promise.all([
      gql.query<{ contacts: Array<{ name: string }> }>(CONTACTS_QUERY, undefined, adminToken),
      gql.query<{ contacts: Array<{ name: string }> }>(CONTACTS_QUERY, undefined, danielToken),
    ]);

    const adminNames = adminResult.data!.contacts.map((c) => c.name);
    const danielNames = danielResult.data!.contacts.map((c) => c.name);

    expect(adminNames).not.toEqual(danielNames);
  });

  it("should return empty array when not authenticated", async () => {
    const result = await gql.query<{ contacts: Array<unknown> }>(CONTACTS_QUERY);

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("UNAUTHENTICATED");
  });
});
