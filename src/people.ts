import { AppState } from "./app-state";
import { populateSkillSelector, SkillName, Student } from "./util";

type SortMode = 'alphabetically' | 'skill';

/** Logic for the people list on the left side of the UI. */
export class PeopleController {
  private readonly listContainer: HTMLElement;
  private readonly groupBreak: HTMLElement;
  private readonly hintEmptyGroup: HTMLElement;

  private readonly aliasToElementMap = new Map<string, HTMLElement>();
  private readonly aliasToStudentMap = new Map<string, Student>();

  private sortMode: SortMode = 'alphabetically';
  private displayedSkill: SkillName | null = null;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('PeopleController initialized with:', element);

    this.listContainer = element.querySelector("#people-list");
    this.groupBreak = element.querySelector("#group-break");
    this.hintEmptyGroup = element.querySelector('#hint-empty-group');

    const sortSelector = element.querySelector<HTMLSelectElement>('.people-sort-selector');
    sortSelector.selectedIndex = 0;
    sortSelector.addEventListener('change', () => {
      this.setSortMode(<SortMode>sortSelector.value);
    });

    const skillSelector = element.querySelector<HTMLSelectElement>('.people-skill-selector');
    populateSkillSelector(skillSelector);
    skillSelector.selectedIndex = 0;
    skillSelector.addEventListener('change', () => {
      this.setDisplayedSkill(<SkillName>skillSelector.value || null);
      // Make the "sort by" selector only available if a skill is selected.
      if (this.displayedSkill) {
        sortSelector.disabled = false;
      } else {
        sortSelector.selectedIndex = 0;
        sortSelector.disabled = true;
        this.setSortMode('alphabetically');
      }
    });

    this.appState.observeActive(newActive => {
      // Find div and style it
      for (const elt of this.aliasToElementMap.values()) {
        elt.classList.remove('activeStudent');
      }
      const activeElt = this.getStudentElt(newActive);
      if (activeElt) {
        activeElt.classList.add('activeStudent');
      }
    });

    for (const student of this.appState.students) {
      this.createStudentElement(student);
    }
    this.refreshList();
  }

  setSortMode(mode: SortMode) {
    this.sortMode = mode;
    this.refreshList();
  }

  setDisplayedSkill(skill: SkillName | null) {
    this.displayedSkill = skill;

    for (const student of this.aliasToStudentMap.values()) {
      const valueElt = this.getStudentElt(student).querySelector<HTMLElement>('.skill-value');
      valueElt.textContent = skill ? String(student[skill]) : '';
      valueElt.title = skill;
    }
    this.refreshList();
  }

  /**
   * Puts all student elements into the listContainer in the right order.
   * Must be called whenever the sorting potentially changed.
   */
  private refreshList() {
    let comparator: (a: Student, b: Student) => number;
    switch (this.sortMode) {
      case 'alphabetically':
        comparator = (a, b) => a.Alias.localeCompare(b.Alias);
        break;
      case 'skill':
        // Sorts descending.
        comparator = (a, b) => b[this.displayedSkill] - a[this.displayedSkill];
        break;
      default:
        throw new Error('unknown sort mode: ' + this.sortMode);
    }

    // Sort both partitions separately.
    const sortedInGroup = this.appState.selected.slice().sort(comparator);
    const sortedOutGroup = Array.from(this.aliasToStudentMap.values())
      .filter(student => !sortedInGroup.includes(student))
      .sort(comparator);

    for (const student of sortedInGroup) {
      const elt = this.getStudentElt(student);
      this.listContainer.appendChild(elt);
    }
    this.listContainer.appendChild(this.groupBreak);
    for (const student of sortedOutGroup) {
      const elt = this.getStudentElt(student);
      this.listContainer.appendChild(elt);
    }

    this.hintEmptyGroup.style.display = sortedInGroup.length ? 'none' : 'block';
  }

  private createStudentElement(student: Student): HTMLElement {
    let tmp: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("student-template");
    let frag: DocumentFragment = <DocumentFragment>tmp.content.cloneNode(true)
    let stdElt: HTMLElement = <HTMLElement>frag.firstElementChild;
    stdElt.innerHTML = stdElt.innerHTML.replace("${alias}", student.Alias);
    stdElt.dataset["alias"] = student.Alias;

    // Create button functions
    let button = stdElt.querySelector(".toggle-group-button");
    button.addEventListener("click", e => {
      e.stopPropagation();
      if (button.classList.contains("bi-person-plus")) {
        this.addToGroup(student);
      } else {
        this.removeFromGroup(student);
      }
    });

    stdElt.addEventListener('click', () => {
      if (this.appState.active === student) {
        this.appState.setActiveStudent(null);
      } else {
        this.appState.setActiveStudent(student);
      }
    });

    this.aliasToElementMap.set(student.Alias, stdElt);
    this.aliasToStudentMap.set(student.Alias, student);
    return stdElt;
  }

  addToGroup(student: Student): void {
    let elt: HTMLElement = this.getStudentElt(student);

    this.listContainer.insertBefore(elt, this.groupBreak);

    elt.classList.add("in-group");

    let button = elt.querySelector("i");
    button.classList.remove("bi-person-plus");
    button.classList.add("bi-person-dash");
    button.title = 'Remove from group';

    // Add student to AppState
    this.appState.addSelectedStudent(student);
    this.refreshList();
  }

  removeFromGroup(student: Student): void {
    let elt: HTMLElement = this.getStudentElt(student);
    this.listContainer.insertBefore(elt, this.groupBreak);
    this.listContainer.insertBefore(this.groupBreak, elt);

    elt.classList.remove("in-group");

    let button = elt.querySelector("i");
    button.classList.remove("bi-person-dash");
    button.classList.add("bi-person-plus");
    button.title = 'Add to group';

    // Remove student from AppState
    this.appState.removeSelectedStudent(student);
    this.refreshList();
  }

  private getStudentElt(student: Student | null): HTMLElement {
    return this.aliasToElementMap.get(student?.Alias);
  }
}
