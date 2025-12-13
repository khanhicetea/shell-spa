import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    VITE_BASE_URL: z.url().default("http://localhost:3000"),
    BETTER_AUTH_SECRET: z.string().min(1),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),

    // OAuth2 providers, optional, update as needed
    // GITHUB_CLIENT_ID: z.string().optional(),
    // GITHUB_CLIENT_SECRET: z.string().optional(),
    // GOOGLE_CLIENT_ID: z.string().optional(),
    // GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Replicate API token, required
    REPLICATE_API_TOKEN: z.string().min(1),
    FAL_KEY: z.string().min(1),
    FAL_WEBHOOK_URL: z.string().optional(),
  },
  runtimeEnv: process.env,
});
