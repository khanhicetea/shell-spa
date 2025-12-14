import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import authClient from "@/lib/auth/auth-client";
import { authQueryOptions } from "@/lib/queries";

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
  const navigate = useNavigate();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(href) => {
        navigate({ to: href });
      }}
      Link={NavLink}
    >
      <Outlet />
    </AuthUIProvider>
  );
}

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
