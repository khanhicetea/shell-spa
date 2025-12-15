import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { authQueryOptions } from "@/lib/queries";
import { ShellProgressBar } from "@/components/spa/shell-progress-bar";

export const Route = createFileRoute("/(user)")({
  component: UserLayout,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });

    if (!user) {
      throw redirect({ to: "/login" });
    }

    // re-return to update type as non-null for child routes
    return { user };
  },
  ssr: "data-only",
});

function UserLayout() {
  return (
    <>
      <Outlet />
      <ShellProgressBar />
    </>
  );
}
