import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";

import type {
  Achievement,
  Facility,
  HomePanel,
  Media,
  OldBoy,
  Sport,
  Staff,
} from "@/payload-types";
import {
  honours as seedHonours,
  learningRows as seedLearningRows,
  numbers as seedNumbers,
  oldBoys as seedOldBoys,
  panels as seedPanels,
  sports as seedSports,
  staff as seedStaff,
  type HonourSeed,
  type LearningRowSeed,
  type NumberSeed,
  type OldBoysSeed,
  type PanelSeed,
  type PhotoSeed,
  type SportSeed,
  type StaffMemberSeed,
} from "@/content/seed";
import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

const sportTones: PhotoTone[] = [
  "navy-2",
  "green",
  "tint",
  "navy",
  "mist",
  "navy-2",
  "green",
  "tint",
];

const sportRatios: PhotoRatio[] = [
  "3/4",
  "4/3",
  "1/1",
  "4/5",
  "4/3",
  "3/4",
  "1/1",
  "4/3",
];

function mediaUrl(value: number | Media | null | undefined) {
  if (!value || typeof value === "number") {
    return undefined;
  }

  return value.url ?? undefined;
}

function mediaAlt(
  value: number | Media | null | undefined,
  fallback: string,
) {
  if (!value || typeof value === "number") {
    return fallback;
  }

  return value.alt || fallback;
}

function photoFromMedia(
  value: number | Media | null | undefined,
  fallback: PhotoSeed,
): PhotoSeed {
  const src = mediaUrl(value);

  return {
    ...fallback,
    src,
    alt: mediaAlt(value, fallback.alt),
    label: src ? fallback.label : mediaAlt(value, fallback.label),
  };
}

function mapPanels(items: NonNullable<HomePanel["panels"]>): PanelSeed[] {
  return items.map((item, index) => {
    const fallback = seedPanels[index] ?? seedPanels[0];

    return {
      label: item.label,
      href: item.href,
      description: item.description,
      photo: photoFromMedia(item.image, fallback.photo),
    };
  });
}

async function getHomeGlobals() {
  const { default: payloadConfig } = await import("@payload-config");
  const payload = await getPayload({ config: payloadConfig });

  const [panels, numbers] = await Promise.all([
    payload.findGlobal({ slug: "home-panels", overrideAccess: false }),
    payload.findGlobal({ slug: "home-numbers", overrideAccess: false }),
  ]);

  return { panels, numbers };
}

function mapLearningRows(items: Facility[]): LearningRowSeed[] {
  return items.map((facility, index) => {
    const fallback = seedLearningRows[index] ?? seedLearningRows[0];

    return {
      number: String(index + 1).padStart(2, "0"),
      title: facility.title,
      body: facility.summary,
      factPlaceholders: fallback.factPlaceholders,
      photo: photoFromMedia(facility.image, fallback.photo),
    };
  });
}

function mapSports(items: Sport[]): SportSeed[] {
  return items.map((sport, index) => {
    const fallback = seedSports[index] ?? seedSports[0];

    return {
      name: sport.title,
      photo: {
        ...photoFromMedia(sport.image, fallback.photo),
        tone: sportTones[index % sportTones.length],
        ratio: sportRatios[index % sportRatios.length],
      },
    };
  });
}

function mapStaff(items: Staff[]): StaffMemberSeed[] {
  return items.map((member, index) => {
    const fallback = seedStaff[index] ?? seedStaff[0];

    return {
      name: member.name,
      role: member.role,
      photo: photoFromMedia(member.photo, fallback.photo),
    };
  });
}

function mapHonours(items: Achievement[]): HonourSeed[] {
  return items.map((achievement, index) => {
    const fallback = seedHonours[index] ?? seedHonours[0];

    return {
      year: String(achievement.year),
      title: achievement.title,
      line: achievement.summary,
      photo: photoFromMedia(achievement.image, fallback.photo),
    };
  });
}

