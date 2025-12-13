# Use Node.js 24 Slim image
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV=production

# Build the application
RUN BUILD_TARGET=node-server pnpm run build

# Production image
FROM node:24-slim as runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV HOST=0.0.0.0

# Copy built application
COPY --from=builder --chown=node:node /app/.output ./.output

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", ".output/server/index.mjs"]
