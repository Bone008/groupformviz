import * as d3 from 'd3';
import { AppState } from "./app-state";
import { Student } from './util';

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

    const toggle = <HTMLElement>document.querySelector('#details-close-btn');
    const dataElt = <HTMLElement>document.querySelector("#details-data");
    toggle.addEventListener('click', () => {
      if (toggle.classList.contains("bi-chevron-down")){
        toggle.classList.remove("bi-chevron-down")
        toggle.classList.add("bi-chevron-up")

        this.element.style.flexShrink = "1.7";
        
        this.element.style.flexBasis = "200px";
        this.element.style.overflow = "hidden";
        dataElt.style.visibility = "hidden";
      } else if (toggle.classList.contains("bi-chevron-up")){
        toggle.classList.add("bi-chevron-down")
        toggle.classList.remove("bi-chevron-up")

        this.element.style.flexShrink = "0";
        this.element.style.flexBasis = "500px";
        this.element.style.overflow = "scroll";
        dataElt.style.visibility = "initial";
      }
    });
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
