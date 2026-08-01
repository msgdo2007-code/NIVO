import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./utils";

describe("safeRedirectPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeRedirectPath("/dashboard/editor")).toBe("/dashboard/editor");
  });

  it("bloqueia URLs externas e caminhos relativos", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
  });
});
