import { getFieldDetail } from "@/app/actions/field/field-activities";

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

export async function fetchFieldDetail(id: string) {
  return unwrap(getFieldDetail(id));
}
