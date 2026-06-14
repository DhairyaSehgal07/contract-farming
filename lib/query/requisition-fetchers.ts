import {
  listRequisitionFarmers,
  listRequisitions,
  listRequisitionVarieties,
} from "@/app/actions/requisition/requisitions";

async function unwrap<T>(
  promise: Promise<
    { success: true; data: T } | { success: false; error: string }
  >,
) {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function fetchRequisitions() {
  return unwrap(listRequisitions());
}

export async function fetchRequisitionFarmers() {
  return unwrap(listRequisitionFarmers());
}

export async function fetchRequisitionVarieties() {
  return unwrap(listRequisitionVarieties());
}
