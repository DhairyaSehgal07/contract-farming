export const toastMessages = {
  signedIn: {
    title: "Welcome back",
    description: "You have signed in successfully.",
  },
  signedUp: {
    title: "Account created",
    description: "Welcome to Contract Farming.",
  },
  signedOut: {
    title: "Signed out",
    description: "You have been signed out safely.",
  },
} as const;

export type ToastKey = keyof typeof toastMessages;

export function isToastKey(value: string): value is ToastKey {
  return value in toastMessages;
}
