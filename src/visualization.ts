import * as d3 from 'd3';
import { AppState, Student } from './app-state';

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
      .style('text-anchor', 'center');

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
}
