import * as d3 from "d3";

export interface Student {
  Timestamp: string;
  Alias: string;
  University: String;
  DegreeStart: number;
  Graduation: string;
  Major: string;
  Degree: string;
  Interests: string;
  Expectations: string;
  RelevantCourses: string;
  Canvas: string;
  VizSkills: number;
  Statistics: number;
  Math: number;
  Art: number;
  Computer: number;
  Programming: number;
  ComputerGraphics: number;
  Hci: number;
  Ux: number;
  Communication: number;
  Collaboration: number;
  Repository: number;
  ThesisStatus: string;
  FiveYears: string
}

/** All the numeric skill column names in the dataset, alphabetically sorted. */
export const ALL_SKILLS = [
  "Art",
  "Collaboration",
  "Communication",
  "Computer",
  "ComputerGraphics",
  "Hci",
  "Math",
  "Programming",
  "Repository",
  "Statistics",
  "Ux",
  "VizSkills",
] as const;

/** A selected subset of the skill column names that we want to visualize. */
export const RELEVANT_SKILLS = [
  "ComputerGraphics",
  "Statistics",
  "Hci",
  "Math",
  "Ux",
  "Art",
  "Computer",
  "VizSkills",
  "Programming",
] as const;

/** Utility function to initialize a skill dropdown control with the list of skills. */
export function populateSkillSelectElement(selectElement: HTMLSelectElement) {
  d3.select(selectElement)
      .selectAll('option')
      .data(ALL_SKILLS)
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);
}
