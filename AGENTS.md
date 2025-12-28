# LLM Rules and Context

## Project Overview

This is a minimal project implementing the Shell SPA pattern, which balances SSR and SPA for optimal UX and DX. The project uses TanStack Start, React 19, oRPC, and other modern technologies.

For detailed architecture, see [Shell SPA Architecture](docs/shell-spa-architecture.md).

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

## Essential Rules

### Code Style & Security

- Follow existing code conventions and patterns.
- Use TypeScript for type safety.
- **NEVER** expose or log secrets and keys.
- **NEVER** commit secrets or keys to the repository.
- Follow [Development Guides](docs/development-guides.md) for implementation details.

### Testing

- NO TESTING IF NO MENTIONED TESTING.
- Run lint and typecheck after finish requested task for confirmation.

### Data & Database

- All server data operations must go through the RPC layer.
- Use the Repository pattern for all DB operations. See [Database & Repository](docs/database-repository.md).
- **NO OPTIMISTIC UPDATES**: Use pessimistic updates or concurrent-safe strategies.

## Documentation References

- [Common Commands](docs/commands.md)
- [Shell SPA Architecture](docs/shell-spa-architecture.md)
- [TanStack Start Routing](docs/tanstack-start.md)
- [Database & Repository Pattern](docs/database-repository.md)
- [Development Guides & UI/UX](docs/development-guides.md)

## Learning Resources

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [oRPC Documentation](https://orpc.dev/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Kysely Docs](https://kysely.dev/)
