import {
  listDispatchableRequisitions,
  listDispatchFormOptions,
  listDispatches,
} from "@/app/actions/dispatch/dispatches";

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

export async function fetchDispatches() {
  return unwrap(listDispatches());
}

export async function fetchDispatchableRequisitions() {
  return unwrap(listDispatchableRequisitions());
}

export async function fetchDispatchFormOptions() {
  return unwrap(listDispatchFormOptions());
}
