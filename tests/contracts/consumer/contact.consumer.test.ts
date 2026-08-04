import { describe, it, expect } from "vitest";
import { PactV4 } from "@pact-foundation/pact";
import { like, eachLike } from "@pact-foundation/pact/src/v3/matchers";
import { signToken } from "../../../src/utils/jwt.js";

const AUTH_TOKEN = signToken({
  userId: "00000000-0000-0000-0000-000000000001",
  email: "pact-test@test.com",
});

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

describe("Contact API consumer contract", () => {
  it("should handle contacts query and createContact", async () => {
    const provider = new PactV4({
      consumer: "GraphQLClient",
      provider: "GraphQLBackend",
      dir: "./tests/contracts/pacts",
    });

    provider.addGraphQLInteraction()
      .uponReceiving("a contacts query with auth")
      .withOperation("Contacts")
      .withRequest("POST", "/", (builder) => {
        builder.headers({
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
        });
      })
      .withQuery(CONTACTS_QUERY)
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          data: {
            contacts: eachLike(
              {
                id: like("550e8400-e29b-41d4-a716-446655440010"),
                name: "John Doe",
                email: "john@example.com",
                phone: "3001234567",
                createdAt: like("2024-01-01T00:00:00.000Z"),
              },
              0
            ),
          },
        });
      });

    const interaction = provider.addGraphQLInteraction()
      .uponReceiving("a createContact request with valid data")
      .withOperation("CreateContact")
      .withVariables({ name: "Alice", email: "alice@test.com", phone: "555-0100" })
      .withRequest("POST", "/", (builder) => {
        builder.headers({
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
        });
      })
      .withMutation(CREATE_CONTACT_MUTATION)
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          data: {
            createContact: {
              id: like("550e8400-e29b-41d4-a716-446655440020"),
              name: "Alice",
              email: "alice@test.com",
              phone: "555-0100",
              createdAt: like("2024-01-03T00:00:00.000Z"),
            },
          },
        });
      });

    await interaction.executeTest(async (mockServer) => {
      const queryRes = await fetch(`${mockServer.url}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
        },
        body: JSON.stringify({
          operationName: "Contacts",
          query: CONTACTS_QUERY,
        }),
      });

      const queryBody = await queryRes.json();
      expect(Array.isArray(queryBody.data.contacts)).toBe(true);

      const createRes = await fetch(`${mockServer.url}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
        },
        body: JSON.stringify({
          operationName: "CreateContact",
          query: CREATE_CONTACT_MUTATION,
          variables: { name: "Alice", email: "alice@test.com", phone: "555-0100" },
        }),
      });

      const createBody = await createRes.json();
      expect(createBody.data.createContact.name).toBe("Alice");
    });
  });
});
