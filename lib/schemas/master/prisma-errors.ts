type PrismaLikeError = {
  code: string;
  meta?: {
    target?: string[];
    field_name?: string;
    driverAdapterError?: {
      cause?: {
        constraint?: {
          fields?: string[];
        };
      };
    };
  };
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
  email: "email",
};

function normalizeConstraintField(field: string): string {
  return field.replace(/^"+|"+$/g, "");
}

function getUniqueConstraintField(error: PrismaLikeError): string | undefined {
  const targetField = error.meta?.target?.[0];
  if (targetField) {
    return normalizeConstraintField(targetField);
  }

  const adapterField =
    error.meta?.driverAdapterError?.cause?.constraint?.fields?.[0];
  if (adapterField) {
    return normalizeConstraintField(adapterField);
  }

  return undefined;
}

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
    const field = getUniqueConstraintField(error);
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
