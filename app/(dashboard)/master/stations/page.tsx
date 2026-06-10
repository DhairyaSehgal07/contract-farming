import { Suspense } from "react";
import { StationsSection } from "@/components/master/stations/stations-section";
import { StationsSectionSkeleton } from "@/components/master/stations/stations-section-skeleton";

export default function StationsPage() {
  return (
    <Suspense fallback={<StationsSectionSkeleton />}>
      <StationsSection />
    </Suspense>
  );
}
