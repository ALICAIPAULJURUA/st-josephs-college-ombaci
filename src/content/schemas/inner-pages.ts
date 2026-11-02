import {
  definePage,
  image,
  list,
  richtext,
  seo,
  text,
  textarea,
} from "./index";

const storyFields = [
  text({
    name: "title",
    label: "Page title",
    hint: "Keep the title short and clear",
    max: 59,
    required: true,
  }),
  textarea({
    name: "lead",
    label: "Opening",
    hint: "One or two sentences shown below the page title",
    max: 220,
    required: true,
  }),
  image({
    name: "heroImage",
    label: "Top photo",
    hint: "Choose a photo or leave the branded placeholder",
  }),
  richtext({
    name: "body",
    label: "Main text",
    hint: "Use headings to break the text into short sections",
    required: true,
  }),
  seo({
    name: "seo",
    label: "Search details",
    hint: "Optional title and description used by search engines",
  }),
] as const;

const infoFields = [
  text({
    name: "title",
    label: "Page title",
    hint: "Keep the title short and clear",
    max: 59,
    required: true,
  }),
  textarea({
    name: "lead",
    label: "Opening",
    hint: "One or two sentences shown below the page title",
    max: 220,
    required: true,
  }),
  richtext({
    name: "body",
    label: "Page information",
    hint: "Use headings, short paragraphs and lists",
    required: true,
  }),
  list({
    name: "contents",
    label: "Page sections",
    hint: "Optional section links shown on longer information pages",
    itemFields: [
      text({
        name: "title",
        label: "Section title",
        hint: "A short heading",
        required: true,
      }),
      text({
        name: "body",
        label: "Section text",
        hint: "A short note for this section",
      }),
    ],
  }),
  seo({
    name: "seo",
    label: "Search details",
    hint: "Optional title and description used by search engines",
  }),
] as const;

const listingFields = [
  text({
    name: "title",
    label: "Page title",
    hint: "Keep the title short and clear",
    max: 59,
    required: true,
  }),
  textarea({
    name: "lead",
    label: "Opening",
    hint: "One or two sentences shown below the page title",
    max: 220,
    required: true,
  }),
  textarea({
    name: "emptyMessage",
    label: "When there are no entries",
    hint: "A short, friendly message shown when this list is empty",
    max: 180,
    required: true,
  }),
  seo({
    name: "seo",
    label: "Search details",
    hint: "Optional title and description used by search engines",
  }),
] as const;

