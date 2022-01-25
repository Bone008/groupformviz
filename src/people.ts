import { AppState } from "./app-state";
import { Student } from "./util";

/** Logic for the people list on the left side of the UI. */
export class PeopleController {
  private readonly stdEltList: HTMLElement;
  private readonly groupBreak: HTMLElement;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('PeopleController initialized with:', element);

    this.stdEltList = element.querySelector("#people-list"); 
    this.groupBreak = element.querySelector("#group-break");

    this.appState.observeActive(student => {
      // Find div and style it
      Array.from(this.stdEltList.children).forEach((elt: HTMLElement) => {
        if (student == null || elt.dataset["alias"] != student.Alias) {
          elt.classList.remove("activeStudent")
        } else {
          elt.classList.add("activeStudent")
        }
      });
    });
  }


  addStudent (student: Student) : void {
    let tmp: HTMLTemplateElement = <HTMLTemplateElement> document.getElementById("student-template");
    let frag: DocumentFragment = <DocumentFragment>tmp.content.cloneNode(true)
    let stdElt: HTMLElement = <HTMLElement> frag.firstElementChild;
    stdElt.innerHTML = stdElt.innerHTML.replace("${alias}", student.Alias);
    stdElt.dataset["alias"] = student.Alias;

    // Create button functions
    let button = stdElt.querySelector("i");
    button.addEventListener("click", e => {
      e.stopPropagation();
      if (button.classList.contains("bi-person-plus")){
        this.addToGroup(student);
      } else{
        this.removeFromGroup(student);
      }
    });
    
    stdElt.addEventListener('click', () => {
      if(this.appState.active == student){
        this.appState.setActiveStudent(null);
      } else {
        this.appState.setActiveStudent(student);
      }
    });
    
    this.stdEltList.appendChild(stdElt);
  }

  private getStudentElt(student: Student) : HTMLElement {
    for (const c of Array.from(this.stdEltList.children)) {
      const child = <HTMLElement> c;
      if (child.dataset["alias"] == student.Alias) {
        return child;
      } 
    };

    return null;
  }

  addToGroup (student: Student) : void {  
    let elt: HTMLElement = this.getStudentElt(student);
      
    this.stdEltList.insertBefore(elt, this.groupBreak);

    elt.classList.add("in-group");

    let button = elt.querySelector("i");
    button.classList.remove("bi-person-plus");
    button.classList.add("bi-person-dash");
    button.title = 'Remove from group';

    // Add student to AppState
    this.appState.addSelectedStudent(student);
  }

  removeFromGroup (student: Student) : void {
    let elt: HTMLElement = this.getStudentElt(student);
    this.stdEltList.insertBefore(elt, this.groupBreak);
    this.stdEltList.insertBefore(this.groupBreak, elt);

    elt.classList.remove("in-group");
    
    let button = elt.querySelector("i");
    button.classList.remove("bi-person-dash");
    button.classList.add("bi-person-plus");
    button.title = 'Add to group';

    // Remove student from AppState
    this.appState.removeSelectedStudent(student);
  }
}
