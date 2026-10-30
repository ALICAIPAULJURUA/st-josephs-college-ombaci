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
  contactHref: "/contact",
  whatsappMessage:
    "Hello St. Joseph's College, Ombaci. I would like to ask about admissions.",
} as const;

export const primaryNavigation: NavItem[] = [
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

export type SiteSettings = typeof siteSettings;
export type Navigation = typeof defaultNavigation;

export type DefaultPage = {
  slug: string;
  title: string;
  summary?: string;
  layout?: unknown[];
};

export const defaultPages: Record<string, DefaultPage> = {};
