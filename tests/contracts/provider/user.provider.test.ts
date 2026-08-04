import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync } from "fs";
import { Verifier } from "@pact-foundation/pact";
import { pactConfig } from "../../../pact.config.js";
import { setupPactDb, teardownPactDb } from "./pact-setup.js";

const PACT_PATH = `${pactConfig.pactDir}/GraphQLClient-GraphQLBackend.json`;

describe("User provider verification", () => {
  beforeAll(async () => {
    await setupPactDb();
  });

  afterAll(async () => {
    await teardownPactDb();
  });

  it("should verify the provider against the user contract", async () => {
    if (!existsSync(PACT_PATH)) {
      console.warn(`Pact file not found at ${PACT_PATH}. Run consumer tests first.`);
      return;
    }

    const output = await new Verifier({
      provider: pactConfig.provider,
      providerBaseUrl: process.env.API_URL ?? "http://localhost:4000/",
      pactUrls: [PACT_PATH],
    }).verifyProvider();

    const result = JSON.parse(output);
    expect(result.result).toBe(true);
  });
});
