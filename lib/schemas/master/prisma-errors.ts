type PrismaLikeError = {
  code: string;
  meta?: { target?: string[]; field_name?: string };
};

function isPrismaLikeError(error: unknown): error is PrismaLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PrismaLikeError).code === "string"
  );
}

const uniqueFieldLabels: Record<string, string> = {
  name: "name",
  accountNumber: "account number",
  aadharNumber: "Aadhaar number",
  panCardNumber: "PAN card number",
};

export function getPrismaErrorMessage(
  error: unknown,
  entityLabel: string,
): string {
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "ECONNREFUSED"
  ) {
    return "Could not connect to the database. Check DATABASE_URL and DIRECT_URL.";
  }

  if (!isPrismaLikeError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Something went wrong. Please try again.";
  }

  if (error.code === "P2002") {
    const field = error.meta?.target?.[0];
    const label = field ? (uniqueFieldLabels[field] ?? field) : "value";
    return `A ${entityLabel} with this ${label} already exists.`;
  }

  if (error.code === "P2003") {
    return `Cannot delete this ${entityLabel} because it is linked to other records.`;
  }

  if (error.code === "P2025") {
    return `${entityLabel} not found.`;
  }

  return "Something went wrong. Please try again.";
}
