import {describe, it, expect, beforeAll} from "vitest";
import {makeJWT, validateJWT} from "./auth.js";

describe("Password Hashing", () => {
  const userId = "baggers";
  const token1 = makeJWT(userId, 3600, "skibidi-sigma");

  it("Should return true for password hash", async () => {
    const result = validateJWT(token1, "skibidi-sigma");
    expect(result).toBe(userId);
  });

  const token2 = makeJWT(userId, 0, "skibidi-sigma");

  it("Should throw if expired", async () => {
    expect(() => validateJWT(token2, "skibidi-sigma")).toThrow();
  });

  const token3 = makeJWT(userId, 3600, "skibidi-sigma");

  it("Should throw if secret wrong", async () => {
    expect(() => validateJWT(token3, "sigma-skibidi")).toThrow();
  });
});