export const innerPageSchemas = [
  definePage({
    key: "about",
    label: "About the college",
    route: "/about",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "history",
    label: "History",
    route: "/about/history",
    template: "info",
    collection: "timeline",
    fields: infoFields,
  }),
  definePage({
    key: "leadership",
    label: "Leadership",
    route: "/about/leadership",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "admissions",
    label: "How to join",
    route: "/admissions",
    template: "info",
    fields: infoFields,
  }),
  definePage({
    key: "requirements",
    label: "Requirements",
    route: "/admissions/requirements",
    template: "info",
    fields: infoFields,
  }),
  definePage({
    key: "fees",
    label: "Fees",
    route: "/admissions/fees",
    template: "info",
    fields: infoFields,
  }),
  definePage({
    key: "term-dates",
    label: "Term dates",
    route: "/admissions/term-dates",
    template: "info",
    fields: infoFields,
  }),
  definePage({
    key: "faqs",
    label: "Questions",
    route: "/admissions/faqs",
    template: "listing",
    collection: "faqs",
    fields: listingFields,
  }),
  definePage({
    key: "apply",
    label: "Online application",
    route: "/apply",
    template: "info",
    fields: [
      ...infoFields.slice(0, 3),
      textarea({
        name: "closedMessage",
        label: "Applications closed message",
        hint: "Shown when applications are closed",
        max: 240,
        required: true,
      }),
      richtext({
        name: "consentText",
        label: "Consent information",
        hint: "Explain how application details are used",
        required: true,
      }),
      seo({
        name: "seo",
        label: "Search details",
        hint: "Optional title and description used by search engines",
      }),
    ],
  }),
  definePage({
    key: "academics",
    label: "Academics",
    route: "/academics",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "o-level",
    label: "O-level subjects",
    route: "/academics/o-level",
    template: "listing",
    collection: "subjects",
    fields: listingFields,
  }),
  definePage({
    key: "a-level",
    label: "A-level subjects",
    route: "/academics/a-level",
    template: "listing",
    collection: "subjects",
    fields: listingFields,
  }),
  definePage({
    key: "study-resources",
    label: "Study resources",
    route: "/academics/study-resources",
    template: "resources",
    collection: "facilities",
    fields: listingFields,
  }),
  definePage({
    key: "student-life",
    label: "Student life",
    route: "/student-life",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "boarding",
    label: "Boarding",
    route: "/student-life/boarding",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "clubs",
    label: "Clubs",
    route: "/student-life/clubs",
    template: "listing",
    collection: "clubs",
    fields: listingFields,
  }),
  definePage({
    key: "sports",
    label: "Sports",
    route: "/sports",
    template: "listing",
    collection: "sports",
    fields: listingFields,
  }),
  definePage({
    key: "staff",
    label: "Staff",
    route: "/staff",
    template: "listing",
    collection: "people",
    fields: listingFields,
  }),
  definePage({
    key: "achievements",
    label: "Honours",
    route: "/achievements",
    template: "listing",
    collection: "achievements",
    fields: listingFields,
  }),
  definePage({
    key: "old-boys",
    label: "Old Boys",
    route: "/old-boys",
    template: "story",
    fields: storyFields,
  }),
  definePage({
    key: "old-boys-profiles",
    label: "Old Boys' profiles",
    route: "/old-boys/profiles",
    template: "listing",
    collection: "old-boys",
    fields: listingFields,
  }),
  definePage({
    key: "news",
    label: "News",
    route: "/news",
    template: "listing",
    collection: "news",
    fields: listingFields,
  }),
  definePage({
    key: "notices",
    label: "Notices",
    route: "/notices",
    template: "listing",
    collection: "notices",
    fields: listingFields,
  }),
  definePage({
    key: "events",
    label: "Events",
    route: "/events",
    template: "listing",
    collection: "events",
    fields: listingFields,
  }),
  definePage({
    key: "gallery",
    label: "Gallery",
    route: "/gallery",
    template: "listing",
    collection: "gallery",
    fields: listingFields,
  }),
  definePage({
    key: "contact",
    label: "Contact",
    route: "/contact",
    template: "contact",
    fields: [
      text({
        name: "title",
        label: "Page title",
        hint: "Keep the title short and clear",
        max: 59,
        required: true,
      }),
      textarea({
        name: "lead",
        label: "Opening",
        hint: "One or two sentences shown below the page title",
        max: 220,
        required: true,
      }),
      textarea({
        name: "formIntro",
        label: "Contact form introduction",
        hint: "Explain what a visitor can ask the school",
        max: 220,
        required: true,
      }),
      seo({
        name: "seo",
        label: "Search details",
        hint: "Optional title and description used by search engines",
      }),
    ],
  }),
  definePage({
    key: "not-found",
    label: "Not found",
    route: "/404",
    template: "info",
    fields: [
      text({
        name: "title",
        label: "Page title",
        hint: "A short heading shown when a page cannot be found",
        max: 59,
        required: true,
      }),
      textarea({
        name: "lead",
        label: "Opening",
        hint: "A short explanation for visitors",
        max: 220,
        required: true,
      }),
      richtext({
        name: "body",
        label: "Message",
        hint: "Explain what visitors can do next",
        required: true,
      }),
      list({
        name: "links",
        label: "Helpful links",
        hint: "Add pages visitors can use to continue",
        itemFields: [
          text({
            name: "label",
            label: "Link label",
            hint: "Short text visitors see",
            required: true,
          }),
          text({
            name: "href",
            label: "Link address",
            hint: "A page address such as /admissions",
            required: true,
          }),
        ],
      }),
      seo({
        name: "seo",
        label: "Search details",
        hint: "Optional title and description used by search engines",
      }),
    ],
  }),
  ...(["privacy", "terms", "accessibility"] as const).map((key) =>
    definePage({
      key,
      label:
        key === "privacy"
          ? "Privacy"
          : key === "terms"
            ? "Terms"
            : "Accessibility",
      route: `/${key}`,
      template: "story",
      fields: storyFields,
    }),
  ),
] as const;

export const innerPageSchemaByKey = Object.fromEntries(
  innerPageSchemas.map((schema) => [schema.key, schema]),
);

export const innerPageSchemaByRoute = Object.fromEntries(
  innerPageSchemas.map((schema) => [schema.route.slice(1), schema]),
);
