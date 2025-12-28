# Development Guides

## Data Management

All server data operations should go through RPC layer for centralized management:

- **Data Fetching**: Use RPC procedures for all server data retrieval
- **Queries**: Implement query logic in RPC handlers
- **Forms**: Handle form submissions via RPC mutations
- **Mutations**: Centralize all data modifications in RPC procedures
- **NO OPTIMISTIC UPDATES**: Don't use optimistic updates as a anti-pattern, as it can lead to inconsistencies and bugs. Instead, use pessimistic updates or implement a more robust optimistic update strategy (support concurrent updates)
- This ensures type safety, consistent error handling, and maintainable code structure

## RPC Procedures

### RPC Handlers Organization

RPC procedures are organized in `src/rpc/handlers/`:

- `app.ts`: Shell data and application-level procedures
- `form.ts`: Form handling procedures with Zod validation
- `user.ts`: User-related procedures
- Each handler uses `baseProcedure` for consistent context handling
- Procedures return type-safe responses for client consumption

### Authentication Procedures

The RPC system includes authentication middleware for protected procedures:

- `baseProcedure`: Base procedure with session context
- `publicProcedure`: Alias for baseProcedure (public access)
- `authedProcedure`: Protected procedure requiring valid session
- `adminProcedure`: Protected admin procedure requiring valid admin role session
- The `authMiddleware` validates session and extracts user data
- Use `authedProcedure` for routes requiring authentication
- Use `adminProcedure` for routes requiring admin role

### Usage in RPC Handlers (Example with Repository)

```typescript
export const listUsers = adminProcedure
  .input(z.object({ page: z.number().int().positive() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    const { page } = input;
    const pageSize = 10;

    const result = await repos.user.findPaginated(page, pageSize, (qb) =>
      qb.orderBy("createdAt", "desc"),
    );

    return {
      users: result.items,
      page,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
      pageCount: result.pageCount,
    };
  });
```

## Adding New Features/Components

### Add New Pages

- **Public Page**: Add to `src/routes/`
- **Admin Page**: Add to `src/routes/admin/`
- **Protected Page**: Add to `src/routes/(user)/`
- **Protected User App Page**: Add to `src/routes/(user)/app/`

### Add New RPC Procedures

1. Create procedure in `src/rpc/`
2. Add to router in `src/rpc/router.ts`
3. Use in route loader, beforeLoad via `context.rpcClient`
4. Use in component via `useQuery(orpc.[route].[action].queryOptions(...))` and `useMutation(orpc.[route].[action].mutationOptions(...))`

### Add New UI Components

```bash
pnpm ui add component-name
```

### Form Handling Example

The demo form at `src/routes/(test)/hello-form.tsx` shows how to:

- Create a form using `react-hook-form` and shadcn/ui components
- Use `useMutation` with oRPC for form submission
- Handle form errors with the `handleFormError` utility
- Display success messages with Sonner toast notifications

### Data Fetching Pattern (in page route)

- Use `useQuery` for fetching data
- Use `useMutation` for updating data
- Prefetch data in Route loader, then use same queryKey in Route component (can leverage orpc key utils)
- Keep simple by using refetch from useQuery, useSuspendQuery instead of invalidation by key in same component

**Example**

```ts
export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  validateSearch: z.object({
    page: z.number().int().positive().catch(1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps, context }) => {
    context.queryClient.prefetchQuery(
      orpc.user.listUsers.queryOptions({
        input: { page: deps.page },
      }), // same query options, same key
    );

    return { app: context.shell.app };
  },
});

function UsersPage() {
  const { app } = Route.useLoaderData(); // sample of use loader data from reading from context
  const page = Route.useSearch({ select: (s) => s.page as number }); // sample for reading in query params
  const {
    data: { users, pageCount, pageSize, totalCount },
    refetch: refetchUsers, // using refetch data on invalidation instead of invalidation by key in same component
  } = useSuspenseQuery(
    orpc.user.listUsers.queryOptions({
      input: { page },
    }), // same query options, same key
  );

  // render function below
}
```

### New feature implementation checklist

- Plan first, ask first, implement later
- Draft the db schema changes before implementing the feature, asking for confirmation
- The plan orders : DB schema > RPC handlers > Page route > UI > Check types > DONE
- Co-locate the sub components in the same file as page route (put in below the main page route component) if it only use once in page route
- Only use pagination if I mentions
- **ITEM** : Each item should be rendered in a separate component so it mutation can be done independently, its status is managed by the component itself
- App user feature, add link into `src/components/app/app-sidebar.tsx`
- Admin feature, add link into `src/components/admin/admin-sidebar.tsx`

## UI and UX Guidelines

- **Style**: Using shadcn UI components, tailwind css v4
- **Colors**: Using shadcn theme color variables like primary, secondary, muted, accent, etc. No specific color should be used directly without asking.
- **Responsiveness**: UI should be responsive, compact and nice
- **Icons**: Buttons should has icon from Lucide icons, if icon can common for its purpose, skip text label
- **Forms**: Form field should has label, error message, vertical first with "space-y-4"
- **CRUD**: If form action is simple, use `Sheet` for adding/editing or `Dialog` component for deleting, confirmation.
- **Tables**: Table should use Tanstack Table using columns def. No sorting, no column visibility, row actions is last column within 'justify-end'
- **Empty States**: Use shadcn Empty component in `src/components/ui/empty.tsx`
