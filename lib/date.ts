/** Calendar-date helpers using local timezone — avoid UTC ISO date strings. */

export function toLocalDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDmy(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_DMY_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

export function isDateOnlyString(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value);
}

export function isDateDmyString(value: string): boolean {
  return DATE_DMY_PATTERN.test(value);
}

export function parseDateOnlyInput(value: string): Date | undefined {
  if (!isDateOnlyString(value)) {
    return undefined;
  }

  const date = parseDateOnly(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return formatDateOnly(date) === value ? date : undefined;
}

export function parseDateDmyInput(value: string): Date | undefined {
  if (!isDateDmyString(value)) {
    return undefined;
  }

  const [day, month, year] = value.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return formatDateDmy(date) === value ? date : undefined;
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = DATE_ONLY_PATTERN.test(value)
    ? parseDateOnly(value)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
