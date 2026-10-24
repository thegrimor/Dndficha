"use server";

import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api/cliente";
import { borrarSesion, guardarSesion, obtenerToken } from "@/lib/api/sesion";

interface RespuestaSesion {
  token: string;
  expiresAt: string;
}

async function abrirSesion(ruta: "/auth/login" | "/auth/register", cuerpo: object, rutaError: string) {
  let sesion: RespuestaSesion;
  try {
    sesion = await api<RespuestaSesion>(ruta, { method: "POST", body: cuerpo, autenticada: false });
  } catch (error) {
    const mensaje = error instanceof ApiError ? error.message : "No se pudo completar la operación.";
    redirect(`${rutaError}?error=${encodeURIComponent(mensaje)}`);
  }
  await guardarSesion(sesion.token, sesion.expiresAt);
  redirect("/personajes");
}

export async function iniciarSesion(formData: FormData) {
  await abrirSesion(
    "/auth/login",
    { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
    "/login"
  );
}

export async function registrarse(formData: FormData) {
  await abrirSesion(
    "/auth/register",
    {
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    },
    "/registro"
  );
}

export async function cerrarSesion() {
  const token = await obtenerToken();
  if (token) {
    // Si el backend no responde, la cookie se borra igualmente.
    await api("/auth/logout", { method: "POST", token }).catch(() => undefined);
  }
  await borrarSesion();
  redirect("/login");
}

/** Fija una contraseña nueva con el enlace de un solo uso que entrega el administrador. */
export async function restablecerContrasena(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmacion = String(formData.get("confirmacion") ?? "");
  const volver = (mensaje: string) =>
    redirect(`/restablecer?token=${encodeURIComponent(token)}&error=${encodeURIComponent(mensaje)}`);

  if (password !== confirmacion) volver("Las contraseñas no coinciden.");

  try {
    await api("/auth/reset-password", { method: "POST", body: { token, password }, autenticada: false });
  } catch (error) {
    volver(error instanceof ApiError ? error.message : "No se pudo cambiar la contraseña.");
  }
  redirect("/login?ok=1");
}
