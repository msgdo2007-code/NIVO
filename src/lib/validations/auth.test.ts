import { describe, expect, it } from "vitest";

import { loginSchema, passwordSchema, signupSchema } from "./auth";

describe("schemas de autenticação", () => {
  it("aceita um cadastro válido", () => {
    expect(
      signupSchema.safeParse({
        name: "Nina Cósmica",
        email: "nina@nivo.app",
        password: "orbita123",
      }).success,
    ).toBe(true);
  });

  it("rejeita senha fraca", () => {
    expect(passwordSchema.safeParse("somenteletras").success).toBe(false);
  });

  it("rejeita login sem senha", () => {
    expect(loginSchema.safeParse({ email: "nina@nivo.app", password: "" }).success).toBe(false);
  });
});
