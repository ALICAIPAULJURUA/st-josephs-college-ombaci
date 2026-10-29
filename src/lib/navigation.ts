export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

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
