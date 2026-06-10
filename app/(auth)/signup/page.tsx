import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-4" action={signUpAction}>
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <Button type="submit">Sign Up</Button>
      </form>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-foreground underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
