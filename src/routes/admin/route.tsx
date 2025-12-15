import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShellProgressBar } from "@/components/spa/shell-progress-bar";
import { ProgressProvider } from "@bprogress/react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  ssr: "data-only",
});

function AdminLayout() {
  return (
    <ProgressProvider
      color="gray"
      delay={125}
      startPosition={0.25}
      options={{ showSpinner: false }}
    >
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
        <ShellProgressBar />
      </SidebarProvider>
    </ProgressProvider>
  );
}
