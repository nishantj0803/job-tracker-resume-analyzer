import { z } from "zod";

/**
 * Centralized environment validation.
 * Fails fast at boot with a clear message instead of
 * cryptic runtime errors deep in Mongo/Gemini calls.
 */
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").optional(),
  MONGODB_DB_NAME: z.string().default("jobtrackr_db"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  PYTHON_BACKEND_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    PYTHON_BACKEND_URL: process.env.PYTHON_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    // Don't throw during build when env isn't available yet;
    // routes/actions validate at request time instead.
    console.warn(
      "Environment validation warnings:",
      parsed.error.flatten().fieldErrors
    );
    return {
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "jobtrackr_db",
      NODE_ENV:
        (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
    } as Env;
  }

  return parsed.data;
}

export const env = loadEnv();

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Missing required environment variable: ${String(key)}. See .env.example.`
    );
  }
  return value as NonNullable<Env[K]>;
}
