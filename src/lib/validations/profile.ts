import { z } from "zod";

import { blockTypes } from "@/types/profiles";

export const reservedUsernames = [
  "admin", "api", "login", "cadastro", "dashboard", "configuracoes",
  "marketplace", "explorar", "suporte", "termos", "privacidade",
  "contato", "blog", "templates", "recursos", "precos", "auth",
] as const;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use pelo menos 3 caracteres.")
  .max(30, "Use no máximo 30 caracteres.")
  .regex(/^[a-z0-9][a-z0-9_-]*$/, "Use apenas letras minúsculas, números, _ ou -.")
  .refine((value) => !reservedUsernames.includes(value as (typeof reservedUsernames)[number]), "Este username é reservado.");

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: z.string().trim().min(2, "Informe seu nome.").max(80),
  templateSlug: z.string().trim().min(2).max(40),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(300),
  professionalTitle: z.string().trim().max(100),
  location: z.string().trim().max(100),
  isPublished: z.boolean(),
});

export const appearanceSchema = z.object({
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  buttonStyle: z.enum(["glass", "solid", "outline", "soft"]),
  buttonRadius: z.number().int().min(0).max(32),
  linkLayout: z.enum(["stack", "grid"]),
});

export const blockTypeSchema = z.enum(blockTypes);
export const blockMutationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().max(120),
  text: z.string().trim().max(2000),
  url: z.union([z.literal(""), z.string().trim().url("Informe uma URL válida.").max(2048)]),
  isVisible: z.boolean(),
});

export type ProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fields?: Record<string, string[]>;
};

export const initialProfileState: ProfileActionState = { status: "idle" };
