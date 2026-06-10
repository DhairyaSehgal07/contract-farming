import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInAction, signOutAction, signUpAction } from "@/app/actions/auth";
import { auth } from "@/lib/auth";
import { createFormData, RedirectError } from "@/lib/auth/test-utils";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

const signUpEmail = vi.mocked(auth.api.signUpEmail);
const signInEmail = vi.mocked(auth.api.signInEmail);
const signOut = vi.mocked(auth.api.signOut);
const getHeaders = vi.mocked(headers);
const nextRedirect = vi.mocked(redirect);

async function expectRedirect(action: () => Promise<unknown>, url: string) {
  await expect(action()).rejects.toMatchObject({ url });
  expect(nextRedirect).toHaveBeenCalledWith(url);
}

describe("signUpAction", () => {
  beforeEach(() => {
    signUpEmail.mockReset();
    nextRedirect.mockClear();
  });

  it("signs up the user and redirects to the dashboard", async () => {
    signUpEmail.mockResolvedValue(
      {} as Awaited<ReturnType<typeof signUpEmail>>,
    );

    await expectRedirect(
      () =>
        signUpAction(
          createFormData({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        ),
      "/?toast=signedUp",
    );

    expect(signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
  });

  it("redirects back to signup with API error message on failure", async () => {
    signUpEmail.mockRejectedValue(
      new APIError("BAD_REQUEST", { message: "Email already exists" }),
    );

    await expectRedirect(
      () =>
        signUpAction(
          createFormData({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        ),
      "/signup?error=Email%20already%20exists",
    );
  });

  it("redirects back to signup with generic message for unknown errors", async () => {
    signUpEmail.mockRejectedValue("unexpected");

    await expectRedirect(
      () =>
        signUpAction(
          createFormData({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        ),
      "/signup?error=Something%20went%20wrong.%20Please%20try%20again.",
    );
  });
});

describe("signInAction", () => {
  beforeEach(() => {
    signInEmail.mockReset();
    nextRedirect.mockClear();
  });

  it("signs in the user and redirects to the dashboard", async () => {
    signInEmail.mockResolvedValue(
      {} as Awaited<ReturnType<typeof signInEmail>>,
    );

    await expectRedirect(
      () =>
        signInAction(
          createFormData({
            email: "test@example.com",
            password: "password123",
          }),
        ),
      "/?toast=signedIn",
    );

    expect(signInEmail).toHaveBeenCalledWith({
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
  });

  it("redirects back to signin with API error message on failure", async () => {
    signInEmail.mockRejectedValue(
      new APIError("UNAUTHORIZED", { message: "Invalid credentials" }),
    );

    await expectRedirect(
      () =>
        signInAction(
          createFormData({
            email: "test@example.com",
            password: "wrong-password",
          }),
        ),
      "/signin?error=Invalid%20credentials",
    );
  });

  it("redirects back to signin with generic message for unknown errors", async () => {
    signInEmail.mockRejectedValue(new Error("Network error"));

    await expectRedirect(
      () =>
        signInAction(
          createFormData({
            email: "test@example.com",
            password: "password123",
          }),
        ),
      "/signin?error=Network%20error",
    );
  });
});

describe("signOutAction", () => {
  beforeEach(() => {
    signOut.mockReset();
    getHeaders.mockReset();
    nextRedirect.mockClear();
  });

  it("signs out using request headers and redirects to signin", async () => {
    const requestHeaders = new Headers({ cookie: "session=abc" });
    getHeaders.mockResolvedValue(
      requestHeaders as Awaited<ReturnType<typeof headers>>,
    );
    signOut.mockResolvedValue({} as Awaited<ReturnType<typeof signOut>>);

    await expectRedirect(() => signOutAction(), "/signin?toast=signedOut");

    expect(signOut).toHaveBeenCalledWith({
      headers: requestHeaders,
    });
  });
});
