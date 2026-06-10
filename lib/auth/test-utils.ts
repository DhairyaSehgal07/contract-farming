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
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};
