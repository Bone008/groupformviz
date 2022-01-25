import * as d3 from 'd3';
//@ts-ignore
import * as d3Cloud from 'd3-cloud'
import { AppState } from './app-state';
import { Radar } from './radar';
import { populateSkillSelector, Student } from './util';
//@ts-ignore
import * as rawInterests from './interests.csv'

/** Logic for the main visualization view */
export class VisualizationController {
  private readonly radarController: Radar;
  private selectedSkill: keyof Student;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('VisualizationController initialized with:', element);

    // Initialize radial chart.
    this.radarController = new Radar(this.element.querySelector(".radar"), appState);

    const skillSelect = this.element.querySelector<HTMLSelectElement>('.skill-selector');
    populateSkillSelector(skillSelect);
    skillSelect.addEventListener('change', e => {
      this.setSelectedSkill(skillSelect.value);
      this.renderHistogram();
    });
    this.setSelectedSkill(skillSelect.value);
    this.renderHistogram();

    this.renderWordCloud();
  }

  private setSelectedSkill(newValue: string) {
    if (newValue) {
      this.selectedSkill = <keyof Student>newValue;
    }
  }

  /** Called whenever the histogram visualization must be re-rendered. */
  private renderHistogram() {
    const svg = d3.select(this.element)
      .select('.vis-skills-histogram .chart');

    // Clear before rerendering, should be done more intelligently in the future.
    svg.selectAll('*').remove();

    const width = 360;
    const height = 200;
    const histogram = this.buildSkillHistogram(this.selectedSkill);

    // X axis
    const xScale = d3.scaleBand<number>()
      .range([0, width])
      .domain(d3.range(histogram.length))
      .padding(0.2);
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle');

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .attr('font-size', '11')
      .text('Skill proficiency');

    // Add Y axis
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(10, d3.max(histogram))])
      .range([height, 0]);
    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr('x', -height / 2)
      .attr("y", -25)
      .attr('font-size', '12')
      .attr("transform", "rotate(-90)")
      .text('Number of students');

    // Bars
    svg.selectAll('mybar')
      .data(histogram)
      .enter()
      .append('g')
      .call(g => g.append('rect')
        .attr('x', (d, i) => xScale(i))
        .attr('y', (d, i) => yScale(d))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d))
        .attr('fill', '#69b3a2')
      )
      .call(g => g.append('title')
        .text((d, i) => this.appState.students
          .filter(student => student[this.selectedSkill] === i)
          .map(student => student.Alias)
          .join(', '))
      );
  }

  private buildSkillHistogram(skill: keyof Student): number[] {
    const skills: number[] = Array(11).fill(0);
    for (const student of this.appState.students) {
      const value = Number(student[skill]);
      skills[value] = (skills[value] || 0) + 1;
    }
    return skills;
  }

  private renderWordCloud() {
    let interests: any = {}
    rawInterests.forEach((object: any) => {
      Object.entries(object).forEach(([key, value]) => {
        if (value) {
          if (key in interests) {
            interests[key].push(value)
          } else {
            interests[key] = [value]
          }
        }
      });
    });

    let words = Object.keys(interests).map(word => { return { text: word, value: interests[word].length * 300 } });

    const height = 440;
    const length = 440;

    var layout = d3Cloud()
      .size([height, length])
      .words(words)
      .font("sans-serif")
      .rotate(function () { return 0 })
      .on("end", (data: any, bounds: any) => this.draw(data, this.element, interests, height, length));

    layout.start()

    this.appState.observeActive(student => this.checkActiveLabel(student));
  }


  private draw(words: any, element: HTMLElement, interests: any, height: number, length: number) {
    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select("#word-cloud")
      .attr("transform", "translate(" + height / 2 + "," + length / 2 + ")")
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .text((d: any) => d.text)
      .style("font-size", (d: any) => d.size + "px")
      .style("font-family", (d: any) => d.font)
      .style("fill", (d, i: any) => fill(i))
      .attr("text-anchor", "middle")
      .attr("transform", (d: any) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
      .attr("data-interest", (d, i) => words[i].text)
      .on("click", (event, d) => {
        d3.select(<HTMLElement>event.target)
          .attr('fill', 'black')
        let aliases = interests[event.target.dataset["interest"]]
        this.labelInterestGroup(event.target.dataset["interest"], aliases);
      });
  }

  private labelInterestGroup(interest: string, aliases: string[]) {
    const list = d3.select("#interest-group");
    list.selectAll("*").remove();

    list.append("text")
      .text(interest)
      .attr("font-weight", "bold")
      .attr("font-size", 12)
      .style("cursor", "auto")
      .attr("x", 450)
      .attr("y", 20);

    list.append("g").selectAll("text")
      .data(aliases)
      .enter().append("text")
      .text(d => d)
      .attr("data-alias", d => d)
      .attr("font-size", 12)
      .attr("x", 450)
      .attr("y", (d, i) => 25 + 15 * (i + 1))
      .on("click", (evt, alias) => {
        const student = this.appState.students.find(st => st.Alias === alias);
        this.appState.setActiveStudent(student);
      })
  }

  private checkActiveLabel(student: Student) {
    const list = document.querySelector("#interest-group g");
    Array.from(list.children).forEach((elt: HTMLElement) => {
      if (student && elt.dataset["alias"] === student.Alias) {
        elt.setAttribute("text-decoration", "underline");
      } else {
        elt.setAttribute("text-decoration", "none");
      }
    });
  }
}
