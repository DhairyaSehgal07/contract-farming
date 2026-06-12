import { NextRequest } from "next/server";

export class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.name = "RedirectError";
    this.url = url;
  }
}

export function createNextRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

export function createFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

import type { SessionRow } from "@/app/actions/permissions/sessions";
import type { PermissionsUser } from "@/components/permissions/users/user-columns";

export function createSessionRow(
  overrides: Partial<SessionRow> = {},
): SessionRow {
  return {
    id: "session-1",
    token: "token-1",
    expiresAt: new Date("2030-01-01"),
    createdAt: new Date("2026-01-01"),
    ipAddress: "127.0.0.1",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0",
    impersonatedBy: null,
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "USER",
    },
    ...overrides,
  };
}

export function createPermissionsUser(
  overrides: Partial<PermissionsUser> = {},
): PermissionsUser {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "USER",
    banned: false,
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

export const mockSession = {
  session: {
    id: "session-1",
    userId: "user-1",
    expiresAt: new Date("2030-01-01"),
    token: "token-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    role: "MANAGING_DIRECTOR",
    stationId: null,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};
