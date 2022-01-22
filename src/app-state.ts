//@ts-ignore
import * as Data from './responses.csv'

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
  StatisticsSkills: number;
  MathsSkills: number;
  ComputerUsageSkills: number;
  ProgrammingSkills: number;
  ComputerGraphics: number;
  Hci: number;
  Ux: number;
  Collaboration: number; 
  Repository: number;
  ThesisStatus: string;
  FiveYears: string
}

/** Shared global state between all controllers. */
export class AppState {
  students: Student[] = Data;
  constructor() {
    console.log(this.students)

    var selected: Student[] = []
  }
  // TODO: Add fields to store current students in group, selected student, ...
  // Maybe also functions like isInGroup(student).
}
