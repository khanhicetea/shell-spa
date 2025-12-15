import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleFormError } from "@/lib/helpers/form";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(user)/app/hello-form")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const formHello = useMutation(
    orpc.form.hello.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => handleFormError(error, form.setError),
    }),
  );

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto p-4 rounded-lg shadow-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              await formHello.mutateAsync(data);
            })}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
