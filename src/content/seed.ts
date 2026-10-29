import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

export type PhotoSeed = {
  src?: string;
  alt: string;
  label: string;
  tone: PhotoTone;
  ratio?: PhotoRatio;
};

export type PanelSeed = {
  label: string;
  href: string;
  description: string;
  photo: PhotoSeed;
};

export type NumberSeed = {
  value: string;
  label: string;
};

export type LearningRowSeed = {
  number: string;
  title: string;
  body?: string;
  bodyPlaceholder?: string;
  facts?: string[];
  factPlaceholders: string[];
  photo: PhotoSeed;
};

export type SportSeed = {
  name?: string;
  photo: PhotoSeed;
};

export type StaffMemberSeed = {
  name?: string;
  role?: string;
  photo: PhotoSeed;
};

export type HonourSeed = {
  year?: string;
  title?: string;
  line?: string;
  photo: PhotoSeed;
};

export type OldBoySeed = {
  name?: string;
  meta?: string;
  photo: PhotoSeed;
};

export const hero = {
  title: "First among",
  accent: "equals.",
  body: "A Catholic boys' boarding school in Arua City since 1943.",
  panelHint: "Hover a panel to look around.",
  touchHint: "Tap a panel to look around.",
  admissionsHref: "#apply",
} as const;

export const panels: PanelSeed[] = [
  {
    label: "Study",
    href: "/academics/study-resources",
    description:
      "Science laboratories, a computer lab and a library, with a science team that took silver in 2025.",
    photo: {
      alt: "Science laboratory with students at work",
      label: "Photo · Science lab, students at work",
      tone: "navy",
    },
  },
  {
    label: "Students",
    href: "/student-life",
    description:
      "Boarders from across the region, with chapel, clubs and the school magazine.",
    photo: {
      alt: "Students in the school quad",
      label: "Photo · Students in the quad",
      tone: "navy-2",
    },
  },
  {
    label: "Staff",
    href: "/staff",
    description: "The headmaster and the teachers who lead each department.",
    photo: {
      alt: "Teachers in the staff room",
      label: "Photo · Teachers in the staff room",
      tone: "green",
    },
  },
  {
    label: "Sports",
    href: "/sports",
    description: "Rugby, football, track, tennis, volleyball and basketball.",
    photo: {
      alt: "Rugby match in progress",
      label: "Photo · Rugby, mid-tackle",
      tone: "tint",
    },
  },
  {
    label: "Honours",
    href: "/achievements",
    description: "Silver at the 2025 National Science Fair, and more to come.",
    photo: {
      alt: "Medal ceremony",
      label: "Photo · Medal ceremony",
      tone: "navy",
    },
  },
  {
    label: "Old Boys",
    href: "/old-boys",
    description:
      "An association that gives back through labs, books and career talks.",
    photo: {
      alt: "Old Boys' dinner",
      label: "Photo · Old Boys' dinner",
      tone: "navy-2",
    },
  },
];

export const numbers: NumberSeed[] = [
  { value: "1943", label: "Founded by the Comboni Missionaries" },
  { value: "1960", label: "Became a secondary school" },
  { value: "6", label: "Sports on the school field" },
  { value: "O + A", label: "UCE and UACE classes" },
];

export const learningRows: LearningRowSeed[] = [
  {
    number: "01",
    title: "Science laboratories",
    body: "Hands-on work that helped the school's team to silver at the 2025 National Science Fair.",
    factPlaceholders: ["Number of labs", "Subjects practised"],
    photo: {
      alt: "Science laboratory, wide shot",
      label: "Photo · Science laboratory, wide shot",
      tone: "navy",
    },
  },
  {
    number: "02",
    title: "Computer lab",
    bodyPlaceholder:
      "One line on what students learn and how often they use it.",
    factPlaceholders: ["Number of computers", "Internet access"],
    photo: {
      alt: "Computer lab",
      label: "Photo · Computer lab",
      tone: "green",
    },
  },
  {
    number: "03",
    title: "Library",
    body: "Restocked with help from the Old Boys' Association.",
    factPlaceholders: ["Number of books", "Opening hours"],
    photo: {
      alt: "Library shelves and readers",
      label: "Photo · Library shelves and readers",
      tone: "navy-2",
    },
  },
];

