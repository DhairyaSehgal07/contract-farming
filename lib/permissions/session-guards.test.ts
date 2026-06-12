import { describe, expect, it } from "vitest";
import {
  canDeleteSessionToken,
  canShowUserAdminActions,
  isUserBanProtected,
} from "@/lib/permissions/session-guards";

describe("canDeleteSessionToken", () => {
  it("returns false when token matches the current session token", () => {
    expect(canDeleteSessionToken("current-token", "current-token")).toBe(false);
  });

  it("returns true when token differs from the current session token", () => {
    expect(canDeleteSessionToken("other-token", "current-token")).toBe(true);
  });

  it("returns true when there is no current session token", () => {
    expect(canDeleteSessionToken("other-token")).toBe(true);
  });
});

describe("canShowUserAdminActions", () => {
  it("returns false for the signed-in user", () => {
    expect(canShowUserAdminActions("user-1", "user-1", true)).toBe(false);
  });

  it("returns false when user management is not allowed", () => {
    expect(canShowUserAdminActions("user-2", "user-1", false)).toBe(false);
  });

  it("returns true for other users when management is allowed", () => {
    expect(canShowUserAdminActions("user-2", "user-1", true)).toBe(true);
  });
});

describe("isUserBanProtected", () => {
  it("returns true for managing director role", () => {
    expect(isUserBanProtected("MANAGING_DIRECTOR")).toBe(true);
  });

  it("returns false for other roles", () => {
    expect(isUserBanProtected("USER")).toBe(false);
    expect(isUserBanProtected(null)).toBe(false);
    expect(isUserBanProtected(undefined)).toBe(false);
  });
});
