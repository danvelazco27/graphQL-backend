export const pactConfig = {
  consumer: "GraphQLClient",
  provider: "GraphQLBackend",
  pactDir: "./tests/contracts/pacts",
  logLevel: "warn",
} as const;

export const pactBrokerConfig = {
  brokerUrl: process.env.PACT_BROKER_URL ?? "",
  brokerToken: process.env.PACT_BROKER_TOKEN ?? "",
  publishVersion: process.env.PACT_PUBLISH_VERSION ?? "1.0.0",
};
