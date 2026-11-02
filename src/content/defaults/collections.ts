import { sampleMediaRef } from "./sample-media";

type SeedItem = {
  slug: string;
  fields: Record<string, unknown>;
  status?: "published" | "hidden";
};

const photo = {
  src: sampleMediaRef("library"),
  alt: "Sample library photo, used for layout only",
  label: "Illustrative sample photo · replace with approved school image",
  tone: "navy",
};

const paragraph = (text: string) => `<p>${text}</p>`;

export const collectionDefaults: Record<string, readonly SeedItem[]> = {
  timeline: [
    {
      slug: "1943",
      fields: {
        year: "1943",
        title: "A technical school is founded",
        summary:
          "The Comboni Missionaries founded St. Joseph's College, Ombaci as a technical school.",
        photo,
      },
    },
    {
      slug: "1960",
      fields: {
        year: "1960",
        title: "The school becomes secondary",
        summary: "St. Joseph's College, Ombaci became a secondary school.",
        photo,
      },
    },
  ],
  facilities: [
    {
      slug: "science-laboratories",
      fields: {
        title: "Science laboratories",
        slug: "science-laboratories",
        order: 1,
        summary: "The college has science laboratories.",
        body: paragraph(
          "Science laboratories give students a place to explore ideas through practical learning. The college has science laboratories. Sample description only: contact the school for confirmed equipment and access arrangements.",
        ),
        facts: ["Science laboratories"],
        photo: {
          ...photo,
          src: sampleMediaRef("science-lab"),
          alt: "Laboratory glassware with a test tube held above a bowl",
          label: "Science laboratories",
        },
        featured: true,
      },
    },
    {
      slug: "computer-lab",
      fields: {
        title: "Computer lab",
        slug: "computer-lab",
        order: 2,
        summary: "The college has a computer lab.",
        body: paragraph(
          "A computer lab provides space to use digital tools for learning. The college has a computer lab. Sample description only: contact the school for confirmed equipment and student access arrangements.",
        ),
        facts: ["Computer lab"],
        photo: {
          ...photo,
          src: sampleMediaRef("computer-lab"),
          alt: "Desktop computers in an empty computer laboratory",
          label: "Computer lab",
        },
        featured: true,
      },
    },
    {
      slug: "library",
      fields: {
        title: "Library",
        slug: "library",
        order: 3,
        summary: "The college has a library.",
        body: paragraph(
          "A library supports reading, study and research. The college has a library. Sample description only: contact the school for confirmed opening times, materials and access arrangements.",
        ),
        facts: ["Library"],
        photo: {
          ...photo,
          src: sampleMediaRef("library"),
          alt: "An empty library aisle and study desk beside a window",
          label: "Library",
        },
        featured: true,
      },
    },
    ...(
      [
        ["clinic", "Clinic"],
        ["school-transport", "School transport"],
        ["chapel", "Chapel"],
      ] as const
    ).map(([slug, name], index) => ({
      slug,
      fields: {
        title: name,
        slug,
        order: index + 4,
        summary: `The college has a ${name.toLowerCase()}.`,
        body: paragraph(
          `Sample description only: the college has a ${name.toLowerCase()}. Contact the school for confirmed services and access arrangements.`,
        ),
        facts: [name],
        photo: { ...photo, label: name },
        featured: false,
      },
    })),
  ],
  sports: [
    {
      slug: "rugby",
      fields: {
        title: "Rugby",
        slug: "rugby",
        summary: "Rugby is one of the sports associated with the college.",
        body: paragraph(
          "Rugby is a team sport that develops communication, movement and shared effort. Players work together, respond to changing play and practise skills over time. It is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current teams, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("rugby"),
              alt: "Sample rugby match photo, not a St. Joseph's College team",
              label: "Illustrative sports photo · not a school team",
            },
          },
        ],
      },
    },
    {
      slug: "football",
      fields: {
        title: "Football",
        slug: "football",
        summary: "Football is one of the sports associated with the college.",
        body: paragraph(
          "Football brings players together to build skill, awareness and teamwork. Players practise movement, passing and making decisions while supporting one another. It is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current teams, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("football"),
              alt: "Sample football match photo, not a St. Joseph's College team",
              label: "Illustrative sports photo · not a school team",
            },
          },
        ],
      },
    },
    {
      slug: "track",
      fields: {
        title: "Track",
        slug: "track",
        summary: "Track is one of the sports associated with the college.",
        body: paragraph(
          "Track events give athletes a chance to practise pace, focus and personal effort. Training can help a runner understand rhythm and build consistency over time. Track is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current events, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("track"),
              alt: "Sample athletics photo, not a St. Joseph's College athlete",
              label: "Illustrative sports photo · not a school athlete",
            },
          },
        ],
      },
    },
    {
      slug: "tennis",
      fields: {
        title: "Tennis",
        slug: "tennis",
        summary: "Tennis is one of the sports associated with the college.",
        body: paragraph(
          "Tennis asks players to combine movement, timing and concentration. Each point gives players a chance to practise control and respond to the ball. Tennis is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current teams, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("tennis"),
              alt: "Sample tennis match photo, not a St. Joseph's College team",
              label: "Illustrative sports photo · not a school team",
            },
          },
        ],
      },
    },
    {
      slug: "volleyball",
      fields: {
        title: "Volleyball",
        slug: "volleyball",
        summary: "Volleyball is one of the sports associated with the college.",
        body: paragraph(
          "Volleyball is a team game built around communication and coordinated play. Players practise timing, movement and supporting the next person in the play. Volleyball is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current teams, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("volleyball"),
              alt: "Sample volleyball match photo, not a St. Joseph's College team",
              label: "Illustrative sports photo · not a school team",
            },
          },
        ],
      },
    },
    {
      slug: "basketball",
      fields: {
        title: "Basketball",
        slug: "basketball",
        summary: "Basketball is one of the sports associated with the college.",
        body: paragraph(
          "Basketball combines movement, passing and teamwork. Players use space, communicate and make decisions as play moves around the court. Basketball is one of the sports associated with St. Joseph's College, Ombaci. Sample information only: contact the school for current teams, training, facilities and competitions.",
        ),
        teamNotes: [],
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("basketball"),
              alt: "Sample basketball match photo, not a St. Joseph's College team",
              label: "Illustrative sports photo · not a school team",
            },
          },
        ],
      },
    },
  ],
  people: [
    {
      slug: "charles-ondoga",
      fields: {
        name: "Charles Ondoga",
        slug: "charles-ondoga",
        role: "Previously listed as headmaster; current appointment not verified",
        department: "",
        bio: "A previous school record identified Charles Ondoga as headmaster from 2018. This sample profile does not confirm his current role or provide an approved biography.",
        photo: {
          ...photo,
          alt: "Sample library photo, not a portrait of Charles Ondoga",
          label: "Illustrative school setting · not a portrait",
        },
        order: 1,
        leadership: true,
        consentRecorded: false,
      },
    },
  ],
  achievements: [
    {
      slug: "arua-regional-science-fair-2025",
      fields: {
        title: "First at the Arua regional science fair",
        slug: "arua-regional-science-fair-2025",
        year: 2025,
        level: "Regional",
        summary:
          "The available school information records a first-place result at the Arua regional science fair in 2025.",
        body: paragraph(
          "The available school information records St. Joseph's College, Ombaci as first at the Arua regional science fair in 2025. Sample entry: confirm the result against the school's approved records before publication.",
        ),
        photo,
      },
    },
    {
      slug: "national-science-fair-silver-2025",
      fields: {
        title: "Silver at the National Science Fair",
        slug: "national-science-fair-silver-2025",
        year: 2025,
        level: "National",
        summary:
          "The college received a silver medal at the National Science Fair at Kololo Secondary School, Kampala, in 2025.",
        body: paragraph(
          "The available school information records a silver medal for St. Joseph's College, Ombaci at the 2025 National Science Fair, held at Kololo Secondary School in Kampala. Sample entry: confirm the result against the school's approved records before publication.",
        ),
        photo,
      },
    },
  ],
  "old-boys": [
    {
      slug: "ombaci-old-boys-association",
      status: "hidden",
      fields: {
        title: "Ombaci Old Boys' Association",
        slug: "ombaci-old-boys-association",
        role: "Association",
        summary:
          "The association connects former students and has supported the college.",
        body: paragraph(
          "The Ombaci Old Boys' Association has supported the college by funding an ICT lab and library stock. This sample entry does not include association contacts or current giving arrangements.",
        ),
        photo,
        consentRecorded: false,
      },
    },
  ],
  faqs: [
    {
      slug: "where-is-the-school",
      fields: {
        question: "Where is St. Joseph's College, Ombaci?",
        slug: "where-is-the-school",
        answer: paragraph(
          "The college is in Ombaci, Ayivu Division, Arua City, in Uganda's West Nile region.",
        ),
        topic: "contact",
        feedsAssistant: true,
      },
    },
    {
      slug: "what-kind-of-school",
      fields: {
        question: "What kind of school is Ombaci?",
        slug: "what-kind-of-school",
        answer: paragraph(
          "St. Joseph's College, Ombaci is a Catholic boys' boarding school.",
        ),
        topic: "admissions",
        feedsAssistant: true,
      },
    },
    {
      slug: "which-levels",
      fields: {
        question: "Which levels does the college offer?",
        slug: "which-levels",
        answer: paragraph(
          "The college offers Ordinary level (UCE) and Advanced level (UACE).",
        ),
        topic: "academics",
        feedsAssistant: true,
      },
    },
    {
      slug: "how-to-apply",
      fields: {
        question: "How do I apply?",
        slug: "how-to-apply",
        answer: paragraph(
          "Applications are for Senior One and Senior Five when the school is accepting them. Please contact the school to confirm whether applications are open and what to prepare.",
        ),
        topic: "admissions",
        feedsAssistant: true,
      },
    },
    {
      slug: "when-was-founded",
      fields: {
        question: "When was the school founded?",
        slug: "when-was-founded",
        answer: paragraph(
          "The Comboni Missionaries founded the school in 1943 as a technical school.",
        ),
        topic: "academics",
        feedsAssistant: true,
      },
    },
    {
      slug: "when-secondary-school",
      fields: {
        question: "When did it become a secondary school?",
        slug: "when-secondary-school",
        answer: paragraph("The school became a secondary school in 1960."),
        topic: "academics",
        feedsAssistant: true,
      },
    },
    {
      slug: "fees",
      fields: {
        question: "How much are the school fees?",
        slug: "fees",
        answer: paragraph(
          "Please contact the school for current fees. The website does not have a confirmed fee schedule.",
        ),
        topic: "admissions",
        feedsAssistant: true,
      },
    },
    {
      slug: "term-dates",
      fields: {
        question: "When does the next term begin?",
        slug: "term-dates",
        answer: paragraph(
          "Please contact the school for the current term dates. The school has not confirmed the current calendar.",
        ),
        topic: "admissions",
        feedsAssistant: true,
      },
    },
    {
      slug: "subjects",
      fields: {
        question: "Which subjects can students study?",
        slug: "subjects",
        answer: paragraph(
          "The current subject list and A-level combinations need confirmation. Please contact the academic office.",
        ),
        topic: "academics",
        feedsAssistant: true,
      },
    },
    {
      slug: "boarding",
      fields: {
        question: "Is the college a boarding school?",
        slug: "boarding",
        answer: paragraph(
          "Yes. St. Joseph's College, Ombaci is a boys' boarding school. Please contact the college for current boarding arrangements.",
        ),
        topic: "boarding",
        feedsAssistant: true,
      },
    },
    {
      slug: "facilities",
      fields: {
        question: "Which facilities does the college have?",
        slug: "facilities",
        answer: paragraph(
          "The verified facilities include science laboratories, a computer lab, a library, a clinic, school transport and a chapel. Please contact the college to confirm current access and arrangements.",
        ),
        topic: "facilities",
        feedsAssistant: true,
      },
    },
    {
      slug: "sports",
      fields: {
        question: "Which sports are associated with the college?",
        slug: "sports",
        answer: paragraph(
          "The sports associated with the college include rugby, football, track, tennis, volleyball and basketball. Please contact the school to confirm current teams and activities.",
        ),
        topic: "sports",
        feedsAssistant: true,
      },
    },
    {
      slug: "school-phone",
      fields: {
        question: "How can I message the school on WhatsApp?",
        slug: "school-phone",
        answer: paragraph(
          "Message the school on WhatsApp at +256770911635. This number was supplied for the school's WhatsApp button.",
        ),
        topic: "contact",
        feedsAssistant: true,
      },
    },
  ],
  subjects: [
    {
      slug: "o-level-subjects-confirmation",
      fields: {
        title: "Illustrative O-level subject examples",
        slug: "o-level-subjects-confirmation",
        level: "o-level",
        category:
          "Mathematics, English, Biology, Chemistry, Physics, Geography and History — sample subjects, not confirmed college offerings.",
        needsConfirmation: true,
      },
    },
    {
      slug: "a-level-subjects-confirmation",
      fields: {
        title: "Illustrative A-level subject examples",
        slug: "a-level-subjects-confirmation",
        level: "a-level",
        category:
          "Mathematics, Physics, Chemistry, Biology, Geography and History; sample combination: Mathematics, Physics and Chemistry. Not confirmed college offerings.",
        needsConfirmation: true,
      },
    },
  ],
  clubs: [
    {
      slug: "clubs-to-be-confirmed",
      fields: {
        title: "Sample clubs and activities",
        slug: "clubs-to-be-confirmed",
        summary:
          "Illustrative examples only; not a confirmed college programme.",
        body: paragraph(
          "Sample activities for layout: reading, debate and environmental projects. These are examples only and are not confirmed as current college clubs.",
        ),
        photo,
      },
    },
  ],
  news: [
    {
      slug: "science-fair-region-2025-draft",
      status: "hidden",
      fields: {
        title: "Sample news item — regional science fair",
        slug: "science-fair-region-2025-draft",
        date: "Sample draft; no publication date",
        category: "Achievements",
        summary:
          "Illustrative news copy only; not an approved school announcement.",
        body: paragraph(
          "Sample news copy: the available school information records a first-place result at the 2025 Arua regional science fair. Confirm all details with the school before publication.",
        ),
        photo,
        featured: false,
      },
    },
    {
      slug: "national-science-fair-2025-draft",
      status: "hidden",
      fields: {
        title: "Sample news item — National Science Fair",
        slug: "national-science-fair-2025-draft",
        date: "Sample draft; no publication date",
        category: "Achievements",
        summary:
          "Illustrative news copy only; not an approved school announcement.",
        body: paragraph(
          "Sample news copy: the available school information records a silver medal at the 2025 National Science Fair at Kololo Secondary School, Kampala. Confirm all details with the school before publication.",
        ),
        photo,
        featured: false,
      },
    },
    {
      slug: "science-results-2025-draft",
      status: "hidden",
      fields: {
        title: "Sample news item — Ombaci science results",
        slug: "science-results-2025-draft",
        date: "Sample draft; no publication date",
        category: "Achievements",
        summary:
          "Illustrative news copy only; not an approved school announcement.",
        body: paragraph(
          "Sample news copy: the available school information records a first-place result at the Arua regional science fair and a silver medal at the National Science Fair in 2025. Confirm all details with the school before publication.",
        ),
        photo,
        featured: false,
      },
    },
  ],
  notices: [
    {
      slug: "example-notice",
      status: "hidden",
      fields: {
        title: "Sample notice — not a current school notice",
        slug: "example-notice",
        body: paragraph(
          "This illustrative notice does not announce a real event, policy or deadline.",
        ),
        startsOn: "",
        expiresOn: "",
        pinned: false,
      },
    },
  ],
  events: [
    {
      slug: "st-josephs-day",
      status: "published",
      fields: {
        title: "St. Joseph's Day",
        slug: "st-josephs-day",
        eventDate: "Sample event; no school date announced",
        summary: "Illustrative event entry; not a confirmed school event.",
        body: paragraph(
          "Sample event content for layout only. This entry does not announce a school event or date.",
        ),
        photo,
      },
    },
  ],
  gallery: [
    {
      slug: "sample-album",
      status: "hidden",
      fields: {
        title: "Sample album — illustrative photos only",
        slug: "sample-album",
        date: "",
        summary:
          "Illustrative album using licensed sample images; not photographs of the college.",
        photos: [
          {
            photo: {
              ...photo,
              src: sampleMediaRef("library"),
              alt: "Sample library photo, not a photograph of the college",
              label: "Illustrative sample photo · not a school photograph",
            },
          },
          {
            photo: {
              ...photo,
              src: sampleMediaRef("science-lab"),
              alt: "Sample science laboratory photo, not a photograph of the college",
              label: "Illustrative sample photo · not a school photograph",
            },
          },
        ],
        consentRecorded: false,
        isSample: true,
      },
    },
  ],
  "extra-pages": [],
};
