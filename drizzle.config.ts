import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "file:./data/site.db";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
    ...(databaseUrl.startsWith("file:") || !process.env.DATABASE_AUTH_TOKEN
      ? {}
      : { authToken: process.env.DATABASE_AUTH_TOKEN }),
  },
});
