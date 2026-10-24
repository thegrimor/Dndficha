"use server";

import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api/client";
import { clearSession, saveSession, getToken } from "@/lib/api/session";

interface SessionResponse {
  token: string;
  expiresAt: string;
}

async function openSession(route: "/auth/login" | "/auth/register", body: object, errorRoute: string) {
  let session: SessionResponse;
  try {
    session = await api<SessionResponse>(route, { method: "POST", body: body, authenticated: false });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "No se pudo completar la operación.";
    redirect(`${errorRoute}?error=${encodeURIComponent(message)}`);
  }
  await saveSession(session.token, session.expiresAt);
  redirect("/personajes");
}

export async function signIn(formData: FormData) {
  await openSession(
    "/auth/login",
    { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
    "/login"
  );
}

export async function signUp(formData: FormData) {
  await openSession(
    "/auth/register",
    {
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    },
    "/registro"
  );
}

export async function signOut() {
  const token = await getToken();
  if (token) {
    // If the backend does not respond, the cookie is cleared anyway.
    await api("/auth/logout", { method: "POST", token }).catch(() => undefined);
  }
  await clearSession();
  redirect("/login");
}

/** Sets a new password using the single-use link provided by the administrator. */
export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const goBack = (message: string) =>
    redirect(`/restablecer?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);

  if (password !== confirmation) goBack("Las contraseñas no coinciden.");

  try {
    await api("/auth/reset-password", { method: "POST", body: { token, password }, authenticated: false });
  } catch (error) {
    goBack(error instanceof ApiError ? error.message : "No se pudo cambiar la contraseña.");
  }
  redirect("/login?ok=1");
}
