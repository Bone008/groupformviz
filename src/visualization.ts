import * as d3 from 'd3';
//@ts-ignore
import * as d3Cloud from 'd3-cloud'
import { AppState, Student } from './app-state';
//@ts-ignore
import * as rawInterests from './interests.csv'

/** Logic for the main visualization view */
export class VisualizationController {
  private selectedSkill: keyof Student;

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('VisualizationController initialized with:', element);

    const skillSelect = this.element.querySelector<HTMLSelectElement>('.skill-selector');
    skillSelect.addEventListener('change', e => {
      this.setSelectedSkill(skillSelect.value);
      this.renderHistogram();
    });
    this.setSelectedSkill(skillSelect.value);
    this.renderHistogram();

    this.renderWordCloud();
    
    // Proof-of-concept to run code whenever the selection changes.
    const debugTextEl = document.createElement('p');
    element.appendChild(debugTextEl);
    this.appState.observeSelected(() => {
      const names = this.appState.selected.map(s => s.Alias);
      debugTextEl.textContent = `Selected from VisController: ${names.join(', ')}`;
    });
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

    const width = 300;
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

    // Add Y axis
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(histogram)])
      .range([height, 0]);
    svg.append('g')
      .call(d3.axisLeft(yScale));

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
        if(value) {
          if(key in interests) {
            interests[key].push(value)
          } else {
            interests[key] = [value]
          }
        }
      });
    });
    let words = Object.keys(interests).map(word => {return {text: word, value: interests[word].length*300}});

    const height = 440;
    const length = 440;

    var layout = d3Cloud()
      .size([height, length])
      .words(words)
      .font("sans-serif")
      .rotate(function() { return 0 })
      .on("end", (data: any, bounds: any) => this.draw(data, this.element, interests, height, length));

    layout.start()
  }


  private draw(words: any, element: HTMLElement, interests: any, height: number, length: number) {
    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select(element)
        .select('.vis-word-cloud')
        .append("g")
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
        .attr("id", (d, i) => words[i].text)
        .on("click", (event, d) => {
          d3.select(element)
            .select('.vis-word-cloud')
            .select('#' + event.target.id)
            .attr('fill', 'black')
          let aliases = interests[event.target.id]
          aliases.forEach((alias: string) => {
            let student = this.appState.students.find((student: Student) => student.Alias==alias)
            // this.appState.addSelectedStudent(student)
          });
        });
  }
}
