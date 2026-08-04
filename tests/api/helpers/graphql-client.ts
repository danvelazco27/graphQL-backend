import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

export class GraphQLClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    token?: string
  ): Promise<GraphQLResponse<T>> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response: AxiosResponse<GraphQLResponse<T>> = await this.client({
      data: { query, variables },
      headers,
    });

    return response.data;
  }

  async mutate<T>(
    mutation: string,
    variables?: Record<string, unknown>,
    token?: string
  ): Promise<GraphQLResponse<T>> {
    return this.query<T>(mutation, variables, token);
  }
}

export const gql = new GraphQLClient(process.env.API_URL ?? "http://localhost:4000/");
