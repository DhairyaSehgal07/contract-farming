import { getServerSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-medium">
        Welcome, {session?.user.name}
      </h1>
      <p className="text-muted-foreground">
        Your dashboard is ready. More modules will be added here.
      </p>
    </div>
  );
}
