//@ts-ignore
import * as Data from './responses.csv'
import { Student } from './util';

export const ALL_SKILLS = [
  'VizSkills', 'Statistics', 'Math', 'Art', 'Computer', 'Programming', 'ComputerGraphics', 'Hci', 'Ux', 'Communication', 'Collaboration', 'Repository',
  "ComputerGraphics", "Statistics", "Hci", "Math", "Ux", "Art", "Computer", "VizSkills", "Programming"
] as const;

export type ObserverCallback<T> = (value: T) => void;


/** Shared global state between all controllers. */
export class AppState {
  readonly students: Student[] = Data;
  public selected: Student[] = [];
  /** The student that is currently selected to be shown in the details view. */
  public active: Student | null = null;

  private selectedObservers: ObserverCallback<Student[]>[] = [];
  private activeObservers: ObserverCallback<Student>[] = [];

  constructor() {
    // Pre-processing
    this.students.forEach(student => {
      student.Alias = student.Alias.trim();
      student.University = student.University || 'KTH';
    });
  }

  addSelectedStudent(student: Student) {
    if (this.selected.includes(student)) { return }
    this.selected.push(student);
    this.notifySelected();
  }

  removeSelectedStudent(student: Student): boolean {
    const index = this.selected.indexOf(student);
    if (index !== -1) {
      this.selected.splice(index, 1);
      this.notifySelected();
      return true;
    }
    return false;
  }

  private notifySelected() {
    for (const observer of this.selectedObservers) {
      observer(this.selected);
    }
  }

  /** Adds a callback that is called whenever the array of selected students is changed. */
  observeSelected(observer: ObserverCallback<Student[]>) {
    this.selectedObservers.push(observer);
  }

  observeActive(observer: ObserverCallback<Student>) {
    this.activeObservers.push(observer);
  }

  setActiveStudent(newActive: Student | null) {
    this.active = newActive;
    this.activeObservers.forEach(observer => observer(this.active));
  }
}
