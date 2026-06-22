import type { RequisitionDispatchAssignment } from "@/app/actions/requisition/requisitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate, parseDateOnly } from "@/lib/date";
import Link from "next/link";

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>
              <Link href={`/dispatch/${dispatch.id}`} className="hover:underline">
                Dispatch {formatDate(dispatch.dispatchDate)}
              </Link>
            </CardTitle>
            <CardDescription>{formatRoute(assignment)}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={dispatch.status === "CLOSED" ? "default" : "outline"}>
              {dispatch.status === "CLOSED" ? "Closed" : "Open"}
            </Badge>
            {assignment.lot ? (
              <Badge
                variant={
                  assignment.lot.status === "RECEIVED" ? "default" : "outline"
                }
              >
                {assignment.lot.status === "RECEIVED"
                  ? "Received"
                  : "Receipt pending"}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Closed on</dt>
            <dd>{formatDate(dispatch.dateOfReceiving)}</dd>
          </div>
          {assignment.lot?.receivedAt ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Farmer received on</dt>
              <dd>{formatDisplayDate(assignment.lot.receivedAt)}</dd>
            </div>
          ) : null}
          {assignment.lot?.receivedBy ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Received by</dt>
              <dd>{assignment.lot.receivedBy.name}</dd>
            </div>
          ) : null}
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
                  <TableHead>Generation</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignment.sizeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.generation.name}</TableCell>
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
