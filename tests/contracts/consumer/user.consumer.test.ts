import { describe, it, expect } from "vitest";
import { PactV4 } from "@pact-foundation/pact";
import { like } from "@pact-foundation/pact/src/v3/matchers";

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

describe("User API consumer contract", () => {
  it("should handle login and register interactions", async () => {
    const provider = new PactV4({
      consumer: "GraphQLClient",
      provider: "GraphQLBackend",
      dir: "./tests/contracts/pacts",
    });

    provider.addGraphQLInteraction()
      .uponReceiving("a login request with valid credentials")
      .withOperation("Login")
      .withVariables({ email: "admin@test.com", password: "Password123" })
      .withRequest("POST", "/", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .withMutation(LOGIN_MUTATION)
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          data: {
            login: {
              token: like("jwt-token-abc-123"),
              user: {
                id: like("550e8400-e29b-41d4-a716-446655440000"),
                email: "admin@test.com",
                createdAt: like("2024-01-01T00:00:00.000Z"),
              },
            },
          },
        });
      });

    const interaction = provider.addGraphQLInteraction()
      .uponReceiving("a register request with new user")
      .withOperation("Register")
      .withVariables({ email: "pact-register@test.com", password: "Password123" })
      .withRequest("POST", "/", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .withMutation(REGISTER_MUTATION)
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          data: {
            register: {
              token: like("jwt-token-xyz-789"),
              user: {
                id: like("550e8400-e29b-41d4-a716-446655440001"),
                email: "pact-register@test.com",
                createdAt: like("2024-01-01T00:00:00.000Z"),
              },
            },
          },
        });
      });

    await interaction.executeTest(async (mockServer) => {
      const loginRes = await fetch(`${mockServer.url}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "Login",
          query: LOGIN_MUTATION,
          variables: { email: "admin@test.com", password: "Password123" },
        }),
      });

      const loginBody = await loginRes.json();
      expect(loginBody.data.login.token).toBe("jwt-token-abc-123");
      expect(loginBody.data.login.user.email).toBe("admin@test.com");

      const registerRes = await fetch(`${mockServer.url}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "Register",
          query: REGISTER_MUTATION,
          variables: { email: "pact-register@test.com", password: "Password123" },
        }),
      });

      const registerBody = await registerRes.json();
      expect(registerBody.data.register.token).toBe("jwt-token-xyz-789");
      expect(registerBody.data.register.user.email).toBe("pact-register@test.com");
    });
  });
});
