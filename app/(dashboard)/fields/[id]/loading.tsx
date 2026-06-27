import { Skeleton } from "@/components/ui/skeleton";

export default function FieldDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-96 rounded-4xl" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 rounded-4xl" />
          <Skeleton className="h-64 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}