function mapOldBoys(items: OldBoy[]): OldBoysSeed {
  const featured = items.find((item) => item.featured) ?? items[0];

  if (!featured) {
    return seedOldBoys;
  }

  const others = items.filter((item) => item.id !== featured.id);
  const fallback = seedOldBoys;

  const meta = (person: OldBoy) =>
    [person.classYear, person.profession].filter(Boolean).join(", ");

  return {
    joinHref: fallback.joinHref,
    featured: {
      quote: featured.quote ?? undefined,
      quotePlaceholder: fallback.featured.quotePlaceholder,
      name: featured.name,
      namePlaceholder: fallback.featured.namePlaceholder,
      meta: meta(featured),
      metaPlaceholder: fallback.featured.metaPlaceholder,
      photo: photoFromMedia(featured.photo, fallback.featured.photo),
    },
    list: others.map((person, index) => ({
      name: person.name,
      namePlaceholder: fallback.list[index]?.namePlaceholder ?? "Old Boy name",
      meta: meta(person),
      metaPlaceholder:
        fallback.list[index]?.metaPlaceholder ?? "Class, profession",
      photo: photoFromMedia(
        person.photo,
        fallback.list[index]?.photo ?? fallback.list[0].photo,
      ),
    })),
  };
}

export type HomeData = {
  panels: PanelSeed[];
  numbers: NumberSeed[];
  learningRows: LearningRowSeed[];
  sports: SportSeed[];
  staff: StaffMemberSeed[];
  honours: HonourSeed[];
  oldBoys: OldBoysSeed;
};

export async function getHomeData(): Promise<HomeData> {
  "use cache";
  cacheLife("hours");
  cacheTag("home");

  const { default: payloadConfig } = await import("@payload-config");
  const payload = await getPayload({ config: payloadConfig });

  const [globals, facilities, sports, staff, achievements, oldBoys] =
    await Promise.all([
      getHomeGlobals(),
      payload.find({
        collection: "facilities",
        where: {
          category: { equals: "learning" },
          _status: { equals: "published" },
        },
        sort: "sortOrder",
        limit: 3,
        depth: 1,
        overrideAccess: false,
      }),
      payload.find({
        collection: "sports",
        where: { _status: { equals: "published" } },
        sort: "sortOrder",
        limit: 8,
        depth: 1,
        overrideAccess: false,
      }),
      payload.find({
        collection: "staff",
        where: {
          _status: { equals: "published" },
          featured: { equals: true },
        },
        sort: "sortOrder",
        limit: 6,
        depth: 1,
        overrideAccess: false,
      }),
      payload.find({
        collection: "achievements",
        where: { _status: { equals: "published" } },
        sort: "-year",
        limit: 4,
        depth: 1,
        overrideAccess: false,
      }),
      payload.find({
        collection: "old-boys",
        where: { _status: { equals: "published" } },
        sort: "sortOrder",
        limit: 6,
        depth: 1,
        overrideAccess: false,
      }),
    ]);

  const panelItems = globals.panels.panels ?? [];
  const numberItems = globals.numbers.items ?? [];
  const oldBoyItems = oldBoys.docs;

  return {
    panels: panelItems.length ? mapPanels(panelItems) : seedPanels,
    numbers: numberItems.length
      ? numberItems.map((item) => ({ value: item.value, label: item.label }))
      : seedNumbers,
    learningRows: facilities.docs.length
      ? mapLearningRows(facilities.docs)
      : seedLearningRows,
    sports: sports.docs.length ? mapSports(sports.docs) : seedSports,
    staff: staff.docs.length ? mapStaff(staff.docs) : seedStaff,
    honours: achievements.docs.length
      ? mapHonours(achievements.docs)
      : seedHonours,
    oldBoys: oldBoyItems.length ? mapOldBoys(oldBoyItems) : seedOldBoys,
  };
}
