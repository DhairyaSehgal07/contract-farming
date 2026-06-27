import { MasterSectionSkeleton } from "@/components/master/master-section-skeleton";

export default function FarmersLoading() {
  return (
    <MasterSectionSkeleton
      columnCount={6}
      rowCount={6}
      ariaLabel="Loading farmers"
    />
  );
}
