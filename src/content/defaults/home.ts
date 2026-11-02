import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";
import type { PageFields } from "@/content/schemas";
import { homePageSchema } from "@/content/schemas/home";
import { sampleMediaRef } from "./sample-media";

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
  facts: string[];
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
  admissionsLabel: "How to apply",
} as const;

export const numbersLabel = "The college in numbers";

export const panels: PanelSeed[] = [
  {
    label: "Study",
    href: "/academics/study-resources",
    description:
      "Science laboratories, a computer lab and a library, with a science team that took silver in 2025.",
    photo: {
      src: sampleMediaRef("science-lab"),
      alt: "Laboratory glassware with a test tube held above a bowl",
      label: "Photo · Science lab, students at work",
      tone: "navy",
    },
  },
  {
    label: "Students",
    href: "/student-life",
    description:
      "A Catholic boys' boarding school in Arua City, with a chapel and the school magazine.",
    photo: {
      src: sampleMediaRef("students-running"),
      alt: "Students with backpacks approaching a classroom, seen from behind",
      label: "Photo · Students approaching a classroom",
      tone: "navy-2",
    },
  },
  {
    label: "Staff",
    href: "/staff",
    description:
      "Learn about school leadership and staff through clearly labelled profile examples.",
    photo: {
      src: sampleMediaRef("library"),
      alt: "Sample library photo, not a staff portrait",
      label: "Illustrative school setting · not a staff portrait",
      tone: "green",
    },
  },
  {
    label: "Sports",
    href: "/sports",
    description: "Rugby, football, track, tennis, volleyball and basketball.",
    photo: {
      src: sampleMediaRef("rugby"),
      alt: "Players competing in a rugby match on a grass field",
      label: "Photo · Rugby, mid-tackle",
      tone: "tint",
    },
  },
  {
    label: "Honours",
    href: "/achievements",
    description: "The college won silver at the 2025 National Science Fair.",
    photo: {
      src: sampleMediaRef("science-lab"),
      alt: "Sample science laboratory photo, not an awards ceremony",
      label: "Illustrative school setting · not an awards ceremony",
      tone: "navy",
    },
  },
  {
    label: "Old Boys",
    href: "/old-boys",
    description:
      "An association that has supported an ICT lab and library stock.",
    photo: {
      src: sampleMediaRef("computer-lab"),
      alt: "Sample computer laboratory photo, not an Old Boys' event",
      label: "Illustrative school setting · not an Old Boys' event",
      tone: "navy-2",
    },
  },
];

export const numbers: NumberSeed[] = [
  { value: "1943", label: "Founded by the Comboni Missionaries" },
  { value: "1960", label: "Became a secondary school" },
  { value: "6", label: "Sports associated with the college" },
  { value: "O + A", label: "UCE and UACE classes" },
];

export const learningLabel = "Learning resources";
export const learningHeading = "Where the learning happens";
export const learningIntro =
  "The school has science labs, a computer lab, a library, a clinic, school transport and a chapel.";

