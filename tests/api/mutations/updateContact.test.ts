import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken, getDanielToken } from "../helpers/auth-helper.js";
import { updatedContact } from "../fixtures/contact.fixture.js";

const CONTACTS_QUERY = `
  query Contacts {
    contacts {
      id
    }
  }
`;

const UPDATE_CONTACT_MUTATION = `
  mutation UpdateContact($id: ID!, $name: String, $email: String, $phone: String) {
    updateContact(id: $id, name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      createdAt
    }
  }
`;

interface UpdateData {
  updateContact: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

describe("Mutation updateContact", () => {
  it("should update a contact owned by the user", async () => {
    const token = await getAdminToken();

    const listResult = await gql.query<{ contacts: Array<{ id: string }> }>(
      CONTACTS_QUERY,
      undefined,
      token
    );

    const contactId = listResult.data!.contacts[0].id;

    const result = await gql.mutate<UpdateData>(
      UPDATE_CONTACT_MUTATION,
      { id: contactId, ...updatedContact },
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.updateContact.name).toBe(updatedContact.name);
    expect(result.data?.updateContact.email).toBe(updatedContact.email);
    expect(result.data?.updateContact.phone).toBe(updatedContact.phone);
  });

  it("should reject update of another user's contact", async () => {
    const adminToken = await getAdminToken();
    const danielToken = await getDanielToken();

    const listResult = await gql.query<{ contacts: Array<{ id: string }> }>(
      CONTACTS_QUERY,
      undefined,
      adminToken
    );

    const contactId = listResult.data!.contacts[0].id;

    const result = await gql.mutate<UpdateData>(
      UPDATE_CONTACT_MUTATION,
      { id: contactId, name: "Hacker" },
      danielToken
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("FORBIDDEN");
  });

  it("should reject non-existent contact", async () => {
    const token = await getAdminToken();
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const result = await gql.mutate<UpdateData>(
      UPDATE_CONTACT_MUTATION,
      { id: fakeId, name: "Ghost" },
      token
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("NOT_FOUND");
  });
});
