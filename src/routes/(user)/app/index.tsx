import { createFileRoute } from "@tanstack/react-router";
import { SignOutButton } from "@/components/app/sign-out-button";

export const Route = createFileRoute("/(user)/app/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your app</p>

      <div className="mt-4 text-center text-sm">
        <p className="font-medium">User Information:</p>
        <pre className="bg-card text-card-foreground mt-2 max-w-md overflow-x-auto rounded-md border p-3 text-start">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <SignOutButton />
    </div>
  );
}
