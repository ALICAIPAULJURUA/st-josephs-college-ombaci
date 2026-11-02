import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_AUTH_TOKEN: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  STORAGE_DRIVER: z.enum(["local", "cloudinary"]).default("local"),
  APPLICATION_PRIVATE_STORAGE_DIR: z.string().min(1).optional(),
  SEED_ADMIN_EMAIL: z
    .union([z.literal(""), z.email()])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  SEED_ADMIN_PASSWORD: z
    .union([z.literal(""), z.string().min(12)])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPEN_ROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  ADMISSIONS_EMAIL: z.string().min(1).optional(),
  EMAIL_API_KEY: z.string().min(1).optional(),
  PLAUSIBLE_DOMAIN: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(
  input: Record<string, string | undefined> = process.env,
): Env {
  return envSchema.parse(input);
}
