import { MasterSectionSkeleton } from "@/components/master/master-section-skeleton";

export default function FarmerFamilyDetailLoading() {
  return (
    <MasterSectionSkeleton
      columnCount={4}
      rowCount={4}
      ariaLabel="Loading family"
    />
  );
}
