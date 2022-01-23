import * as d3 from 'd3';
//@ts-ignore
import * as d3Cloud from 'd3-cloud'
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
    let words = [
      "Video games", "Nature", "Basketball", "Design", "UX", "Movies", "TV-series", "Learning",
      "Workout", "Handball", "Gym", "Hanging out", "Guitar", "Photography", "Game development",
      "Sports", "Music", "Football", "Stock market", "3D printing", "Tennis", "Golf", "Painting",
      "Cats", "Plants", "Piano", "Going to bars", "VR", "Reading", "Wargaming", "Art",
      "Web development", "Languages", "Yoga", "Coffee", "Running", "Knitting", "Drawing",
      "Outdoors", "Cooking", "Friends", "Programming", "Politics", "Board games", "Dancing",
      "Ultimate frisbee", "Artificial intelligence", "Pen-and-paper role playing games", "Skiing",
      "Sailing", "Kayaking", "Windsurfing", "Hiking", "Youtube", "Twitter", "Gardening", "CS:GO",
      "Swimming", "Badminton", "Traveling", "Baking", "Crafting", "Climbing", "Technology"
    ].map(word => {return {text: word, value: 1000}});
    const height = 700;
    const length = 700;

    var layout = d3Cloud()
      .size([height, length])
      .words(words)
      .rotate(function() { return 0 })
      .on("end", (data: any, bounds: any) => this.draw(data, this.element));
    
    layout.start()
  }

      //@ts-ignore
  private draw(words, element) {
    //@ts-ignore
    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select(element)
        .select('.vis-word-cloud')
        .append("g")
        .attr("transform", "translate(" + 700 / 2 + "," + 700 / 2 + ")")
        .selectAll("text") //@ts-ignore
        .data(words)
        .enter()
        .append("text")     //@ts-ignore
        .text((d) => d.text)    //@ts-ignore
        .style("font-size", (d) => d.size + "px")    //@ts-ignore
        .style("font-family", (d) => d.font)    //@ts-ignore
        .style("fill", (d, i) => fill(i))
        .attr("text-anchor", "middle")    //@ts-ignore
        .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
        .attr("id", (d, i) => words[i].text)
        .on("click", (event, d) => {d3.select(event.target.id).style("fill", (d, i) => "black")})
  }
}