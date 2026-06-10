import { generationLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";

export default function GenerationsPage() {
  return <LookupSection config={generationLookupConfig} />;
}