export const learningRows: LearningRowSeed[] = [
  {
    number: "01",
    title: "Science laboratories",
    body: "Hands-on work that helped the school's team to silver at the 2025 National Science Fair.",
    facts: ["Verified facility", "Practical learning example · sample wording"],
    photo: {
      src: sampleMediaRef("science-lab"),
      alt: "Laboratory glassware with a test tube held above a bowl",
      label: "Photo · Science laboratory, wide shot",
      tone: "navy",
    },
  },
  {
    number: "02",
    title: "Computer lab",
    body: "Sample description: a computer lab can support digital learning and research.",
    facts: ["Verified facility", "Access details: sample wording"],
    photo: {
      src: sampleMediaRef("computer-lab"),
      alt: "Desktop computers in an empty computer laboratory",
      label: "Photo · Computer lab",
      tone: "green",
    },
  },
  {
    number: "03",
    title: "Library",
    body: "Restocked with help from the Old Boys' Association.",
    facts: ["Verified facility", "Opening details: sample wording"],
    photo: {
      src: sampleMediaRef("library"),
      alt: "An empty library aisle and study desk beside a window",
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
      src: sampleMediaRef("rugby"),
    },
  },
  {
    name: "Football",
    photo: {
      alt: "Two players contesting a ball in an outdoor football match",
      label: "Photo",
      tone: "green",
      ratio: "4/3",
      src: sampleMediaRef("football"),
    },
  },
  {
    name: "Track",
    photo: {
      alt: "A runner on a red outdoor athletics track",
      label: "Photo",
      tone: "tint",
      ratio: "1/1",
      src: sampleMediaRef("track"),
    },
  },
  {
    name: "Tennis",
    photo: {
      alt: "Players in a tennis game on an outdoor court",
      label: "Photo",
      tone: "navy",
      ratio: "4/5",
      src: sampleMediaRef("tennis"),
    },
  },
  {
    name: "Volleyball",
    photo: {
      alt: "Players competing at the net in an indoor volleyball game",
      label: "Photo",
      tone: "mist",
      ratio: "4/3",
      src: sampleMediaRef("volleyball"),
    },
  },
  {
    name: "Basketball",
    photo: {
      alt: "Players contesting a jump shot during a basketball game",
      label: "Photo",
      tone: "navy-2",
      ratio: "3/4",
      src: sampleMediaRef("basketball"),
    },
  },
  {
    name: "Sample rugby photo",
    photo: {
      src: sampleMediaRef("rugby"),
      alt: "Sample rugby match photo, not a St. Joseph's College team",
      label: "Illustrative sports photo · not a school team",
      tone: "green",
      ratio: "1/1",
    },
  },
  {
    name: "Sample football photo",
    photo: {
      src: sampleMediaRef("football"),
      alt: "Sample football match photo, not a St. Joseph's College team",
      label: "Illustrative sports photo · not a school team",
      tone: "tint",
      ratio: "4/3",
    },
  },
];

export const sportsLabel = "Sports";
export const sportsHeading = "On the field";
export const sportsIntro =
  "Rugby, football, track, tennis, volleyball and basketball.";

export const staff: StaffMemberSeed[] = [
  {
    name: "Charles Ondoga (previously listed)",
    role: "Previously listed as headmaster; current role not verified",
    photo: {
      src: sampleMediaRef("library"),
      alt: "Sample library photo, not a portrait of Charles Ondoga",
      label: "Illustrative school setting · not a portrait",
      tone: "navy",
      ratio: "3/4",
    },
  },
  {
    name: "Sample staff profile",
    role: "Teaching staff · example only",
    photo: {
      src: sampleMediaRef("computer-lab"),
      alt: "Sample computer laboratory photo, not a staff portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "navy-2",
      ratio: "3/4",
    },
  },
  {
    name: "Sample staff profile",
    role: "Teaching staff · example only",
    photo: {
      src: sampleMediaRef("library"),
      alt: "Sample library photo, not a staff portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "green",
      ratio: "3/4",
    },
  },
  {
    name: "Sample staff profile",
    role: "Teaching staff · example only",
    photo: {
      src: sampleMediaRef("science-lab"),
      alt: "Sample science laboratory photo, not a staff portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "tint",
      ratio: "3/4",
    },
  },
  {
    name: "Sample staff profile",
    role: "Teaching staff · example only",
    photo: {
      src: sampleMediaRef("computer-lab"),
      alt: "Sample computer laboratory photo, not a staff portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "mist",
      ratio: "3/4",
    },
  },
  {
    name: "Sample staff profile",
    role: "Teaching staff · example only",
    photo: {
      src: sampleMediaRef("library"),
      alt: "Sample library photo, not a staff portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "navy",
      ratio: "3/4",
    },
  },
];

export const staffLabel = "Staff";
export const staffHeading = "The people who lead";
export const staffIntro =
  "The first profile reflects a previous record; the other profiles are illustrative examples.";

