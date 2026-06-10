"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
  } catch (error) {
    redirect(
      `/signup?error=${encodeURIComponent(getAuthErrorMessage(error))}`,
    );
  }

  redirect("/");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch (error) {
    redirect(
      `/signin?error=${encodeURIComponent(getAuthErrorMessage(error))}`,
    );
  }

  redirect("/");
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/signin");
}
