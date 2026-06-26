import { describe, expect, it } from "vitest";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

describe("getPrismaErrorMessage", () => {
  it("maps Prisma 7 adapter unique constraint fields to readable labels", () => {
    const message = getPrismaErrorMessage(
      {
        code: "P2002",
        meta: {
          modelName: "Farmer",
          driverAdapterError: {
            cause: {
              constraint: {
                fields: ['"accountNumber"'],
              },
            },
          },
        },
      },
      "farmer",
    );

    expect(message).toBe("A farmer with this account number already exists.");
  });

  it("still supports legacy Prisma target metadata", () => {
    const message = getPrismaErrorMessage(
      {
        code: "P2002",
        meta: { target: ["aadharNumber"] },
      },
      "farmer",
    );

    expect(message).toBe("A farmer with this Aadhaar number already exists.");
  });
});
