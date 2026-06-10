import { varietyLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";

export default function VarietiesPage() {
  return <LookupSection config={varietyLookupConfig} />;
}
