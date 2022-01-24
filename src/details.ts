import * as d3 from 'd3';
import { AppState, Student } from "./app-state";

/** Logic for the details panel showing data about a single selected student. */
export class DetailsController {

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('DetailsController initialized with:', element);

    this.renderStudent(null);
    this.appState.observeActive(st => {
      this.renderStudent(st);
    });

    document.querySelector('#details-close-btn').addEventListener('click', () => {
      this.closePanel();
    });
  }

  private closePanel() {
    // Do not deselect, only hide panel.
    this.element.classList.add('hidden');

    // TODO: Close the data view but keep the heading "Details" viewable
    // and move the open/close button to be inline with this heading
    // so that the panel can be reopened but takes up much less space
  }

  private renderStudent(student: Student|null) {
    const container = d3.select("#details").select("div.details");
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
