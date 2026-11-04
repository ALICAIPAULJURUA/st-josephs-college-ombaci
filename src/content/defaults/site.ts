import type { PageFields } from "@/content/schemas";
import type { settingsSchema } from "@/content/schemas/settings";

export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const siteSettings = {
  schoolName: "St. Joseph's College, Ombaci",
  motto: "Primus inter pares",
  metaTitle: "St. Joseph's College, Ombaci",
  metaDescription:
    "A Catholic boys' boarding school in Arua City, West Nile, Uganda.",
  address: "Ombaci, Ayivu Division",
  city: "Arua City",
  district: "West Nile",
  country: "Uganda",
  applyHref: "/apply",
  applyLabel: "Apply now",
  contactHref: "/contact",
  headerLocation: "OMBACI · ARUA CITY",
  phone: "SAMPLE ONLY — phone not supplied.",
  email: "SAMPLE ONLY — no school email address is supplied.",
  officeHours: "SAMPLE ONLY — ask the school before visiting.",
  mapPin:
    "SAMPLE ONLY — exact map pin not supplied; general location: Ombaci, Ayivu Division, Arua City.",
  whatsappNumber: "+256770911635",
  whatsappMessage:
    "Hello St. Joseph's College, Ombaci. I would like to ask about admissions.",
  whatsappLabel: "Chat on WhatsApp",
  assistantLabel: "Ask OMBACIAN Assistant",
  menuLabel: "Menu",
  closeLabel: "Close",
  applicationsOpen: false,
  assistantEnabled: true,
  logo: {
    src: "/crest.png",
    alt: "St. Joseph's College Ombaci crest",
    label: "School crest",
    tone: "navy",
  },
  notice: {
    enabled: false,
    text: "",
    href: "",
    dismissLabel: "Dismiss",
  },
  visitHeading: "Visit",
  contactHeading: "Contact",
} as const;

export const requestedPrimaryNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Media", href: "/gallery" },
  { label: "News", href: "/news" },
];

export const primaryNavigation: NavItem[] = [
  ...requestedPrimaryNavigation,
  {
    label: "About",
    href: "/about",
    children: [
      { label: "History", href: "/about/history" },
      { label: "Leadership", href: "/about/leadership" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    children: [
      { label: "Requirements", href: "/admissions/requirements" },
      { label: "Fees", href: "/admissions/fees" },
      { label: "Term dates", href: "/admissions/term-dates" },
      { label: "FAQs", href: "/admissions/faqs" },
    ],
  },
  {
    label: "Study",
    href: "/academics",
    children: [
      { label: "O-level", href: "/academics/o-level" },
      { label: "A-level", href: "/academics/a-level" },
      { label: "Study resources", href: "/academics/study-resources" },
    ],
  },
  { label: "Sports", href: "/sports" },
  { label: "Staff", href: "/staff" },
  {
    label: "Old Boys",
    href: "/old-boys",
    children: [{ label: "Profiles", href: "/old-boys/profiles" }],
  },
  { label: "Contact", href: "/contact" },
];

export const footerExplore: NavChild[] = [
  { label: "Study", href: "/academics" },
  { label: "Sports", href: "/sports" },
  { label: "Old Boys", href: "/old-boys" },
];

export const defaultNavigation = {
  primary: primaryNavigation,
  footer: [{ title: "Explore", links: footerExplore }],
};

export function ensureRequestedPrimaryNavigation(
  primary: readonly NavItem[],
): NavItem[] {
  const configuredHrefs = new Set(primary.map((item) => item.href));
  const missingLinks = requestedPrimaryNavigation.filter(
    (item) => !configuredHrefs.has(item.href),
  );
  return [...missingLinks, ...primary];
}

export const settingsDefaults = {
  ...siteSettings,
  navigation: defaultNavigation,
  termDates: [],
} satisfies PageFields<typeof settingsSchema.fields>;

export type SiteSettings = PageFields<typeof settingsSchema.fields>;
export type Navigation = SiteSettings["navigation"];

export type DefaultPage = {
  slug: string;
  title: string;
  summary?: string;
  layout?: unknown[];
};

export const defaultPages: Record<string, DefaultPage> = {};
