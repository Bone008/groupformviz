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
    const container = d3.select("#details").select(".details-data");
    container.selectAll("*").remove();

    if (student === null) {
      const rows = container.append("p")
        .classed("m-auto fs-6 text-secondary", true)
        .text("No student inspected")

      return;
    }

    const data = Object.entries(student);

    const rows = container.selectAll("div")
      .data(data)
      .enter().append("div")

    rows.append("p").classed("fs-6 fw-bold mb-0", true).text(d => d[0]);
    rows.insert("p").classed("fs-6", true).text(d => {
      return d[1] !== null ? d[1] : "-";
    })
  }
}
