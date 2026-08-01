"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSiteUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";
import {
  type AuthActionState,
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";

const oauthProviderSchema = z.enum(["discord", "google"]);

function errorState(message: string, fields?: Record<string, string[]>): AuthActionState {
  return { status: "error", message, fields };
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Este e-mail já possui uma conta.";
  if (normalized.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return "Não foi possível concluir a autenticação. Tente novamente.";
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return errorState("Revise os campos destacados.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return errorState(authErrorMessage(error.message));

  redirect(safeRedirectPath(String(formData.get("next") ?? "")));
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return errorState("Revise os campos destacados.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) return errorState(authErrorMessage(error.message));
  if (data.session) redirect("/dashboard");

  return {
    status: "success",
    message: "Conta criada. Abra o link enviado ao seu e-mail para confirmar o acesso.",
  };
}

export async function signInWithOAuth(formData: FormData) {
  const parsed = oauthProviderSchema.safeParse(formData.get("provider"));
  if (!parsed.success) redirect("/login?error=provider");

  const supabase = await createClient();
  const next = safeRedirectPath(String(formData.get("next") ?? ""));
  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data,
    options: {
      redirectTo: callbackUrl.toString(),
      scopes: parsed.data === "discord" ? "identify email" : "openid email profile",
    },
  });

  if (error || !data.url) redirect(`/login?error=${parsed.data}`);
  redirect(data.url);
}

export async function requestPasswordReset(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return errorState(parsed.error.issues[0]?.message ?? "E-mail inválido.");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/atualizar-senha`,
  });

  if (error) return errorState(authErrorMessage(error.message));
  return {
    status: "success",
    message: "Se houver uma conta com esse e-mail, enviaremos as instruções de recuperação.",
  };
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return errorState("A nova senha não atende aos requisitos.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(parsed.data);
  if (error) return errorState(authErrorMessage(error.message));
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
