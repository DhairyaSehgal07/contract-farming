import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-4" action={signInAction}>
        <Input type="email" name="email" placeholder="Email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <Button type="submit">Sign In</Button>
      </form>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
