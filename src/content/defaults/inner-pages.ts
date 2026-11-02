import { sampleMediaRef } from "./sample-media";
import type { ImagePhoto } from "../schemas";

const samplePhoto = {
  src: sampleMediaRef("library"),
  alt: "Sample library photo, not a school photograph",
  label: "Illustrative sample photo · not a school photograph",
  tone: "navy",
};

const story = (
  title: string,
  lead: string,
  body: string,
  heroImage: ImagePhoto = samplePhoto,
) => ({
  title,
  lead,
  heroImage,
  body,
  seo: {},
});

const info = (title: string, lead: string, body: string) => ({
  title,
  lead,
  body,
  contents: [],
  seo: {},
});

export const innerPageDefaults: Record<string, Record<string, unknown>> = {
  about: story(
    "About the college",
    "A Catholic boys' boarding school in Ombaci, Arua City, in Uganda's West Nile region.",
    `<p>St. Joseph's College, Ombaci is a Catholic boys' boarding school in Arua City, Uganda. The school is in Ombaci, in Ayivu Division, West Nile.</p><p>The Comboni Missionaries founded the school in 1943 as a technical school. It became a secondary school in 1960. The school offers Ordinary level (UCE) and Advanced level (UACE).</p><h2>A place to learn</h2><p>Learning gives young people knowledge and helps them prepare for what comes next. The college has science laboratories, a computer lab and a library. The subject examples on this site are clearly marked as samples and are not confirmed college offerings.</p><h2>Faith and boarding</h2><p>The college is Catholic and offers boarding for boys. The chapel is one of the school's verified facilities. This sample page does not describe current boarding routines, pastoral care or school policies; contact the college for practical information.</p><h2>Shared purpose</h2><p>The college's motto is Primus Inter Pares, meaning first among equals. A school community brings together learners, families and staff around education and shared responsibility. This sample wording is not an approved statement of current school priorities.</p><h2>Location</h2><p>The college is in Ombaci, Ayivu Division, Arua City, West Nile, Uganda. Use the address on this page as a general location; an exact map pin has not been supplied.</p><p>For current information, use the WhatsApp contact shown on this site. Sample contact details elsewhere on this site are not verified.</p>`,
  ),
  history: info(
    "A history of learning",
    "The college began in 1943 and became a secondary school in 1960.",
    `<p>St. Joseph's College, Ombaci has served learners in Arua City since 1943. The milestones below use the verified school history available for this website.</p><p>This sample history includes only the verified milestones shown here; it does not add other dates or events.</p>`,
  ),
  leadership: story(
    "School leadership",
    "Meet the people who guide the college and its work.",
    `<p>This sample page introduces the leadership section without claiming current appointments or providing unapproved biographies.</p><p>A previous school record identified Charles Ondoga as headmaster from 2018. This does not confirm his current role.</p><p>Sample leadership profiles are for layout only and do not identify actual staff members.</p>`,
  ),
  admissions: info(
    "How to join",
    "Find out how to ask about joining St. Joseph's College, Ombaci.",
    `<p>Applications are for Senior One and Senior Five. Please contact the school to confirm whether applications are open and to ask about current requirements.</p><h2>1. Choose an entry class</h2><p>Ask whether Senior One or Senior Five is the right entry point for the applicant.</p><h2>2. Gather the required information</h2><p>This sample page does not list application documents or entry requirements. Contact the school for the current process.</p><h2>3. Apply</h2><p>Use the online application when applications are open, or contact the school for help.</p><h2>4. Hear from the school</h2><p>This sample page does not state application deadlines or response times. Contact the school before making plans.</p>`,
  ),
  requirements: info(
    "Admission requirements",
    "Contact the school for the current entry criteria and required documents.",
    `<p>Entry requirements can change. Contact the admissions office before preparing an application.</p><h2>Entry criteria</h2><p>This sample page does not state selection criteria or required results. Ask the school for the current requirements for Senior One and Senior Five.</p><h2>What a boarder brings</h2><p>This sample page does not provide a clothing, bedding or study-material list. Request the current list from the school before packing.</p><h2>Questions</h2><p>Use the WhatsApp contact shown on this site to ask the school for guidance. Other sample contact details are not verified.</p>`,
  ),
  fees: info(
    "School fees",
    "Please contact the school for current fees and other charges.",
    `<p>SAMPLE ONLY: This example page does not provide a fee schedule or state any school charges. Contact the college to confirm current amounts and approved payment methods before making a payment.</p><table><thead><tr><th scope="col">Sample item</th><th scope="col">Amount</th><th scope="col">Details</th></tr></thead><tbody><tr><th scope="row">Example school fee</th><td>Not provided</td><td>Illustrative row only; not an actual fee</td></tr><tr><th scope="row">Example other charge</th><td>Not provided</td><td>Illustrative row only; not an actual charge</td></tr></tbody></table><h2>Ask before making a payment</h2><p>Contact the school directly to confirm any amount and the approved payment method. Do not rely on a sample fee page.</p>`,
  ),
  "term-dates": info(
    "Term dates",
    "Term dates are confirmed by the school and will be updated here.",
    `<p>SAMPLE ONLY: This page is not a school calendar and does not announce term dates.</p><p>Please contact the school before making travel plans.</p>`,
  ),
  faqs: {
    title: "Questions and answers",
    lead: "Answers to common questions about the college. Contact the school when a detail needs confirmation.",
    emptyMessage:
      "There are no questions to show right now. Please contact the school.",
    seo: {},
  },
  apply: {
    title: "Online application",
    lead: "Applications are available for Senior One and Senior Five when the school is accepting them.",
    body: `<p>Use this page to ask about applying to St. Joseph's College, Ombaci. This sample page does not announce application dates or requirements.</p>`,
    closedMessage:
      "Applications are not open at this time. Please contact the school for current information.",
    consentText:
      "<p>SAMPLE ONLY: This consent wording has not been approved by the school or its adviser. Do not accept applications until the school approves the final wording and privacy information.</p>",
    seo: {},
  },
  academics: story(
    "Learning at Ombaci",
    "The college offers Ordinary level (UCE) and Advanced level (UACE).",
    `<p>St. Joseph's College, Ombaci is a secondary school for boys. The college offers Ordinary level (UCE) and Advanced level (UACE).</p><h2>Ordinary level</h2><p>O-level is an important stage of secondary education. Students build knowledge across their subjects and prepare for the next step in their studies. Sample subject examples on this site include English, Mathematics, Biology, Chemistry, Physics, Geography and History; they are not confirmed college offerings.</p><h2>Advanced level</h2><p>A-level gives students the chance to continue their studies after UCE. Students work towards UACE. Sample subjects and combinations on this site are illustrative only; families should confirm current options with the academic office before making a choice.</p><h2>Study resources</h2><p>The school's verified facilities include science laboratories, a computer lab and a library. This sample page does not state current equipment, access or opening arrangements.</p>`,
    {
      ...samplePhoto,
      src: sampleMediaRef("science-lab"),
      alt: "Laboratory glassware with a test tube held above a bowl",
      label: "Science laboratory sample photo",
    },
  ),
  "o-level": {
    title: "O-level subjects",
    lead: "The school offers O-level leading to UCE. Confirm the current subject list with the academic office.",
    emptyMessage:
      "Illustrative subject examples are shown below; they are not confirmed college offerings.",
    seo: {},
  },
  "a-level": {
    title: "A-level subjects",
    lead: "The school offers A-level leading to UACE. Confirm current subjects and combinations with the academic office.",
    emptyMessage:
      "Illustrative subject and combination examples are shown below; they are not confirmed college offerings.",
    seo: {},
  },
  "study-resources": {
    title: "Study resources",
    lead: "Explore the college's science laboratories, computer lab and library.",
    emptyMessage: "No study resources are listed in this sample view.",
    seo: {},
  },
  "student-life": story(
    "Student life",
    "School life brings learning, faith and time to grow.",
    `<p>St. Joseph's College, Ombaci is a Catholic boys' boarding school. Boarding brings students together for learning and daily life in one school community. This sample page does not describe current routines or student support arrangements. Contact the college before making boarding plans.</p><h2>Faith</h2><p>The college is Catholic and has a chapel. This sample page does not announce current chapel services or faith activities.</p><h2>Clubs and activities</h2><p>Sample club examples on this site are for layout only; they are not a confirmed list of activities at the college.</p><h2>Sport</h2><p>The sports associated with the college include rugby, football, track, tennis, volleyball and basketball. Sample photos and descriptions do not identify current teams, schedules or participation details.</p><h2>The Ombacian</h2><p>The Ombacian is the school magazine. This sample page does not state a publication schedule or describe how students can contribute.</p>`,
    {
      ...samplePhoto,
      src: sampleMediaRef("students-running"),
      alt: "Students with backpacks approaching a classroom, seen from behind",
      label: "Students walking toward a classroom",
    },
  ),
  boarding: story(
    "Boarding",
    "The college is a boys' boarding school in Arua City.",
    `<p>Boarding gives students a place to live while they study at school. St. Joseph's College, Ombaci is a boarding school for boys.</p><h2>Preparing to board</h2><p>This sample page does not provide arrival arrangements, a packing list, house routines or visiting rules.</p><h2>Support and wellbeing</h2><p>This sample page does not describe student care or health support arrangements.</p><p>Please contact the school for current boarding information.</p>`,
  ),
  clubs: {
    title: "Clubs and activities",
    lead: "Clubs give students a chance to learn and take part beyond the classroom.",
    emptyMessage: "No club entries are listed in this sample view.",
    seo: {},
  },
  sports: {
    title: "Sport at Ombaci",
    lead: "The sports associated with the college include rugby, football, track, tennis, volleyball and basketball.",
    emptyMessage: "There are no sports entries to show right now.",
    seo: {},
  },
  staff: {
    title: "Staff",
    lead: "Meet the people who teach and support the college community.",
    emptyMessage: "No staff profiles are listed in this sample view.",
    seo: {},
  },
  achievements: {
    title: "Achievements",
    lead: "The available school information records science fair results from 2025.",
    emptyMessage: "No achievement entries are listed in this sample view.",
    seo: {},
  },
  "old-boys": story(
    "Ombaci Old Boys",
    "The Ombaci Old Boys' Association keeps former students connected with the college.",
    `<p>The Ombaci Old Boys' Association brings former students together. The association has supported the college by funding an ICT lab and library stock.</p><h2>Stay connected</h2><p>This sample page does not include an association link or contact person.</p><h2>Annual dinner</h2><p>This sample page does not announce a dinner date, venue or booking details.</p><h2>Support the college</h2><p>Past support has included an ICT lab and library stock. This sample page does not announce current giving priorities or payment arrangements.</p>`,
  ),
  "old-boys-profiles": {
    title: "Old Boys' profiles",
    lead: "Profiles will be added when former students have approved their details.",
    emptyMessage: "There are no approved Old Boys' profiles to show right now.",
    seo: {},
  },
  news: {
    title: "News",
    lead: "Updates will be shared here when they are approved for publication.",
    emptyMessage: "There are no news articles to show right now.",
    seo: {},
  },
  notices: {
    title: "Notices",
    lead: "Read current information shared by the school.",
    emptyMessage: "There are no current notices.",
    seo: {},
  },
  events: {
    title: "Events",
    lead: "See school events and dates confirmed by the college.",
    emptyMessage: "There are no confirmed events to show right now.",
    seo: {},
  },
  gallery: {
    title: "Gallery",
    lead: "Photos will be shared here when they are approved for publication.",
    emptyMessage: "There are no photo albums to show right now.",
    seo: {},
  },
  contact: {
    title: "Contact the college",
    lead: "Contact St. Joseph's College, Ombaci for current information.",
    formIntro:
      "Send a question to the school. This sample page does not promise a response time.",
    seo: {},
  },
  "not-found": {
    title: "Page not found",
    lead: "The page you are looking for may have moved or may no longer be available.",
    body: "<p>Use one of these pages to continue your visit.</p>",
    links: [
      { label: "Admissions", href: "/admissions" },
      { label: "Contact", href: "/contact" },
    ],
    seo: {},
  },
  privacy: story(
    "Privacy notice",
    "SAMPLE ONLY — not an approved or legally reviewed privacy notice.",
    `<p><strong>SAMPLE PRIVACY NOTICE — not approved or legally reviewed.</strong></p><p>This illustrative text does not describe the school's final data practices, legal basis, retention periods or data subject rights. Do not rely on it as an approved privacy notice.</p>`,
  ),
  terms: story(
    "Website terms",
    "SAMPLE ONLY — not approved or legally reviewed website terms.",
    `<p><strong>SAMPLE WEBSITE TERMS — not approved or legally reviewed.</strong></p><p>This illustrative text does not state the school's final terms, ownership wording or legal contact. Do not rely on it as approved legal advice.</p>`,
  ),
  accessibility: story(
    "Accessibility",
    "SAMPLE ONLY — not an approved school accessibility statement.",
    `<p><strong>SAMPLE ACCESSIBILITY STATEMENT — not approved by the school.</strong></p><p>This illustrative text does not describe a completed accessibility audit or the school's final feedback process.</p>`,
  ),
};
