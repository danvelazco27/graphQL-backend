import { getUserFromToken, type AuthContext } from "./middleware/auth.js";

export interface Context {
  user: AuthContext["user"];
}

export async function createContext({
  req,
}: {
  req: { headers: { authorization?: string } };
}): Promise<Context> {
  const token = req.headers.authorization;
  const user = getUserFromToken(token);

  return { user };
}
