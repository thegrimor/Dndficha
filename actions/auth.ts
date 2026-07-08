"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function iniciarSesion(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/personajes");
}

export async function registrarse(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const username = String(formData.get("username"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/personajes");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
