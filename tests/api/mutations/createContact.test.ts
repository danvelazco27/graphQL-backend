import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken } from "../helpers/auth-helper.js";
import { newContact, invalidContact } from "../fixtures/contact.fixture.js";

const CREATE_CONTACT_MUTATION = `
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

interface ContactData {
  createContact: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

describe("Mutation createContact", () => {
  it("should create a contact when authenticated", async () => {
    const token = await getAdminToken();

    const result = await gql.mutate<ContactData>(
      CREATE_CONTACT_MUTATION,
      newContact,
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.createContact).toBeDefined();
    expect(result.data?.createContact.name).toBe(newContact.name);
    expect(result.data?.createContact.email).toBe(newContact.email);
    expect(result.data?.createContact.phone).toBe(newContact.phone);
    expect(result.data?.createContact.id).toBeTruthy();
  });

  it("should reject when not authenticated", async () => {
    const result = await gql.mutate<ContactData>(
      CREATE_CONTACT_MUTATION,
      newContact
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should reject invalid input", async () => {
    const token = await getAdminToken();

    const result = await gql.mutate<ContactData>(
      CREATE_CONTACT_MUTATION,
      invalidContact,
      token
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("BAD_USER_INPUT");
  });
});
