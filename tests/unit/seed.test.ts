import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { homePageDefaults } from "@/content/defaults/home";
import { sampleMedia } from "@/content/defaults/sample-media";
import { settingsDefaults } from "@/content/defaults/site";
import {
  mergeMissingDefaults,
  parseSeedAdminConfig,
  seedContent,
  seedDevelopmentAdmin,
} from "@/db/seed";
import * as schema from "@/db/schema";

describe("database seed", () => {
  const clients: ReturnType<typeof createClient>[] = [];
  let database: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(async () => {
    const client = createClient({ url: "file::memory:" });
    clients.push(client);
    database = drizzle(client, { schema });
    await migrate(database, {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });
  });

  afterEach(async () => {
    await Promise.all(clients.splice(0).map((client) => client.close()));
  });

  it("seeds Settings and the published Home page without overwriting existing content", async () => {
    await seedContent(database, 1_800_000_000_000);

    const initialSettings = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "schoolName"));
    const initialWhatsApp = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "whatsappNumber"));
    const initialHome = await database
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.key, "home"));

    expect(initialSettings[0]?.value).toBe("St. Joseph's College, Ombaci");
    expect(initialWhatsApp[0]?.value).toBe("+256770911635");
    expect(initialHome[0]?.status).toBe("published");
    expect(initialHome[0]?.fields).toMatchObject({
      hero: homePageDefaults.hero,
    });
    expect(initialHome[0]?.fields).toHaveProperty(
      "panels.0.photo.src",
      `/uploads/${sampleMedia[0].id}.webp`,
    );
    expect(JSON.stringify(initialHome[0]?.fields)).not.toContain("sample:");

    const seededMedia = await database.select().from(schema.media);
    expect(seededMedia).toHaveLength(sampleMedia.length);
    expect(seededMedia.every((item) => item.isSample)).toBe(true);
    const imageSizes = await Promise.all(
      sampleMedia.map(
        async (sample) =>
          (await stat(resolve("public", "uploads", `${sample.id}.webp`))).size,
      ),
    );
    expect(imageSizes.every((size) => size < 300 * 1024)).toBe(true);

    const seededPages = await database.select().from(schema.pages);
    expect(seededPages.map((page) => page.key)).toContain("privacy");
    expect(seededPages.map((page) => page.key)).toContain("not-found");
    expect(
      JSON.stringify(
        seededPages.find((page) => page.key === "history")?.fields,
      ),
    ).not.toContain("1981");

    const timeline = await database
      .select()
      .from(schema.items)
      .where(eq(schema.items.collection, "timeline"));
    expect(timeline.map((item) => item.fields.year)).toEqual(["1943", "1960"]);

    const faqs = await database
      .select()
      .from(schema.items)
      .where(eq(schema.items.collection, "faqs"));
    expect(faqs).toHaveLength(13);

    const news = await database
      .select()
      .from(schema.items)
      .where(eq(schema.items.collection, "news"));
    expect(news).toHaveLength(3);
    expect(news.every((item) => item.status === "hidden")).toBe(true);

    await database
      .update(schema.settings)
      .set({ value: "Updated by an editor" })
      .where(eq(schema.settings.key, "schoolName"));
    await database
      .update(schema.settings)
      .set({ value: "[To be confirmed: official email address]" })
      .where(eq(schema.settings.key, "email"));
    await database
      .update(schema.settings)
      .set({ value: "" })
      .where(eq(schema.settings.key, "whatsappNumber"));
    await database
      .update(schema.settings)
      .set({ value: "Editor supplied office hours" })
      .where(eq(schema.settings.key, "officeHours"));
    await database
      .update(schema.settings)
      .set({ value: "+256 39 2001484", updatedBy: null })
      .where(eq(schema.settings.key, "phone"));
    await database
      .update(schema.pages)
      .set({
        fields: { hero: { title: "Keep this change" } },
        updatedAt: 42,
      })
      .where(eq(schema.pages.key, "home"));

    await seedContent(database, 1_900_000_000_000);

    const preservedSettings = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "schoolName"));
    const upgradedEmail = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "email"));
    const preservedOfficeHours = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "officeHours"));
    const seededWhatsApp = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "whatsappNumber"));
    const upgradedPhone = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "phone"));
    const preservedHome = await database
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.key, "home"));

    expect(preservedSettings[0]?.value).toBe("Updated by an editor");
    expect(upgradedEmail[0]?.value).toBe(settingsDefaults.email);
    expect(preservedOfficeHours[0]?.value).toBe("Editor supplied office hours");
    expect(seededWhatsApp[0]?.value).toBe("+256770911635");
    expect(upgradedPhone[0]?.value).toBe(settingsDefaults.phone);
    expect(preservedHome[0]?.fields).toMatchObject({
      hero: {
        title: "Keep this change",
        accent: homePageDefaults.hero.accent,
      },
    });
    expect(JSON.stringify(preservedHome[0]?.fields)).not.toContain("sample:");
    expect(preservedHome[0]?.updatedAt).toBe(42);
  }, 30_000);

  it("replaces only confirmation markers and known placeholders in saved content", () => {
    const merged = mergeMissingDefaults(
      {
        title: "Keep this editor copy",
        description:
          "The headmaster and the teachers who lead each department.",
        body: "Ask about [To be confirmed: current term dates and school calendar.]",
        facts: [],
        photo: {
          src: "",
          alt: "Photo coming soon",
          label: "Photo coming soon",
        },
      },
      {
        title: "Default title",
        description: "Learn through clearly labelled profile examples.",
        body: "Default body",
        facts: ["Sample detail"],
        photo: {
          src: "/uploads/sample-library.webp",
          alt: "Sample library photo",
          label: "Illustrative sample photo",
        },
      },
    );

    expect(merged).toMatchObject({
      title: "Keep this editor copy",
      description: "Learn through clearly labelled profile examples.",
      body: expect.stringContaining("SAMPLE ONLY"),
      facts: ["Sample detail"],
      photo: {
        src: "/uploads/sample-library.webp",
        alt: "Sample library photo",
        label: "Illustrative sample photo",
      },
    });
    expect(JSON.stringify(merged)).not.toContain("[To be confirmed:");
  });

  it("creates an argon2id development admin once and leaves existing credentials unchanged", async () => {
    const adminConfig = {
      email: " ADMIN@EXAMPLE.COM ",
      password: "A-long-development-password",
      nodeEnv: "development",
    };
    const credentials = parseSeedAdminConfig(adminConfig);

    expect(credentials?.email).toBe("admin@example.com");
    expect(await seedDevelopmentAdmin(database, adminConfig)).toBe("created");
    expect(await seedDevelopmentAdmin(database, adminConfig)).toBe(
      "already-exists",
    );

    const admins = await database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"));
    const admin = admins[0];

    expect(admins).toHaveLength(1);
    expect(admin?.role).toBe("admin");
    expect(admin?.passwordHash).not.toBe(credentials?.password);
    if (!admin || !credentials)
      throw new Error("The development admin was not seeded.");
    await expect(
      (await import("argon2")).default.verify(
        admin.passwordHash,
        credentials.password,
      ),
    ).resolves.toBe(true);
  });

  it("refuses production or incomplete development admin credentials", async () => {
    expect(() =>
      parseSeedAdminConfig({
        email: "admin@example.com",
        password: "A-long-development-password",
        nodeEnv: "production",
      }),
    ).toThrow(/cannot be used in production/);
    await expect(
      seedDevelopmentAdmin(database, {
        email: "admin@example.com",
        password: "A-long-development-password",
        nodeEnv: "production",
      }),
    ).rejects.toThrow(/cannot be used in production/);
    expect(() =>
      parseSeedAdminConfig({
        email: "admin@example.com",
        nodeEnv: "development",
      }),
    ).toThrow(/Set both/);
    expect(() =>
      parseSeedAdminConfig({
        email: "admin@example.com",
        password: "short",
        nodeEnv: "development",
      }),
    ).toThrow();
  });
});