export const sports: SportSeed[] = [
  {
    name: "Rugby",
    photo: {
      alt: "Rugby action",
      label: "Photo",
      tone: "navy-2",
      ratio: "3/4",
    },
  },
  {
    name: "Football",
    photo: {
      alt: "Football action",
      label: "Photo",
      tone: "green",
      ratio: "4/3",
    },
  },
  {
    name: "Track",
    photo: {
      alt: "Track event",
      label: "Photo",
      tone: "tint",
      ratio: "1/1",
    },
  },
  {
    name: "Tennis",
    photo: {
      alt: "Tennis match",
      label: "Photo",
      tone: "navy",
      ratio: "4/5",
    },
  },
  {
    name: "Volleyball",
    photo: {
      alt: "Volleyball match",
      label: "Photo",
      tone: "mist",
      ratio: "4/3",
    },
  },
  {
    name: "Basketball",
    photo: {
      alt: "Basketball game",
      label: "Photo",
      tone: "navy-2",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Supporters at a school match",
      label: "Photo · Supporters",
      tone: "green",
      ratio: "1/1",
    },
  },
  {
    photo: {
      alt: "Trophy presentation",
      label: "Photo · Trophy presentation",
      tone: "tint",
      ratio: "4/3",
    },
  },
];

export const staff: StaffMemberSeed[] = [
  {
    role: "Headmaster",
    photo: {
      alt: "Portrait of the headmaster",
      label: "Portrait",
      tone: "navy",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Staff portrait",
      label: "Portrait",
      tone: "navy-2",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Staff portrait",
      label: "Portrait",
      tone: "green",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Staff portrait",
      label: "Portrait",
      tone: "tint",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Staff portrait",
      label: "Portrait",
      tone: "mist",
      ratio: "3/4",
    },
  },
  {
    photo: {
      alt: "Staff portrait",
      label: "Portrait",
      tone: "navy",
      ratio: "3/4",
    },
  },
];

export const honours: HonourSeed[] = [
  {
    year: "2025",
    title: "Silver, National Science Fair",
    line: "Kololo Secondary School, Kampala",
    photo: {
      alt: "Science team with their silver medal",
      label: "Photo · Science team, silver medal",
      tone: "tint",
      ratio: "4/3",
    },
  },
  {
    year: "2025",
    title: "First, Arua regional science fair",
    line: "The route to the nationals",
    photo: {
      alt: "Regional science fair stand",
      label: "Photo · Regional fair stand",
      tone: "mist",
      ratio: "4/3",
    },
  },
  {
    photo: {
      alt: "School achievement",
      label: "Photo",
      tone: "tint",
      ratio: "4/3",
    },
  },
  {
    photo: {
      alt: "School achievement",
      label: "Photo",
      tone: "mist",
      ratio: "4/3",
    },
  },
];

export type OldBoysSeed = {
  featured: {
    quote?: string;
    quotePlaceholder: string;
    name?: string;
    namePlaceholder: string;
    meta?: string;
    metaPlaceholder: string;
    photo: PhotoSeed;
  };
  list: {
    name?: string;
    namePlaceholder: string;
    meta?: string;
    metaPlaceholder: string;
    photo: PhotoSeed;
  }[];
  joinHref: string;
};

export const oldBoys: OldBoysSeed = {
  featured: {
    quotePlaceholder: "A line from the Old Boy about what Ombaci gave him.",
    namePlaceholder: "Old Boy name",
    metaPlaceholder: "Class, profession",
    photo: {
      alt: "Featured Old Boy, portrait or at work",
      label: "Photo · Featured Old Boy, portrait or at work",
      tone: "navy",
      ratio: "4/3",
    },
  },
  list: [
    {
      namePlaceholder: "Old Boy name",
      metaPlaceholder: "Class, profession",
      photo: {
        alt: "Old Boy portrait",
        label: "Photo",
        tone: "navy-2",
        ratio: "1/1",
      },
    },
    {
      namePlaceholder: "Old Boy name",
      metaPlaceholder: "Class, profession",
      photo: {
        alt: "Old Boy portrait",
        label: "Photo",
        tone: "green",
        ratio: "1/1",
      },
    },
    {
      namePlaceholder: "Old Boy name",
      metaPlaceholder: "Class, profession",
      photo: {
        alt: "Old Boy portrait",
        label: "Photo",
        tone: "tint",
        ratio: "1/1",
      },
    },
  ],
  joinHref: "/old-boys",
};

export const admissions = {
  label: "Admissions",
  title: "Senior One.",
  accent: "Senior Five.",
  bodyPlaceholder:
    "Opening and closing dates, requirements and the admissions contact, to be supplied by the school",
  href: "/apply",
} as const;
