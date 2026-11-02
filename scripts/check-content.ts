import { db, client } from "../src/db/client";
import { eq } from "drizzle-orm";
import { items, media, pages, settings } from "../src/db/schema";

type Marker = { location: string; text: string };
type MissingPhoto = { location: string };

function findMarkers(value: unknown, location: string, results: Marker[]) {
  if (typeof value === "string") {
    const placeholderPattern =
      /\[To be confirmed:[^\]]+\]|photo coming soon|to be confirmed|being confirmed|when they have been confirmed|replace before publishing|replace with approved photos|^\s*draft\b|old boy name|class, profession/gi;
    for (const match of value.matchAll(placeholderPattern)) {
      results.push({ location, text: match[0] });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      findMarkers(entry, `${location}[${index}]`, results),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      findMarkers(entry, `${location}.${key}`, results);
    }
  }
}

function findMissingPhotos(
  value: unknown,
  location: string,
  results: MissingPhoto[],
) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      findMissingPhotos(entry, `${location}[${index}]`, results),
    );
    return;
  }

  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  if (
    "alt" in record &&
    "label" in record &&
    "tone" in record &&
    (typeof record.src !== "string" || record.src.trim() === "")
  ) {
    results.push({ location });
  }

  for (const [key, entry] of Object.entries(record)) {
    findMissingPhotos(entry, `${location}.${key}`, results);
  }
}

try {
  const [settingsRows, pageRows, itemRows, sampleRows] = await Promise.all([
    db.select().from(settings),
    db.select().from(pages),
    db.select().from(items),
    db.select().from(media).where(eq(media.isSample, true)),
  ]);
  const markers: Marker[] = [];
  const missingPhotos: MissingPhoto[] = [];

  settingsRows.forEach((row) => {
    findMarkers(row.value, `Settings.${row.key}`, markers);
    findMissingPhotos(row.value, `Settings.${row.key}`, missingPhotos);
  });
  pageRows.forEach((row) => {
    findMarkers(row.fields, `Page.${row.key}`, markers);
    findMissingPhotos(row.fields, `Page.${row.key}`, missingPhotos);
  });
  itemRows.forEach((row) => {
    findMarkers(row.fields, `${row.collection}.${row.slug}`, markers);
    findMissingPhotos(
      row.fields,
      `${row.collection}.${row.slug}`,
      missingPhotos,
    );
  });

  console.log(`Sample photos to replace: ${sampleRows.length}`);
  for (const sample of sampleRows) {
    console.log(
      `- ${sample.alt} | ${sample.credit ?? "Credit not recorded"} | ${sample.licence ?? "Licence not recorded"} | people: ${sample.hasPeople ? "yes" : "no"} | ${sample.sourceUrl ?? "Source not recorded"}`,
    );
  }

  console.log(`Remaining [To be confirmed] markers: ${markers.length}`);
  for (const marker of markers) {
    console.log(`- ${marker.location}: ${marker.text}`);
  }

  console.log(`Unfilled photo slots: ${missingPhotos.length}`);
  for (const photo of missingPhotos) {
    console.log(`- ${photo.location}`);
  }

  if (markers.length > 0 || missingPhotos.length > 0) {
    process.exitCode = 1;
  }
} finally {
  await client.close();
}
