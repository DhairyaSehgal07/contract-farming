import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MasterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium">Master</h1>
        <p className="text-muted-foreground">
          Master data modules will be added here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Farmers, lands, stations, and other reference data will live in this
            section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to switch between Dashboard and Master as new
            modules are introduced.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
