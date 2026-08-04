import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken } from "../helpers/auth-helper.js";

const CONTACT_QUERY = `
  query Contact($id: ID!) {
    contact(id: $id) {
      id
      name
      email
      phone
      createdAt
    }
  }
`;

const CREATE_CONTACT = `
  mutation CreateContact($name: String!, $email: String!, $phone: String!) {
    createContact(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      createdAt
    }
  }
`;

describe("Query contact", () => {
  it("should return a contact by id", async () => {
    const token = await getAdminToken();

    const createResult = await gql.mutate<{ createContact: { id: string; name: string } }>(
      CREATE_CONTACT,
      { name: "Query Test", email: "query-test@test.com", phone: "555-query" },
      token
    );

    const contactId = createResult.data!.createContact.id;

    const result = await gql.query<{ contact: { id: string; name: string; email: string; phone: string; createdAt: string } }>(
      CONTACT_QUERY,
      { id: contactId },
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.contact).toBeDefined();
    expect(result.data?.contact.id).toBe(contactId);
    expect(result.data?.contact.name).toBe("Query Test");
    expect(result.data?.contact.email).toBeTruthy();
    expect(result.data?.contact.phone).toBeTruthy();
  });

  it("should return error for non-existent contact", async () => {
    const token = await getAdminToken();
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const result = await gql.query<{ contact: null }>(CONTACT_QUERY, { id: fakeId }, token);

    expect(result.data?.contact).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("NOT_FOUND");
  });

  it("should return error when not authenticated", async () => {
    const result = await gql.query(CONTACT_QUERY, { id: "some-id" });

    expect(result.errors).toBeDefined();
  });
});
