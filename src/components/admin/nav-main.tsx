import { Link } from "@tanstack/react-router";
import { LayoutDashboard, type LucideIcon, SettingsIcon, UsersIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain() {
  const items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[] = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UsersIcon,
    },
    {
      title: "Settings",
      url: "/auth/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={item.title} asChild>
              <Link
                viewTransition
                to={item.url}
                activeProps={{
                  "data-active": "true",
                }}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