export const honours: HonourSeed[] = [
  {
    year: "2025",
    title: "Silver, National Science Fair",
    line: "Kololo Secondary School, Kampala",
    photo: {
      alt: "Sample science laboratory photo, not a medal-winning team",
      label: "Illustrative science photo · not a school team",
      tone: "tint",
      ratio: "4/3",
      src: sampleMediaRef("science-lab"),
    },
  },
  {
    year: "2025",
    title: "First, Arua regional science fair",
    line: "The route to the nationals",
    photo: {
      alt: "Sample computer laboratory photo, not a science fair stand",
      label: "Illustrative school setting · not a science fair",
      tone: "mist",
      ratio: "4/3",
      src: sampleMediaRef("computer-lab"),
    },
  },
  {
    year: "Demo",
    title: "Illustrative achievement example",
    line: "Layout sample only; not a school result.",
    photo: {
      alt: "Sample library photo, not a school achievement",
      label: "Illustrative example · not a school result",
      tone: "tint",
      ratio: "4/3",
      src: sampleMediaRef("library"),
    },
  },
  {
    year: "Demo",
    title: "Illustrative achievement example",
    line: "Layout sample only; not a school result.",
    photo: {
      alt: "Sample science laboratory photo, not a school achievement",
      label: "Illustrative example · not a school result",
      tone: "mist",
      ratio: "4/3",
      src: sampleMediaRef("science-lab"),
    },
  },
];

export const honoursLabel = "Honours";
export const honoursHeading = "Recent results";
export const honoursIntro =
  "In 2025, the school was first at the Arua regional science fair and won silver at the National Science Fair.";

export type OldBoysSeed = {
  featured: {
    quote?: string;
    name?: string;
    meta?: string;
    photo: PhotoSeed;
  };
  list: {
    name?: string;
    meta?: string;
    photo: PhotoSeed;
  }[];
  joinHref: string;
  joinLabel: string;
};

export const oldBoys: OldBoysSeed = {
  featured: {
    quote:
      "Sample quote for layout only; this is not a real Old Boy's statement.",
    name: "Sample Old Boy · not a real person",
    meta: "Illustrative profile",
    photo: {
      src: sampleMediaRef("computer-lab"),
      alt: "Sample computer laboratory photo, not an Old Boy portrait",
      label: "Illustrative school setting · not a portrait",
      tone: "navy",
      ratio: "4/3",
    },
  },
  list: [
    {
      name: "Sample Old Boy · not a real person",
      meta: "Illustrative profile",
      photo: {
        src: sampleMediaRef("library"),
        alt: "Sample library photo, not an Old Boy portrait",
        label: "Illustrative school setting · not a portrait",
        tone: "navy-2",
        ratio: "1/1",
      },
    },
    {
      name: "Sample Old Boy · not a real person",
      meta: "Illustrative profile",
      photo: {
        src: sampleMediaRef("computer-lab"),
        alt: "Sample computer laboratory photo, not an Old Boy portrait",
        label: "Illustrative school setting · not a portrait",
        tone: "green",
        ratio: "1/1",
      },
    },
    {
      name: "Sample Old Boy · not a real person",
      meta: "Illustrative profile",
      photo: {
        src: sampleMediaRef("library"),
        alt: "Sample library photo, not an Old Boy portrait",
        label: "Illustrative school setting · not a portrait",
        tone: "tint",
        ratio: "1/1",
      },
    },
  ],
  joinHref: "/old-boys",
  joinLabel: "Join the Old Boys group",
};

export const oldBoysLabel = "Old Boys";
export const oldBoysHeading = "Ombacians, wherever they go";
export const oldBoysIntro =
  "The Ombaci Old Boys' Association has supported an ICT lab and library stock.";

export const newsStrip = {
  enabled: false,
  label: "News",
  heading: "From the college",
} as const;

export const admissions = {
  label: "Admissions",
  title: "Senior One.",
  accent: "Senior Five.",
  body: "Applications are for Senior One and Senior Five. Sample application dates and requirements are not official; contact the school for current details.",
  href: "/apply",
  buttonLabel: "How to apply",
} as const;

export const homePageDefaults = {
  hero,
  numbersLabel,
  panels,
  numbers,
  learningLabel,
  learningHeading,
  learningIntro,
  learningRows,
  sportsLabel,
  sportsHeading,
  sportsIntro,
  sports,
  staffLabel,
  staffHeading,
  staffIntro,
  staff,
  honoursLabel,
  honoursHeading,
  honoursIntro,
  honours,
  oldBoysLabel,
  oldBoysHeading,
  oldBoysIntro,
  oldBoys,
  newsStrip,
  admissions,
} satisfies PageFields<typeof homePageSchema.fields>;
