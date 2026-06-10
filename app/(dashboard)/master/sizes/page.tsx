import { sizeLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";

export default function SizesPage() {
  return <LookupSection config={sizeLookupConfig} />;
}
