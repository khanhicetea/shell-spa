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
- **Kysely**: Type-safe SQL query builder
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
└── kysely/                # Database migrations
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

### Database Schema

Kysely uses TypeScript interfaces for type-safe database queries. Schema definitions are organized in `src/lib/db/schema/`:

- `schema/auth.ts`: Contains authentication table interfaces (user, session, account, verification)
- `schema/todo.ts`: Contains feature-related table interfaces (todoCategory, todoItem)
- `schema/index.ts`: Central Database interface that aggregates all table interfaces
- Each schema file exports:
  - `Table` interface (e.g., `UserTable`)
  - `Selectable` type (e.g., `User`) - for query results
  - `Insertable` type (e.g., `UserInsert`) - for insert operations
  - `Updateable` type (e.g., `UserUpdate`) - for update operations

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

All server data operations should go through RPC layer for centralized management:

- **Data Fetching**: Use RPC procedures for all server data retrieval
- **Queries**: Implement query logic in RPC handlers
- **Forms**: Handle form submissions via RPC mutations
- **Mutations**: Centralize all data modifications in RPC procedures
- **NO OPTIMISTIC UPDATES**: Don't use optimistic updates as a anti-pattern, as it can lead to inconsistencies and bugs. Instead, use pessimistic updates or implement a more robust optimistic update strategy (support concurrent updates)
- This ensures type safety, consistent error handling, and maintainable code structure

### Repository Pattern

The project uses a repository pattern for database operations to provide a clean, type-safe abstraction over Kysely queries. Repositories are located in `src/lib/db/repositories/`:

**Structure:**

```
src/lib/db/repositories/
├── base.ts              # BaseRepository interface and Repository class
├── index.ts             # Exports all repos and createRepos factory
├── user.repo.ts         # UserRepository
└── [model].repo.ts     # TodoItemRepository
```

**Available Repositories:**

- `repos.user`: User table operations
- `repos.[model]`: Model table operations

**BaseRepository Methods:**

- `find<T>(conditions?)` - Find multiple records
- `findSelect<T, K>(columns, conditions?)` - Find records with specific columns only
- `findById(id)` - Find record by ID
- `findByIdOrFail(id)` - Find record by ID or throw `NotFoundError`
- `findOne<T>(conditions)` - Find single record matching conditions
- `findOneOrFail<T>(conditions)` - Find single record or throw `NotFoundError`
- `findAll()` - Get all records
- `findPaginated(page, pageSize, conditions?)` - Paginated results with metadata (properly applies limit/offset)
- `count<T>(conditions?)` - Count records
- `exists(id)` - Check if record exists by ID (optimized with SELECT 1 LIMIT 1)
- `existsBy<T>(conditions)` - Check if any record matches conditions (optimized)
- `deleteById(id)` - Delete by ID
- `deleteMany<T>(conditions)` - Delete multiple records
- `updateById(id, data)` - Update record by ID
- `updateMany<T>(conditions, data)` - Update multiple records
- `insertReturn(data)` - Insert single record and return it
- `insertMany(data[])` - Insert multiple records and return them
- `upsert(data, conflictColumns, updateData?)` - Insert or update on conflict

**Query Conditions:**
Repositories support two types of conditions:

1. **Simple object conditions** (partial matches):

```typescript
// Simple equality conditions
const users = await repos.user.find({ email: "test@test.com", role: "admin" });
const todos = await repos.todoItem.find({ userId: "user-id", completed: null });
```

2. **Query builder function** (complex queries with full type inference):

```typescript
// Complex conditions with full Kysely API
const users = await repos.user.find((qb) =>
  qb
    .where("email", "=", "test@test.com")
    .where("role", "=", "admin")
    .orderBy("createdAt", "desc")
    .limit(10),
);

// Paginated with ordering
const result = await repos.user.findPaginated(page, pageSize, (qb) =>
  qb.orderBy("createdAt", "desc"),
);
```

**Usage in RPC Handlers:**

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

export const getUserById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    return (await repos.user.findById(input.id)) ?? null;
  });

export const deleteUser = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    await repos.user.deleteById(input.id);
    return { success: true };
  });
