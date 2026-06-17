import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  approveRequisition,
  rejectRequisition,
} from "@/app/actions/requisition/requisitions";
import { RequisitionStatus, Role } from "@/app/generated/prisma/client";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

vi.mock("@/lib/schemas/requisition/auth", () => ({
  requireRequisitionApproveAction: vi.fn(async () => null),
}));

vi.mock("@/lib/schemas/master/auth", () => ({
  requireAuthAction: vi.fn(async () => null),
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    requisition: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const getSession = vi.mocked(getServerSession);
const findUnique = vi.mocked(prisma.requisition.findUnique);
const update = vi.mocked(prisma.requisition.update);

const requisitionInclude = {
  farmer: { name: "Farmer One", accountNumber: "ACC-001" },
  variety: { name: "Himalini" },
  createdBy: { name: "Creator" },
  reviewedBy: { name: "Reviewer" },
};

const pendingRequisition = {
  id: "req-1",
  status: RequisitionStatus.PENDING,
  createdById: "creator-1",
};

const updatedRequisition = {
  id: "req-1",
  requisitionDate: new Date("2026-06-01"),
  requestedDeliveryDate: new Date("2026-06-15"),
  acres: null,
  initialQuantity: null,
  status: RequisitionStatus.APPROVED,
  rejectionRemarks: null,
  farmerId: "farmer-1",
  varietyId: "variety-1",
  createdById: "creator-1",
  reviewedById: "reviewer-1",
  reviewedAt: new Date("2026-06-10"),
  approvalDate: new Date("2026-06-10"),
  rejectionDate: null,
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-10"),
  ...requisitionInclude,
};

describe("approveRequisition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({
      user: {
        id: "reviewer-1",
        name: "Reviewer",
        email: "reviewer@example.com",
        role: Role.PROGRAMME_MANAGER,
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "reviewer-1",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);
  });

  it("approves a pending requisition", async () => {
    findUnique.mockResolvedValue(pendingRequisition as never);
    update.mockResolvedValue(updatedRequisition as never);

    const result = await approveRequisition({
      id: "req-1",
      approvedDeliveryDate: "2026-06-12",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(RequisitionStatus.APPROVED);
    }
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "req-1" },
        data: expect.objectContaining({
          status: RequisitionStatus.APPROVED,
          reviewedById: "reviewer-1",
          approvedDeliveryDate: new Date("2026-06-12T00:00:00.000Z"),
          rejectionRemarks: null,
          rejectionDate: null,
        }),
      }),
    );
  });

  it("rejects approving a non-pending requisition", async () => {
    findUnique.mockResolvedValue({
      ...pendingRequisition,
      status: RequisitionStatus.APPROVED,
    } as never);

    const result = await approveRequisition({
      id: "req-1",
      approvedDeliveryDate: "2026-06-12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Only pending requisitions");
    }
    expect(update).not.toHaveBeenCalled();
  });

  it("blocks self-approval for non-director roles", async () => {
    getSession.mockResolvedValue({
      user: {
        id: "creator-1",
        name: "Creator",
        email: "creator@example.com",
        role: Role.PROGRAMME_MANAGER,
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "creator-1",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);
    findUnique.mockResolvedValue(pendingRequisition as never);

    const result = await approveRequisition({
      id: "req-1",
      approvedDeliveryDate: "2026-06-12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("your own requisition");
    }
    expect(update).not.toHaveBeenCalled();
  });

  it("allows managing director to approve their own requisition", async () => {
    getSession.mockResolvedValue({
      user: {
        id: "creator-1",
        name: "Director",
        email: "director@example.com",
        role: Role.MANAGING_DIRECTOR,
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "creator-1",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);
    findUnique.mockResolvedValue(pendingRequisition as never);
    update.mockResolvedValue(updatedRequisition as never);

    const result = await approveRequisition({
      id: "req-1",
      approvedDeliveryDate: "2026-06-12",
    });

    expect(result.success).toBe(true);
    expect(update).toHaveBeenCalled();
  });

  it("requires approved delivery date", async () => {
    const result = await approveRequisition({
      id: "req-1",
      approvedDeliveryDate: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Date is required");
    }
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe("rejectRequisition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({
      user: {
        id: "reviewer-1",
        name: "Reviewer",
        email: "reviewer@example.com",
        role: Role.ACCOUNTS_SETTLEMENTS_MANAGER,
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "reviewer-1",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);
  });

  it("rejects a pending requisition with remarks", async () => {
    findUnique.mockResolvedValue(pendingRequisition as never);
    update.mockResolvedValue({
      ...updatedRequisition,
      status: RequisitionStatus.REJECTED,
      approvalDate: null,
      rejectionDate: new Date("2026-06-10"),
      rejectionRemarks: "Insufficient acreage details",
    } as never);

    const result = await rejectRequisition({
      id: "req-1",
      rejectionRemarks: "Insufficient acreage details",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(RequisitionStatus.REJECTED);
      expect(result.data.rejectionRemarks).toBe("Insufficient acreage details");
    }
  });

  it("requires rejection remarks", async () => {
    const result = await rejectRequisition({
      id: "req-1",
      rejectionRemarks: "ab",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("at least 3 characters");
    }
    expect(findUnique).not.toHaveBeenCalled();
  });
});
