import { AppState, Student } from "./app-state";

/** Logic for the people list on the left side of the UI. */
export class PeopleController {
  private readonly list: HTMLElement;
  private readonly groupBreak: HTMLElement;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('PeopleController initialized with:', element);

    this.list = element.querySelector("#people-list"); 
    this.groupBreak = element.querySelector("#group-break");
  }


  addStudent (student: Student) : void {
    let tmp: HTMLTemplateElement = <HTMLTemplateElement> document.getElementById("student-template");
    let frag: DocumentFragment = <DocumentFragment>tmp.content.cloneNode(true)
    let stdElt: HTMLElement = <HTMLElement> frag.firstElementChild;
    stdElt.innerHTML = stdElt.innerHTML.replace("${alias}", student.Alias);
    stdElt.dataset["alias"] = student.Alias;

    // Create button functions
    let button = stdElt.querySelector("i");
    button.addEventListener("click", () => {
      if (button.classList.contains("bi-person-plus")){
        this.addToGroup(student);
      } else{
        this.removeFromGroup(student);
      }
    });
    
    stdElt.addEventListener('mouseenter', () => this.appState.hoverStudent(student));
    stdElt.addEventListener('mouseleave', () => this.appState.hoverStudent(null));
    
    this.list.appendChild(stdElt);
  }

  private getStudentElt(student: Student) : HTMLElement {
    for (const c of Array.from(this.list.children)) {
      const child = <HTMLElement> c;
      if (child.dataset["alias"] == student.Alias) {
        return child;
      } 
    };

    return null;
  }

  addToGroup (student: Student) : void {  
    let elt: HTMLElement = this.getStudentElt(student);
      
    this.list.insertBefore(elt, this.groupBreak);

    elt.classList.add("in-group");

    let button = elt.querySelector("i");
    button.classList.remove("bi-person-plus");
    button.classList.add("bi-person-dash");

    // Add student to AppState
    this.appState.addSelectedStudent(student);
  }

  removeFromGroup (student: Student) : void {
    let elt: HTMLElement = this.getStudentElt(student);
    this.list.insertBefore(elt, this.groupBreak);
    this.list.insertBefore(this.groupBreak, elt);

    elt.classList.remove("in-group");
    
    let button = elt.querySelector("i");
    button.classList.remove("bi-person-dash");
    button.classList.add("bi-person-plus");

    // Remove student from AppState
    this.appState.removeSelectedStudent(student);
  }
}
