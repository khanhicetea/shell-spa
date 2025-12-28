# Common Commands

## Development

- `pnpm dev`: Start development server (Port 3000)
- `pnpm ui add [shadcn-component]`: Add Shadcn UI component
- `pnpm run check`: Run linting, formatting, and type checking sequentially

## Database (Kysely)

- `pnpm run db:migrate [command]`: Run Kysely migrations
  - `up`: Run the next migration that has not yet been run
  - `down`: Undo the last/specified migration that was run
  - `latest`: Update the database schema to the latest version
  - `list`: List both completed and pending migrations
  - `make [name]`: Create a new migration file
  - `rollback`: Rollback all the completed migrations

## Authentication (Better Auth)

- `pnpm run auth:secret`: Generate a new authentication secret
- `pnpm run auth:generate`: Generate authentication client code based on the config

## Dependency Management

- `pnpm run deps`: Update dependencies interactively (minor/patch)
- `pnpm run deps:major`: Update dependencies interactively (including major versions)

## Testing & Quality

- `pnpm lint`: Run Biome linting
- `pnpm format`: Run Biome formatting
- `pnpm check-types`: Run TypeScript type checking
- `pnpm test`: Run tests (if configured)
