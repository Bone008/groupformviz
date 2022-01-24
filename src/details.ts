import { AppState, Student } from "./app-state";

/** Logic for the details panel showing data about a single selected student. */
export class DetailsController {

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('DetailsController initialized with:', element);

    this.appState.observeActive(newActiveStudent => {
      if (newActiveStudent) {
        this.renderStudent(newActiveStudent);
        this.element.classList.remove('hidden');
      } else {
        this.element.classList.add('hidden');
      }
    });

    document.querySelector('#details-close-btn').addEventListener('click', () => {
      this.closePanel();
    });
  }

  private closePanel() {
    // Do not deselect, only hide panel.
    this.element.classList.add('hidden');
  }

  private renderStudent(student: Student) {
    // TODO
    console.log(`active student: ${student.Alias}`);
  }

}
