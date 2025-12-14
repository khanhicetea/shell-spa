import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(user)/app")({
  component: AppLayout,
  loader: async ({ context }) => {
    const { app, user } = context.shell;

    return { app, user };
  },
});

function AppLayout() {
  const { user } = Route.useLoaderData();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
