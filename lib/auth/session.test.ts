import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { mockSession } from "@/lib/auth/test-utils";
import { getServerSession } from "@/lib/auth/session";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const getSession = vi.mocked(auth.api.getSession);
const getHeaders = vi.mocked(headers);

describe("getServerSession", () => {
  beforeEach(() => {
    getSession.mockReset();
    getHeaders.mockReset();
  });

  it("returns the session from Better Auth", async () => {
    const requestHeaders = new Headers({ cookie: "session=abc" });
    getHeaders.mockResolvedValue(requestHeaders as Awaited<ReturnType<typeof headers>>);
    getSession.mockResolvedValue(mockSession);

    await expect(getServerSession()).resolves.toEqual(mockSession);
  });

  it("passes request headers to auth.api.getSession", async () => {
    const requestHeaders = new Headers({ cookie: "session=abc" });
    getHeaders.mockResolvedValue(requestHeaders as Awaited<ReturnType<typeof headers>>);
    getSession.mockResolvedValue(null);

    await getServerSession();

    expect(getSession).toHaveBeenCalledWith({
      headers: requestHeaders,
    });
  });

  it("returns null when there is no active session", async () => {
    getHeaders.mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
    getSession.mockResolvedValue(null);

    await expect(getServerSession()).resolves.toBeNull();
  });
});
