import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { SignOutButton } from "@/components/spa/sign-out-button";
import { ThemeToggle } from "@/components/spa/theme-toggle";
import { Button } from "@/components/ui/button";
import { authQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Shell SPA</h1>
        <p className="text-muted-foreground max-w-md">
          A minimal starter with SSR shell for auth and SPA for everything else
        </p>
        <Button type="button" asChild className="w-fit" size="lg">
          <Link to="/app/hello-form">Go to Hello Form</Link>
        </Button>
      </div>

      <Suspense fallback={<div className="py-6">Loading user...</div>}>
        <UserAction />
      </Suspense>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </div>
  );
}

function UserAction() {
  const { data: user } = useSuspenseQuery(authQueryOptions());

  return user ? (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">Welcome back, {user.name}!</p>
      <Button type="button" asChild className="w-fit" size="lg">
        <Link to="/app">Go to App Home</Link>
      </Button>
      <SignOutButton />
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">You are not signed in.</p>
      <Button type="button" asChild className="w-fit" size="lg">
        <Link to="/login">Log in</Link>
      </Button>
    </div>
  );
}
