import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .email("Informe um e-mail válido.")
  .max(254, "O e-mail é muito longo.");

export const passwordSchema = z
  .string()
  .min(8, "Use pelo menos 8 caracteres.")
  .max(72, "Use no máximo 72 caracteres.")
  .regex(/[A-Za-zÀ-ÿ]/, "Inclua pelo menos uma letra.")
  .regex(/[0-9]/, "Inclua pelo menos um número.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(80, "Use no máximo 80 caracteres."),
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({ password: passwordSchema });

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fields?: Record<string, string[]>;
};

export const initialAuthState: AuthActionState = { status: "idle" };
