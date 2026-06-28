import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { sessionHasFarmerReadPermission } from "@/lib/schemas/farmer/auth";

export default async function FarmerFamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/signin");
  }

  const canAccess = await sessionHasFarmerReadPermission(session);
  if (!canAccess) {
    redirect("/");
  }

  return <div className="min-w-0">{children}</div>;
}
