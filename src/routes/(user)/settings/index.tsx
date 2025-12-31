import {
  AccountSettingsCards,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="py-4 w-full max-w-3xl space-y-4 md:space-y-6 mx-auto">
      <AccountSettingsCards />
      <SecuritySettingsCards />
    </div>
  );
}
