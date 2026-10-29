import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URI: z.string().min(1).optional(),
  PAYLOAD_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),
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
