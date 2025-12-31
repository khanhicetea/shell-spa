import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import authClient from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { MoveLeftIcon } from "lucide-react";

export const Route = createFileRoute("/(user)/settings")({
  component: RouteComponent,
});

function NavLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(href) => {
        navigate({ to: href });
      }}
      Link={NavLink}
    >
      <div className="flex flex-col">
        <div className="absolute top-0 left-0 bg-secondary">
          <Button variant="ghost" asChild>
            <Link to="/app" className="block p-2">
              <MoveLeftIcon />
              Back to App
            </Link>
          </Button>
        </div>
        <Outlet />
      </div>
    </AuthUIProvider>
  );
}
