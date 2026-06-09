import {describe, it, expect, beforeAll} from "vitest";
import {makeJWT, validateJWT, getBearerToken} from "./auth.js";
import type {Request} from "express";

describe("JWT validation", () => {
  const userId = "baggers";
  const token1 = makeJWT(userId, 3600, "skibidi-sigma");

  it("Should return userId from valid JWT token", () => {
    const result = validateJWT(token1, "skibidi-sigma");
    expect(result).toBe(userId);
  });

  const token2 = makeJWT(userId, -1, "skibidi-sigma");

  it("Should throw if JWT token is expired", () => {
    expect(() => validateJWT(token2, "skibidi-sigma")).toThrow();
  });

  const token3 = makeJWT(userId, 3600, "skibidi-sigma");

  it("Should throw if JWT secret wrong", () => {
    expect(() => validateJWT(token3, "sigma-skibidi")).toThrow();
  });

});

describe("JWT auth", () => {
  it("Header should exist and match", () => {
    const req = {
      get(field: string) {
        if (field === "Authorization") {
          return "Bearer abc123";
        };
      },
    } as Request;

    const token = getBearerToken(req);
    expect(token).toBe("abc123");
  });

  it("Authorization header missing", () => {
    const req = {
      get(field: string) {
        return undefined;
      },
    } as Request;

    expect(() => getBearerToken(req)).toThrow();
  });

});