import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { createNextRequest, mockSession } from "@/lib/auth/test-utils";
import { proxy } from "@/proxy";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const getSession = vi.mocked(auth.api.getSession);

describe("proxy", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("passes through Better Auth API routes without checking session", async () => {
    const response = await proxy(createNextRequest("/api/auth/sign-in/email"));

    expect(getSession).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated access to /signin", async () => {
    getSession.mockResolvedValue(null);

    const response = await proxy(createNextRequest("/signin"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects /signup to /signin", async () => {
    const response = await proxy(createNextRequest("/signup"));

    expect(getSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/signin",
    );
  });

  it("redirects authenticated users away from /signin", async () => {
    getSession.mockResolvedValue(mockSession);

    const response = await proxy(createNextRequest("/signin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects unauthenticated users from protected routes to /signin", async () => {
    getSession.mockResolvedValue(null);

    const response = await proxy(createNextRequest("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/signin",
    );
  });

  it("allows authenticated users to access protected routes", async () => {
    getSession.mockResolvedValue(mockSession);

    const response = await proxy(createNextRequest("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("checks session using request headers", async () => {
    const request = createNextRequest("/");
    getSession.mockResolvedValue(null);

    await proxy(request);

    expect(getSession).toHaveBeenCalledWith({
      headers: request.headers,
    });
  });
});

describe("proxy config", () => {
  it("excludes static assets and auth API routes from the matcher", async () => {
    const { config } = await import("@/proxy");

    expect(config.matcher).toEqual([
      "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]);
  });
});
