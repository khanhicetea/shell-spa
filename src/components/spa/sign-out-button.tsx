import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/auth/auth-client";

export function SignOutButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <Button
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onResponse: async () => {
              // manually set to null to avoid unnecessary refetching
              queryClient.clear();
              navigate({ to: "/login" });
            },
          },
        });
      }}
      type="button"
      className="w-fit"
      variant="destructive"
      size="lg"
    >
      Sign out
    </Button>
  );
}