```

**Creating New Repositories:**

1. Create new file in `src/lib/db/repositories/[name].repo.ts`
2. Extend Repository base class with table name
3. Add domain-specific methods (only if complex/reusable)
4. Register in `createRepos()` factory in `index.ts`

**Repository Design Guidelines:**

- **DON'T** create simple one-line wrapper methods like `findByUser`, `findByCategoryId` in concrete repositories
- **DON'T** pollute repositories with methods that just call **BaseRepository Methods** with simple arguments
- **DON'T** put methods in UserRepository. If the main subject is Product - put them in ProductRepository
- **DO** only create methods in repositories when:
  - Implementation is more than 3 lines of logic
  - Logic is complex or involves multiple operations
  - OR Logic is reused in multiple places

**Cross-Repository Access:**

Repositories can access other repositories via `this.repos` for complex operations that span multiple tables:

````typescript
// src/lib/db/repositories/order.repo.ts
export class OrderRepository extends Repository<"order"> {
  async createOrderWithItems(
    orderData: OrderInsert,
    items: OrderItemInsert[],
  ) {
    // Access other repositories via this.repos
    const order = await this.insertReturn(orderData);
    if (!order) throw new Error("Failed to create order");

    // Use another repository
    const orderItems = await (this.repos.orderItem as OrderItemRepository)
      .insertMany(items.map((item) => ({ ...item, orderId: order.id })));

    return { order, orderItems };
  }
}

**Bad Example (don't do this):**

```typescript
// src/lib/db/repositories/todoItem.repo.ts
export class TodoItemRepository extends Repository<"todoItem"> {
  async findByUserId(userId: string) {
    return this.find({ userId }); // Too simple, just use find directly
  }

  async findByCategoryId(categoryId: string) {
    return this.find({ categoryId }); // Too simple, just use find directly
  }
}

// Usage - just use find directly instead
const todos = await repos.todoItem.find({ userId: "123" });
````

**Good Example (do this):**

```typescript
// src/lib/db/repositories/product.repo.ts
import type { DB } from "../init";
import { Repository } from "./base";

export class ProductRepository extends Repository<"product"> {
  async searchByKeyword(keyword: string) {
    return this.find((qb) =>
      qb
        .where("name", "ilike", `%${keyword}%`)
        .orWhere("description", "ilike", `%${keyword}%`)
        .orderBy("popularity", "desc")
        .limit(50),
    );
  }

  async findAvailableProducts(filters: ProductFilters) {
    // Complex logic worth extracting
    return this.find((qb) => {
      let query = qb.where("stock", ">", 0);
      if (filters.minPrice) {
        query = query.where("price", ">=", filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.where("price", "<=", filters.maxPrice);
      }
      return query.orderBy("createdAt", "desc");
    });
  }
}
```

Then register in `index.ts`:

```typescript
import { ProductRepository } from "./product.repo";

export function createRepos(db: DB) {
  return {
    user: new UserRepository(db),
    todoCategory: new TodoCategoryRepository(db),
    todoItem: new TodoItemRepository(db),
    product: new ProductRepository(db), // Add new repo
  };
}
```

**Using Repositories Correctly:**

```typescript
// ✅ Good - use base methods directly for simple queries
const todos = await repos.todoItem.find({ userId: "123" });
const user = await repos.user.findById("456");
const category = await repos.todoCategory.findOne({ name: "Work" });

// ✅ Good - use query builder for complex conditions
const recentTodos = await repos.todoItem.find((qb) =>
  qb
    .where("userId", "=", "123")
    .where("createdAt", ">", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .orderBy("createdAt", "desc"),
);

// ✅ Good - use custom method for reusable complex logic
const availableProducts = await repos.product.findAvailableProducts({
  minPrice: 10,
  maxPrice: 100,
});

// ✅ Good - use findSelect for fetching specific columns only
const userIds = await repos.user.findSelect(["id", "email"], { role: "admin" });

// ✅ Good - use findByIdOrFail/findOneOrFail when record must exist
import { NotFoundError } from "~/lib/db/repositories";

try {
  const user = await repos.user.findByIdOrFail(userId);
  const admin = await repos.user.findOneOrFail({ role: "admin" });
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found - return 404, show error, etc.
  }
}

// ✅ Good - use upsert for insert-or-update operations
const setting = await repos.userSetting.upsert(
  { userId: "123", key: "theme", value: "dark" },
  ["userId", "key"], // conflict columns
  { value: "dark" }, // optional: only update specific fields
);
```

**Repository Context Access:**
Repositories are available in RPC handlers via `context.repos`:

- `baseProcedure`, `authedProcedure`, `adminProcedure` all have access to `repos`
- Each repository is type-safe with full autocomplete
- All database operations should go through repositories, not direct Kysely queries

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
- [Kysely Docs](https://kysely.dev/)
