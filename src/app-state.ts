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

export type ObserverCallback<T> = (value: T) => void;


/** Shared global state between all controllers. */
export class AppState {
  readonly students: Student[] = Data
  public selected: Student[] = []
  public hovered: Student|null = null;
  
  /** The student that is currently selected to be shown in the details view. */
  public active: Student|null = null;

  private selectedObservers: ObserverCallback<Student[]>[] = [];
  private hoveredObservers: ObserverCallback<Student>[] = [];
  private activeObservers: ObserverCallback<Student|null>[] = [];

  constructor () {
    this.students.forEach(student => {
      student.Alias = student.Alias.trim();
    });
  }

  addSelectedStudent(student: Student) {
    if (this.selected.includes(student)) { return }
    
    this.selected.push(student);

    if (this.hovered == student) {
      this.hovered = null;
    }

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

  observeHovered(observer: ObserverCallback<Student>) {
    this.hoveredObservers.push(observer);
  }

  observeActive(observer: ObserverCallback<Student>) {
    this.activeObservers.push(observer);
  }

  hoverStudent(student: Student|null){
    if (this.selected.indexOf(student) != -1) { return }

    this.hovered = student;
    this.hoveredObservers.forEach(observer => observer(this.hovered));
  }

  setActiveStudent(newActive: Student|null) {
    this.active = newActive;
    this.activeObservers.forEach(observer => observer(this.active));
  }
}
