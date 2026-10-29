import { getPayload } from "payload";

import { numbers, panels } from "./content/seed";
import { footerExplore, primaryNavigation } from "./lib/navigation";
import config from "./payload.config";

const payload = await getPayload({ config });

const seeded = {
  users: 0,
  panels: 0,
  numbers: 0,
  sports: 0,
  achievements: 0,
  timeline: 0,
};

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (email && password) {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: {
        email,
        password,
        name: "Site administrator",
        roles: ["admin"],
      },
      overrideAccess: true,
    });
    seeded.users = 1;
  }
}

await payload.updateGlobal({
  slug: "site-settings",
  data: {
    schoolName: "St. Joseph's College, Ombaci",
    motto: "Primus inter pares",
    metaTitle: "St. Joseph's College, Ombaci",
    metaDescription:
      "A Catholic boys' boarding school in Arua City, West Nile, Uganda.",
    address: "Ombaci, Ayivu Division",
    city: "Arua City",
    district: "West Nile",
    country: "Uganda",
    whatsappNumber:
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "256770911635",
    whatsappMessage:
      "Hello St. Joseph's College, Ombaci. I would like to ask about admissions.",
    admissions: { open: false },
    socialLinks: [],
    termDates: [],
  },
  overrideAccess: true,
});

await payload.updateGlobal({
  slug: "home-panels",
  data: {
    panels: panels.map((panel) => ({
      label: panel.label,
      href: panel.href,
      description: panel.description,
    })),
  },
  overrideAccess: true,
});
seeded.panels = panels.length;

await payload.updateGlobal({
  slug: "home-numbers",
  data: {
    items: numbers.map((number) => ({
      value: number.value,
      label: number.label,
    })),
  },
  overrideAccess: true,
});
seeded.numbers = numbers.length;

await payload.updateGlobal({
  slug: "navigation",
  data: {
    primary: primaryNavigation.map((item) => ({
      label: item.label,
      href: item.href,
      children: item.children ?? [],
    })),
    footer: [{ title: "Explore", links: footerExplore }],
  },
  overrideAccess: true,
});

const sports = await payload.find({
  collection: "sports",
  limit: 1,
  overrideAccess: true,
});

if (sports.totalDocs === 0) {
  for (const title of [
    "Rugby",
    "Football",
    "Track",
    "Tennis",
    "Volleyball",
    "Basketball",
  ]) {
    await payload.create({
      collection: "sports",
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        editorialStatus: "published",
      },
      draft: false,
      overrideAccess: true,
    });
    seeded.sports += 1;
  }
}

const achievements = await payload.find({
  collection: "achievements",
  limit: 1,
  overrideAccess: true,
});

if (achievements.totalDocs === 0) {
  await payload.create({
    collection: "achievements",
    data: {
      title: "First, Arua regional science fair",
      slug: "first-arua-regional-science-fair",
      summary: "The school's science team won the regional fair in Arua.",
      year: 2025,
      category: "science",
      editorialStatus: "published",
    },
    draft: false,
    overrideAccess: true,
  });
  await payload.create({
    collection: "achievements",
    data: {
      title: "Silver, National Science Fair",
      slug: "silver-national-science-fair",
      summary:
        "The team took silver at the 2025 National Science Fair at Kololo Secondary School, Kampala.",
      year: 2025,
      category: "science",
      editorialStatus: "published",
    },
    draft: false,
    overrideAccess: true,
  });
  seeded.achievements = 2;
}

const timeline = await payload.find({
  collection: "timeline",
  limit: 1,
  overrideAccess: true,
});

if (timeline.totalDocs === 0) {
  await payload.create({
    collection: "timeline",
    data: {
      year: 1943,
      title: "Founded by the Comboni Missionaries",
      sortOrder: 1,
      editorialStatus: "published",
    },
    draft: false,
    overrideAccess: true,
  });
  await payload.create({
    collection: "timeline",
    data: {
      year: 1960,
      title: "Became a secondary school",
      sortOrder: 2,
      editorialStatus: "published",
    },
    draft: false,
    overrideAccess: true,
  });
  seeded.timeline = 2;
}

payload.logger.info(
  `Seed complete: ${JSON.stringify(seeded)}`,
);

await payload.destroy();
