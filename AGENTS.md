# LLM Rules and Context

## Project Overview

This is a minimal project implementing the Shell SPA pattern, which balances SSR and SPA for optimal UX and DX. The project uses TanStack Start, React 19, oRPC, and other modern technologies.

## Key Concepts

### Shell SPA Pattern
- **SSR (Server-Side Rendered)**: Authentication, app settings, user preferences, minimal shell UI
- **SPA (Single Page Application)**: Routing, data fetching, state management, UI rendering

### Core Technologies
- **TanStack Start**: Full-stack React framework
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Server state management
- **oRPC**: Type-safe RPC for API (oRPC, not tRPC so don't make mistakes here), if you need more example about oRPC, read section "RPC Handlers"
- **Better Auth**: Modern authentication
- **Drizzle ORM**: Type-safe SQL queries
- **shadcn/ui**: Accessible component library

## Project Structure

```
shell-spa/
├── src/
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Core utilities
│   │   ├── auth/            # Authentication setup
│   │   ├── db/              # Database configuration
│   │   └── orpc.ts          # RPC client setup
│   ├── routes/             # File-based routing
│   │   ├── (auth)/          # Public auth pages
│   │   ├── (user)/          # Protected routes
│   │   ├── (test)/          # Test routes
│   │   ├── api/             # API endpoints
│   │   └── __root.tsx       # Shell implementation
│   └── rpc/                # RPC procedures
├── public/                 # Static assets
└── drizzle/                # Database migrations
```

## Important Files

### Shell Implementation
- `src/routes/__root.tsx`: Core shell pattern implementation
- `src/rpc/handlers/app.ts`: Shell data structure definition
- `src/lib/queries.ts`: Query options for shell data

### Authentication
- `src/lib/auth/`: Authentication setup and middleware
- `src/routes/(auth)/`: Login and signup pages
- `src/routes/(user)/route.tsx`: Protected route handling

### RPC Procedures
- `src/rpc/`: RPC handlers and router configuration
- `src/lib/orpc.ts`: RPC client setup

## Development Rules

### Code Style
- Follow existing code conventions and patterns
- Use TypeScript for type safety
- Follow the project's existing naming conventions
- Use the existing libraries and utilities

### Security
- Never expose or log secrets and keys
- Never commit secrets or keys to the repository
- Follow security best practices

### Testing
- NO TESTING IF NO MENTIONED TESTING
- Run lint and typecheck after finish requested task for confirmation

## Common Commands

### Development
- `pnpm dev`: Start development server
- `pnpm ui add [shadcn-component]`: Add Shadcn UI component

### Testing
- `pnpm lint`: Run linting
- `pnpm check-types`: Run type checking
- `pnpm test`: Run tests (if configured)

## Additional Context

### Shell Pattern
The shell pattern is implemented in `src/routes/__root.tsx` with the following key aspects:
- Shell data is fetched via RPC and cached with React Query
- User data is prefetched but not awaited, allowing the client to handle it
- The shell data structure includes app settings and user information

### Authentication Flow
1. User request hits the root route
2. Shell data is SSR'd
3. User data is prefetched non-blocking
4. Shell is rendered
5. Client hydration occurs
6. SPA takes over

### Protected Routes

Protected routes (user role) are handled in `src/routes/(user)/route.tsx` with:
- User validation via React Query
- Redirect to login if user is not authenticated
- Type-safe user data passed to child routes

Protected admin routes (admin role) are handled in `src/routes/admin/route.tsx` with:
- Admin validation via React Query

## Customization

### Add New Pages
- **Public Page**: Add to `src/routes/`
- **Admin Page**: Add to `src/routes/admin/`
- **Protected Page**: Add to `src/routes/(user)/`
- **Protected User App Page**: Add to `src/routes/(user)/app/`

### Add New RPC Procedures
1. Create procedure in `src/rpc/`
2. Add to router in `src/rpc/router.ts`
3. Use in route loader, beforeLoad via `context.rpcClient`
3. Use in component via `useQuery(orpc.[route].[action].queryOptions(...))` and  `useMutation(orpc.[route].[action].mutationOptions(...))`

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

### Database Schema
Drizzle ORM schemas are defined in `src/lib/db/schema/`:
- `auth.schema.ts`: Contains user authentication tables (users, sessions, accounts, verification)
- `[feature].schema.ts`: Contains feature-related tables (all tables related to [feature]), if belongs to user schema, read `auth.schema.ts` first for user-related tables
- Tables include proper relationships and indexes for optimal performance
- Schema exports are centralized in `index.ts` for easy imports
- I will run db migrations task manually, just ask me to run it and wait me for continue.

### RPC Handlers
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

### Data Management
All server data operations should go through the RPC layer for centralized management:
- **Data Fetching**: Use RPC procedures for all server data retrieval
- **Queries**: Implement query logic in RPC handlers
- **Forms**: Handle form submissions via RPC mutations
- **Mutations**: Centralize all data modifications in RPC procedures
- **NO OPTIMISTIC UPDATES**: Don't use optimistic updates as a anti-pattern, as it can lead to inconsistencies and bugs. Instead, use pessimistic updates or implement a more robust optimistic update strategy (support concurrent updates)
- This ensures type safety, consistent error handling, and maintainable code structure

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

### New feature implementation
- Plan first, ask first, implement later
- Draft the db schema changes before implementing the feature, asking for confirmation
- The plan orders : DB schema > RPC handlers > Page route > UI > Check types > DONE
- Co-locate the sub components in the same file as page route (put in below the main page route component) if it only use once in page route
- Only use pagination if I mentions
- **ITEM** : Each item should be rendered in a separate component so it mutation can be done independently, its status is managed by the component itself
- App user feature, add link into `src/components/app/app-sidebar.tsx`
- Admin feature, add link into `src/components/admin/admin-sidebar.tsx`

### UI and UX
- Using shadcn UI components, tailwind css v4
- Using shadcn theme color variables like primary, secondary, muted, accent, etc. No specific color should be used directly without asking.
- UI should be responsive, compact and nice
- Buttons should has icon from Lucide icons, if icon can common for its purpose, skip text label
- Form field should has label, error message, vertical first with "space-y-4"
- For CRUD, if form action is simple, use `Sheet` for adding/editing or `Dialog` component for deleting, confirmation.
- Table should use Tanstack Table using columns def. No sorting, no column visibility, row actions is last column within 'justify-end'
- Empty state, use shadcn Empty component in `src/components/ui/empty.tsx`

### Environment Configuration
Type-safe environment variables are configured in `src/env/`:
- `client.ts`: Client-side environment variables with `VITE_` prefix
- `server.ts`: Server-side environment variables with Zod validation
- Both use `@t3-oss/env-core` for type safety and runtime validation
- Client variables are prefixed with `VITE_` for security

## Performance Optimizations

- **React Query Caching**: 2-minute stale time reduces server calls
- **Auth Cookie Cache**: 5-minute server-side cache reduces DB queries
- **Intent-based Preloading**: Faster navigation
- **React Compiler**: Automatic memoization, so no need manually useCallback, useMemo, memo things.
- **SSR-Query Integration**: Optimal data fetching

## Learning Resources

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [oRPC Documentation](https://orpc.dev/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
