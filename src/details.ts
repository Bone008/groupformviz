import * as d3 from 'd3';
import { AppState, Student } from "./app-state";

/** Logic for the details panel showing data about a single selected student. */
export class DetailsController {

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('DetailsController initialized with:', element);

    this.fillDataParagraph(null);
    this.appState.observeActive(st => this.fillDataParagraph(st));
  }

  // Old version
  private fillDataTable(student: Student) {
    if (student === null) return;

    const data = Object.entries(student);

    const table = d3.select("#details").select("table").select("tbody");

    table.selectAll("*").remove();

    const rows = table.selectAll("tr")
      .data(data)
      .enter().append("tr")
    
    rows.append("th").text(d => d[0])
    rows.insert("td").text(d => d[1])
  }

  private fillDataParagraph(student: Student) {
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
