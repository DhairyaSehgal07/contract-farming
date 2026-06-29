import type { KeyboardEvent } from "react";

export function preventImplicitFormSubmit(
  event: KeyboardEvent<HTMLFormElement>,
) {
  if (event.key !== "Enter") return;
  if (event.defaultPrevented) return;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target instanceof HTMLTextAreaElement) return;
  if (target instanceof HTMLButtonElement && target.type === "submit") return;

  if (target instanceof HTMLInputElement) {
    if (target.getAttribute("aria-expanded") === "true") return;
    event.preventDefault();
  }
}
