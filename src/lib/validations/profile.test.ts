import { describe, expect, it } from "vitest";

import { appearanceSchema, onboardingSchema, usernameSchema } from "./profile";

describe("validações de perfil", () => {
  it("normaliza um username válido", () => {
    expect(usernameSchema.parse("  Nina_Cosmica ")).toBe("nina_cosmica");
  });

  it("rejeita username reservado ou inseguro", () => {
    expect(usernameSchema.safeParse("dashboard").success).toBe(false);
    expect(usernameSchema.safeParse("../admin").success).toBe(false);
  });

  it("exige template no onboarding", () => {
    expect(onboardingSchema.safeParse({ username: "nina", displayName: "Nina", templateSlug: "" }).success).toBe(false);
  });

  it("rejeita valores visuais fora da allowlist", () => {
    expect(appearanceSchema.safeParse({ accentColor: "red", backgroundColor: "#000000", buttonStyle: "script", buttonRadius: 80, linkLayout: "stack" }).success).toBe(false);
  });
});
