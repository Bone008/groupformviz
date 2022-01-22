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

/** Shared global state between all controllers. */
export class AppState {
  constructor() {
    var students: Student[] = Data;
    console.log(students)

    var selected: Student[] = []
  }
  // TODO: Add fields to store current students in group, selected student, ...
  // Maybe also functions like isInGroup(student).
}
