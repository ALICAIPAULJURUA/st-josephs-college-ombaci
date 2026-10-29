import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Achievements } from "./collections/Achievements";
import { Albums } from "./collections/Albums";
import { Applications } from "./collections/Applications";
import { Enquiries } from "./collections/Enquiries";
import { Events } from "./collections/Events";
import { Facilities } from "./collections/Facilities";
import { FAQs } from "./collections/FAQs";
import { Media } from "./collections/Media";
import { News } from "./collections/News";
import { Notices } from "./collections/Notices";
import { OldBoys } from "./collections/OldBoys";
import { Pages } from "./collections/Pages";
import { Sports } from "./collections/Sports";
import { Staff } from "./collections/Staff";
import { Subjects } from "./collections/Subjects";
import { Timeline } from "./collections/Timeline";
import { Users } from "./collections/Users";
import { HomeNumbers } from "./globals/HomeNumbers";
import { HomePanels } from "./globals/HomePanels";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";
import { revalidateContent } from "./lib/revalidate";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const secret = process.env.PAYLOAD_SECRET;
if (!secret) {
  throw new Error("PAYLOAD_SECRET is required. Add it to .env.local.");
}

const serverURL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const database =
  process.env.PAYLOAD_DATABASE === "postgres"
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URI ?? "",
        },
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_DATABASE_URI ?? "file:./ombaci-dev.db",
        },
        push: true,
      });

export default buildConfig({
  secret,
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " | St. Joseph's College, Ombaci",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  db: database,
  editor: lexicalEditor(),
  collections: [
    Pages,
    News,
    Notices,
    Events,
    Staff,
    Facilities,
    Subjects,
    Sports,
    Achievements,
    OldBoys,
    Timeline,
    Albums,
    FAQs,
    Applications,
    Enquiries,
    Media,
    Users,
  ].map((collection) => ({
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        revalidateContent,
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        revalidateContent,
      ],
    },
  })),
  globals: [SiteSettings, Navigation, HomePanels, HomeNumbers].map(
    (global) => ({
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [
          ...(global.hooks?.afterChange ?? []),
          revalidateContent,
        ],
      },
    }),
  ),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  telemetry: false,
});
