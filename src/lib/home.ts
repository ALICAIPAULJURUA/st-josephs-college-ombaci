import {
  honours as seedHonours,
  learningRows as seedLearningRows,
  numbers as seedNumbers,
  oldBoys as seedOldBoys,
  panels as seedPanels,
  sports as seedSports,
  staff as seedStaff,
  type HonourSeed,
  type LearningRowSeed,
  type NumberSeed,
  type OldBoysSeed,
  type PanelSeed,
  type SportSeed,
  type StaffMemberSeed,
} from "@/content/defaults/home";

export type HomeData = {
  panels: PanelSeed[];
  numbers: NumberSeed[];
  learningRows: LearningRowSeed[];
  sports: SportSeed[];
  staff: StaffMemberSeed[];
  honours: HonourSeed[];
  oldBoys: OldBoysSeed;
};

export async function getHomeData(): Promise<HomeData> {
  return {
    panels: seedPanels,
    numbers: seedNumbers,
    learningRows: seedLearningRows,
    sports: seedSports,
    staff: seedStaff,
    honours: seedHonours,
    oldBoys: seedOldBoys,
  };
}
