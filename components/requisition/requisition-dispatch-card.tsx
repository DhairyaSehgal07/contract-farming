import type { RequisitionDispatchAssignment } from "@/app/actions/requisition/requisitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseDateOnly } from "@/lib/date";

function formatDate(value: string | null) {
  if (!value) return "—";
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDecimal(value: string | null) {
  return value ?? "—";
}

function formatRoute(assignment: RequisitionDispatchAssignment) {
  const from = assignment.dispatch.location?.name ?? "—";
  const to = assignment.dispatch.toLocation ?? "—";
  return `${from} → ${to}`;
}

function totalQuantity(assignment: RequisitionDispatchAssignment) {
  const total = assignment.sizeLines.reduce(
    (sum, line) => sum + Number.parseFloat(line.quantity),
    0,
  );
  return total.toString();
}

type RequisitionDispatchCardProps = {
  assignment: RequisitionDispatchAssignment;
};

export function RequisitionDispatchCard({
  assignment,
}: RequisitionDispatchCardProps) {
  const { dispatch } = assignment;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          Dispatch {formatDate(dispatch.dispatchDate)}
        </CardTitle>
        <CardDescription>{formatRoute(assignment)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Receiving date</dt>
            <dd>{formatDate(dispatch.dateOfReceiving)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Generation</dt>
            <dd>{dispatch.generation?.name ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Truck number</dt>
            <dd>{dispatch.truckNumber ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Gate pass</dt>
            <dd>{dispatch.manualGatePassNumber ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Weight slip</dt>
            <dd>{dispatch.weightSlipNumber ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Net weight</dt>
            <dd>{formatDecimal(dispatch.netWeight)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Driver mobile</dt>
            <dd>{dispatch.driverMobileNumber ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Total quantity</dt>
            <dd>{totalQuantity(assignment)}</dd>
          </div>
        </dl>

        {assignment.sizeLines.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Size breakdown</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignment.sizeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.size.name}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {dispatch.remarks ? (
          <div className="flex flex-col gap-0.5">
            <p className="text-muted-foreground">Remarks</p>
            <p>{dispatch.remarks}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
