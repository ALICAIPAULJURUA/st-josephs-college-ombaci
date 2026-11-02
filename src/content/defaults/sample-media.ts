export const sampleMedia = [
  {
    name: "science-lab",
    id: "00000000-0000-4000-8000-000000000001",
    fileName: "science-lab.jpg",
    alt: "Laboratory glassware with a test tube held above a bowl",
    credit: "Photo by Mikhail Nilov on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/pincers-holding-test-tube-over-bowl-9243559/",
    hasPeople: false,
  },
  {
    name: "computer-lab",
    id: "00000000-0000-4000-8000-000000000002",
    fileName: "computer-lab.jpg",
    alt: "Desktop computers in an empty computer laboratory",
    credit: "Photo by Ivan Chumak on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/modern-computer-lab-with-empty-workstations-39178044/",
    hasPeople: false,
  },
  {
    name: "library",
    id: "00000000-0000-4000-8000-000000000003",
    fileName: "library.jpg",
    alt: "An empty library aisle and study desk beside a window",
    credit: "Photo by Muffled Coffee on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/quiet-library-aisle-with-study-desk-by-window-39903736/",
    hasPeople: false,
  },
  {
    name: "students-running",
    id: "00000000-0000-4000-8000-000000000004",
    fileName: "students-running.jpg",
    alt: "Students with backpacks approaching a classroom, seen from behind",
    credit: "Photo by RDNE Stock project on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/back-view-shot-of-students-running-to-their-classroom-8500353/",
    hasPeople: true,
  },
  {
    name: "rugby",
    id: "00000000-0000-4000-8000-000000000005",
    fileName: "rugby.jpg",
    alt: "Players competing in a rugby match on a grass field",
    credit: "Photo by Thiago Sepulveda on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/intense-rugby-match-in-action-on-sunny-day-39704273/",
    hasPeople: true,
  },
  {
    name: "football",
    id: "00000000-0000-4000-8000-000000000006",
    fileName: "football.jpg",
    alt: "Two players contesting a ball in an outdoor football match",
    credit: "Photo by Franco Monsalvo on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/intense-soccer-match-tackle-action-outdoors-38454829/",
    hasPeople: true,
  },
  {
    name: "track",
    id: "00000000-0000-4000-8000-000000000007",
    fileName: "track.jpg",
    alt: "A runner on a red outdoor athletics track",
    credit: "Photo by Bohdan Hyrovych on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/runner-on-red-track-in-sunny-outdoor-stadium-37718409/",
    hasPeople: true,
  },
  {
    name: "tennis",
    id: "00000000-0000-4000-8000-000000000008",
    fileName: "tennis.jpg",
    alt: "Players in a tennis game on an outdoor court",
    credit: "Photo by Leonard Antasari on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/action-packed-tennis-match-on-outdoor-court-37090946/",
    hasPeople: true,
  },
  {
    name: "volleyball",
    id: "00000000-0000-4000-8000-000000000009",
    fileName: "volleyball.jpg",
    alt: "Players competing at the net in an indoor volleyball game",
    credit: "Photo by Pavel Danilyuk on Pexels",
    sourceUrl: "https://www.pexels.com/photo/woman-spiking-a-ball-6203581/",
    hasPeople: true,
  },
  {
    name: "basketball",
    id: "00000000-0000-4000-8000-000000000010",
    fileName: "basketball.jpg",
    alt: "Players contesting a jump shot during a basketball game",
    credit: "Photo by Chris wade NTEZICIMPA on Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/competitive-basketball-game-jump-shot-action-32619170/",
    hasPeople: true,
  },
] as const;

export type SampleMediaName = (typeof sampleMedia)[number]["name"];

export function sampleMediaRef(name: SampleMediaName) {
  return `sample:${name}`;
}
