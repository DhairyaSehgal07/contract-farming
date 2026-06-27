import { MasterSectionSkeleton } from "@/components/master/master-section-skeleton";

export default function FamiliesLoading() {
  return (
    <MasterSectionSkeleton
      columnCount={6}
      rowCount={6}
      ariaLabel="Loading families"
    />
  );
}
