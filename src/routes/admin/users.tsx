import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import { MoreHorizontal, PlusCircle, Trash2Icon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { DataTablePagination } from "@/components/data-table/pagination";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import authClient from "@/lib/auth/auth-client";
import type { Outputs } from "@/rpc/types";

export type User = Outputs["user"]["listUsers"]["users"][number];

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "banned",
    header: "Banned",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("banned") ? "Yes" : "No"}</div>
    ),
  },
];

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  validateSearch: z.object({
    page: z.number().int().positive().catch(1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps, context }) => {
    const data = await context.rpcClient.user.listUsers({ page: deps.page });

    return {
      ...data,
      page: deps.page,
    };
  },
});

function UsersPage() {
  const {
    users,
    pageCount,
    pageSize,
    totalCount,
    page: currentPage,
  } = Route.useLoaderData();
  const [rowSelection, setRowSelection] = React.useState({});
  const navigate = Route.useNavigate();
  const router = useRouter();
  const [bannedUser, setBannedUser] = React.useState<User | null>(null);

  const actionsColumns: ColumnDef<User>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-row space-x-4 justify-end">
            {user.banned ? (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const res = await authClient.admin.unbanUser({ userId: user.id });
                  if (res.error === null) {
                    router.invalidate();
                    toast.success(`User ${user.email} has been unbanned`);
                  }
                }}
              >
                Unban
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBannedUser(user);
                }}
              >
                Ban
              </Button>
            )}
            <Button variant="destructive" size="sm">
              <Trash2Icon />
            </Button>
          </div>
        );
      },
    },
  ];

  const tableColumns = [...columns, ...actionsColumns];

  const table = useReactTable({
    data: users || [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <div className="space-y-4 py-4">
      <Card className="gap-4">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </div>
          <CreateUserForm
            trigger={
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            }
            onSuccess={() => {
              router.invalidate();
            }}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            currentPage={currentPage}
            pageCount={pageCount}
            totalCount={totalCount}
            pageSize={pageSize}
            itemsCount={users.length}
            onPageChange={(page) => navigate({ search: { page } })}
          />
        </CardContent>
      </Card>
      {bannedUser && (
        <BanUserForm
          key={bannedUser.id}
          user={bannedUser}
          onOpenChange={(v) => v || setBannedUser(null)}
          onSuccess={() => {
            router.invalidate();
          }}
        ></BanUserForm>
      )}
    </div>
  );
}

function BanUserForm({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: User;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const form = useForm<{ banReason: string; banExpire: string | undefined }>({
    defaultValues: {
      banReason: "",
      banExpire: undefined,
    },
  });

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banning user '{user.email}'</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              const res = await authClient.admin.banUser({
                userId: user.id,
                banReason: data.banReason,
                banExpiresIn: data.banExpire
                  ? Math.floor(
                      (new Date(`${data.banExpire}:00`).getTime() - Date.now()) / 1000,
                    )
                  : undefined,
              });

              if (res.error === null) {
                onOpenChange(false);
                onSuccess();
              }
            })}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="banReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ban Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ban reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="banExpire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ban Expiration</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" variant="destructive">
                  Ban User
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserForm({
  trigger,
  onSuccess,
}: {
  trigger: React.ReactNode;
  onSuccess: (user: UserWithRole) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "user",
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              const res = await authClient.admin.createUser({
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role as "user" | "admin",
              });

              if (res.error === null) {
                setOpen(false);
                onSuccess(res.data.user);
              }
            })}
          >
            <SheetHeader>
              <SheetTitle>Create new user</SheetTitle>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
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
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User role</FormLabel>
                    <FormControl>
                      <NativeSelect onChange={field.onChange} value={field.value}>
                        <NativeSelectOption value="user">User</NativeSelectOption>
                        <NativeSelectOption value="admin">Admin</NativeSelectOption>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="flex flex-row justify-end">
              <Button type="submit">
                {form.formState.isSubmitting ? "Saving ..." : "Save"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
