import { Link } from "@tanstack/react-router";
import { HandFist, ListTodoIcon, type LucideIcon, SettingsIcon } from "lucide-react";
import {
  SidebarGroup,
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
      title: "Hello",
      url: "/app/hello-form",
      icon: HandFist,
    },
    {
      title: "Todo Kanboard",
      url: "/app/todo",
      icon: ListTodoIcon,
    },
    {
      title: "Settings",
      url: "/auth/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={item.title} asChild>
              <Link
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
