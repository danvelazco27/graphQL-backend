import { describe, it, expect } from "vitest";
import { gql } from "../helpers/graphql-client.js";
import { getAdminToken, getDanielToken } from "../helpers/auth-helper.js";

const CONTACTS_QUERY = `
  query Contacts {
    contacts {
      id
      name
    }
  }
`;

const DELETE_CONTACT_MUTATION = `
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

describe("Mutation deleteContact", () => {
  it("should delete a contact owned by the user", async () => {
    const token = await getAdminToken();
    const newContact = await gql.mutate<{ createContact: { id: string } }>(
      `mutation { createContact(name: "Temp", email: "temp@test.com", phone: "999") { id } }`,
      undefined,
      token
    );

    const contactId = newContact.data!.createContact.id;

    const result = await gql.mutate<{ deleteContact: boolean }>(
      DELETE_CONTACT_MUTATION,
      { id: contactId },
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.deleteContact).toBe(true);
  });

  it("should reject deletion of another user's contact", async () => {
    const adminToken = await getAdminToken();
    const danielToken = await getDanielToken();

    const listResult = await gql.query<{ contacts: Array<{ id: string }> }>(
      CONTACTS_QUERY,
      undefined,
      adminToken
    );

    const adminContactId = listResult.data!.contacts[0].id;

    const result = await gql.mutate<{ deleteContact: boolean }>(
      DELETE_CONTACT_MUTATION,
      { id: adminContactId },
      danielToken
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("FORBIDDEN");
  });

  it("should reject non-existent contact", async () => {
    const token = await getAdminToken();
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const result = await gql.mutate<{ deleteContact: boolean }>(
      DELETE_CONTACT_MUTATION,
      { id: fakeId },
      token
    );

    expect(result.errors).toBeDefined();
    expect(result.errors![0].extensions?.code).toBe("NOT_FOUND");
  });
});
