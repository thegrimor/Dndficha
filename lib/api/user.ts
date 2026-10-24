import { api, ApiError } from "./client";

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

/** User of the current session (redirects to /login if there is no valid session). */
export async function currentUser(): Promise<User> {
  const { user } = await api<{ user: User }>("/auth/me");
  return user;
}

export { ApiError };
