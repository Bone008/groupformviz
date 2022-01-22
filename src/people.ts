import { AppState } from "./app-state";

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


  addStudent (alias: string) : HTMLElement {
    let tmp: HTMLTemplateElement = <HTMLTemplateElement> document.getElementById("student-template");
    let frag: DocumentFragment = <DocumentFragment>tmp.content.cloneNode(true)
    let student: HTMLElement = <HTMLElement> frag.firstElementChild;
    student.innerHTML = student.innerHTML.replace("${alias}", alias);

    // Create button functions
    let button = student.querySelector("i");
    button.addEventListener("click", () => {
      if (button.classList.contains("bi-person-plus")){
        this.addToGroup(student);
      } else{
        this.removeFromGroup(student);
      }
    });
    
    this.list.appendChild(student);

    return student;
  }

  addToGroup (student: HTMLElement) : void {    
    this.list.insertBefore(student, this.groupBreak);

    student.classList.add("in-group");
    student.classList.remove('bg-white');

    let button = student.querySelector("i");
    button.classList.remove("bi-person-plus");
    button.classList.add("bi-person-dash");
  }

  removeFromGroup (student: HTMLElement) : void {
    this.list.insertBefore(student, this.groupBreak);
    this.list.insertBefore(this.groupBreak, student);

    student.classList.add('bg-white');
    student.classList.remove("in-group");
    
    let button = student.querySelector("i");
    button.classList.remove("bi-person-dash");
    button.classList.add("bi-person-plus");
  }
}
