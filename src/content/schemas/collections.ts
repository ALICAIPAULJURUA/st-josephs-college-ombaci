import {
  definePage,
  image,
  link,
  list,
  number,
  richtext,
  select,
  text,
  textarea,
  toggle,
} from "./index";

const slug = text({
  name: "slug",
  label: "Web address ending",
  hint: "Use lower-case words separated by hyphens",
  required: true,
});

const title = text({
  name: "title",
  label: "Title",
  hint: "A short, clear title",
  max: 100,
  required: true,
});

const summary = textarea({
  name: "summary",
  label: "Short description",
  hint: "A short introduction shown in lists",
  max: 240,
  required: true,
});

const body = richtext({
  name: "body",
  label: "Main text",
  hint: "Use short paragraphs and headings",
  required: true,
});

const photo = image({
  name: "photo",
  label: "Photo",
  hint: "Choose an approved photo or keep the placeholder",
});

export const collectionSchemas = [
  definePage({
    key: "news",
    label: "News",
    route: "/news",
    fields: [
      title,
      slug,
      text({
        name: "date",
        label: "Date",
        hint: "The date this article was published, or a confirmation note",
        max: 60,
        required: true,
      }),
      text({
        name: "category",
        label: "Category",
        hint: "A short category, such as School life",
      }),
      summary,
      body,
      photo,
      toggle({
        name: "featured",
        label: "Show on the home page",
        hint: "Feature this article on the home page",
      }),
    ],
  }),
  definePage({
    key: "notices",
    label: "Notices",
    route: "/notices",
    fields: [
      title,
      slug,
      body,
      text({
        name: "startsOn",
        label: "Start date",
        hint: "Optional date when this notice should appear",
        max: 60,
      }),
      text({
        name: "expiresOn",
        label: "Expiry date",
        hint: "Optional date when this notice should stop appearing",
        max: 60,
      }),
      toggle({
        name: "pinned",
        label: "Pin to the notice bar",
        hint: "Show this notice in the bar at the top of the website",
      }),
    ],
  }),
  definePage({
    key: "events",
    label: "Events",
    route: "/events",
    fields: [
      title,
      slug,
      text({
        name: "eventDate",
        label: "Event date",
        hint: "Write the date as it should appear to visitors",
        required: true,
      }),
      summary,
      body,
      photo,
    ],
  }),
  definePage({
    key: "people",
    label: "People",
    route: "/staff",
    fields: [
      text({
        name: "name",
        label: "Name",
        hint: "Enter the staff member's full name",
        required: true,
      }),
      slug,
      text({
        name: "role",
        label: "Role",
        hint: "For example, Headmaster",
        required: true,
      }),
      text({
        name: "department",
        label: "Department",
        hint: "The department this person leads or works in",
      }),
      textarea({
        name: "bio",
        label: "Short introduction",
        hint: "A brief, approved introduction",
        max: 600,
        required: true,
      }),
      photo,
      number({
        name: "order",
        label: "Display order",
        hint: "A smaller number appears earlier",
        min: 0,
      }),
      toggle({
        name: "leadership",
        label: "School leader",
        hint: "Show this person in the leadership section",
      }),
      toggle({
        name: "consentRecorded",
        label: "Photo consent recorded",
        hint: "Only select this when permission is recorded",
      }),
    ],
  }),
  definePage({
    key: "facilities",
    label: "Study and facilities",
    route: "/academics/study-resources",
    fields: [
      title,
      slug,
      number({
        name: "order",
        label: "Display order",
        hint: "A smaller number appears earlier",
        min: 0,
      }),
      summary,
      body,
      list({
        name: "facts",
        label: "Key details",
        hint: "Short details visitors should notice",
        itemType: "text",
        max: 120,
      }),
      photo,
      toggle({
        name: "featured",
        label: "Feature on the home page",
        hint: "Include this facility in the home page preview",
      }),
    ],
  }),
  definePage({
    key: "sports",
    label: "Sports",
    route: "/sports",
    fields: [
      title,
      slug,
      summary,
      body,
      list({
        name: "teamNotes",
        label: "Team notes",
        hint: "Approved notes about this sport",
        itemType: "text",
        max: 200,
      }),
      list({
        name: "photos",
        label: "Photos",
        hint: "Choose approved photos for this sport",
        itemFields: [photo],
      }),
    ],
  }),
  definePage({
    key: "achievements",
    label: "Achievements",
    route: "/achievements",
    fields: [
      title,
      slug,
      number({
        name: "year",
        label: "Year",
        hint: "The year of this result",
        min: 1900,
        max: 2100,
        required: true,
      }),
      text({
        name: "level",
        label: "Level",
        hint: "For example, regional or national",
        required: true,
      }),
      summary,
      body,
      photo,
      link({
        name: "source",
        label: "Source link",
        hint: "Optional link to a source for this result",
      }),
    ],
  }),
  definePage({
    key: "old-boys",
    label: "Old Boys",
    route: "/old-boys",
    fields: [
      title,
      slug,
      text({
        name: "role",
        label: "Association role",
        hint: "Optional role or association name",
      }),
      summary,
      body,
      photo,
      toggle({
        name: "consentRecorded",
        label: "Photo and quote consent recorded",
        hint: "Only select this when permission is recorded",
      }),
    ],
  }),
  definePage({
    key: "gallery",
    label: "Gallery",
    route: "/gallery",
    fields: [
      title,
      slug,
      text({
        name: "date",
        label: "Date",
        hint: "Optional date or year for this album",
      }),
      summary,
      list({
        name: "photos",
        label: "Album photos",
        hint: "Choose photos that have permission to be shared",
        itemFields: [photo],
      }),
      toggle({
        name: "consentRecorded",
        label: "Consent recorded for identifiable people",
        hint: "Only select this when permission is recorded",
      }),
      toggle({
        name: "isSample",
        label: "Example album",
        hint: "Keep enabled until school photos replace this example",
      }),
    ],
  }),
  definePage({
    key: "faqs",
    label: "Questions (FAQs)",
    route: "/admissions/faqs",
    fields: [
      text({
        name: "question",
        label: "Question",
        hint: "Write the question as a visitor might ask it",
        max: 180,
        required: true,
      }),
      slug,
      richtext({
        name: "answer",
        label: "Answer",
        hint: "Use confirmed information or direct the visitor to contact the school",
        required: true,
      }),
      select({
        name: "topic",
        label: "Topic",
        hint: "Choose the closest topic",
        options: [
          { label: "Admissions", value: "admissions" },
          { label: "Academics", value: "academics" },
          { label: "Boarding", value: "boarding" },
          { label: "Facilities", value: "facilities" },
          { label: "Sports", value: "sports" },
          { label: "Contact", value: "contact" },
        ],
        required: true,
      }),
      toggle({
        name: "feedsAssistant",
        label: "Use in assistant answers",
        hint: "Only approved answers are shared with the website assistant",
      }),
    ],
  }),
  definePage({
    key: "timeline",
    label: "History timeline",
    route: "/about/history",
    fields: [
      text({
        name: "year",
        label: "Year",
        hint: "The year shown in the timeline",
        required: true,
      }),
      title,
      summary,
      photo,
    ],
  }),
  definePage({
    key: "subjects",
    label: "Subjects",
    route: "/academics",
    fields: [
      title,
      slug,
      select({
        name: "level",
        label: "Level",
        hint: "Choose the level where this subject belongs",
        options: [
          { label: "O-level", value: "o-level" },
          { label: "A-level", value: "a-level" },
        ],
        required: true,
      }),
      text({
        name: "category",
        label: "Category or combination",
        hint: "Enter a confirmed subject category or combination",
      }),
      toggle({
        name: "needsConfirmation",
        label: "Needs school confirmation",
        hint: "Keep enabled until the academic office confirms this detail",
      }),
    ],
  }),
  definePage({
    key: "clubs",
    label: "Clubs",
    route: "/student-life/clubs",
    fields: [title, slug, summary, body, photo],
  }),
  definePage({
    key: "extra-pages",
    label: "Extra pages",
    route: "/",
    fields: [
      title,
      slug,
      text({
        name: "route",
        label: "Web address",
        hint: "Choose a short lower-case address beginning with a slash",
        required: true,
      }),
      summary,
      photo,
      body,
    ],
  }),
] as const;

export type CollectionSchema = (typeof collectionSchemas)[number];

export function getCollectionSchema(key: unknown) {
  if (typeof key !== "string") return null;
  return collectionSchemas.find((schema) => schema.key === key) ?? null;
}
