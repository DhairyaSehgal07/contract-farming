import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="font-heading text-base font-medium">Contract Farming</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
