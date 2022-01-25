import * as d3 from 'd3';
import { AppState } from "./app-state";
import { Student } from './util';

/** Logic for the details panel showing data about a single selected student. */
export class DetailsController {
  private readonly toggleBtn = document.querySelector<HTMLElement>('#details-close-btn');

  private isOpened = false;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('DetailsController initialized with:', element);

    this.setIsOpened(false);
    this.renderStudent(null);
    this.appState.observeActive(newActiveStudent => {
      this.renderStudent(newActiveStudent);
      this.setIsOpened(!!newActiveStudent);
    });

    this.toggleBtn = document.querySelector<HTMLElement>('#details-close-btn');
    this.toggleBtn.addEventListener('click', () => {
      this.setIsOpened(!this.isOpened);
    });
  }

  private setIsOpened(value: boolean) {
    this.isOpened = value;
    if (value) {
      this.element.classList.remove('collapsed');
      this.toggleBtn.classList.remove("bi-chevron-up");
      this.toggleBtn.classList.add("bi-chevron-down");
    } else {
      this.element.classList.add('collapsed');
      this.toggleBtn.classList.remove("bi-chevron-down");
      this.toggleBtn.classList.add("bi-chevron-up");
    }
  }

  private renderStudent(student: Student | null) {
    const container = this.element.querySelector('.details-data');

    if (!student) {
      this.element.classList.add('no-data');
      return;
    }
    this.element.classList.remove('no-data');

    for (const [key, value] of Object.entries(student)) {
      const dataElement = container.querySelector<HTMLElement>(`.data-${key}`);
      if (!dataElement) {
        continue;
      }

      let formattedValue: string = String(value) || '-';
      if (key === 'Graduation' && formattedValue.length > 4) {
        dataElement.title = 'Expected graduation: ' + formattedValue;
        // Extract year only
        formattedValue = formattedValue.substring(formattedValue.length - 4);
      }
      dataElement.textContent = formattedValue;
    }
  }
}
