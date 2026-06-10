import { MasterTabs } from "@/components/master/master-tabs";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium">Master data</h1>
        <p className="text-muted-foreground">
          Manage stations, farmers, and product reference data.
        </p>
      </div>
      <MasterTabs />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
