import * as d3 from 'd3';
//@ts-ignore
import * as d3Cloud from 'd3-cloud'
import { AppState } from './app-state';
import { Radar } from './radar';
import { populateSkillSelector, Student } from './util';
//@ts-ignore
import * as rawInterests from './interests.csv'

const HIST_WIDTH = 360;
const HIST_HEIGHT = 200;

interface HistogramResult {
  data: number[];
  median: number;
  mean: number;
  sourceStudents: Student[];
}

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

    this.appState.observeSelected(() => this.renderHistogram());
    this.appState.observeActive(() => this.renderHistogram());

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

    const histogram = this.buildSkillHistogram(this.selectedSkill, this.appState.students);
    const groupHistogram = this.buildSkillHistogram(this.selectedSkill, this.appState.selected);

    const activeIsInGroup = this.appState.selected.includes(this.appState.active);
    let activeHistogram: HistogramResult;
    if (activeIsInGroup) {
      // If in group --> render only active in front
      activeHistogram = this.buildSkillHistogram(this.selectedSkill,
        [this.appState.active].filter(x => !!x));
    } else {
      // If not in group --> render active cumulative with group behind
      activeHistogram = this.buildSkillHistogram(this.selectedSkill,
        [...this.appState.selected, this.appState.active].filter(x => !!x));
    }

    // X axis
    const xScale = d3.scaleBand<number>()
      .range([0, HIST_WIDTH])
      .domain(d3.range(histogram.data.length))
      .padding(0.2);
    svg.append('g')
      .attr('transform', 'translate(0,' + HIST_HEIGHT + ')')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle');

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr("x", HIST_WIDTH / 2)
      .attr("y", HIST_HEIGHT + 30)
      .attr('font-size', '11')
      .text('Skill proficiency');

    // Add Y axis
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(10, d3.max(histogram.data))])
      .range([HIST_HEIGHT, 0]);
    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr('x', -HIST_HEIGHT / 2)
      .attr("y", -25)
      .attr('font-size', '12')
      .attr("transform", "rotate(-90)")
      .text('Number of students');

    // Bars
    const barPlots = [
      { histogram: histogram, color: '#446' },
      { histogram: activeHistogram, color: 'rgba(255, 153, 153, 0.5)' },
      { histogram: groupHistogram, color: '#69b3a2' },
    ];
    if (activeIsInGroup) {
      // Swap draw order so active is drawn AFTER group.
      const tmp = barPlots[1];
      barPlots[1] = barPlots[2];
      barPlots[2] = tmp;
    }
    for (const { histogram, color } of barPlots) {
      svg.selectAll('mybar')
        .data(histogram.data)
        .enter()
        .append('g')
        .call(g => g.append('rect')
          .attr('x', (d, i) => xScale(i))
          .attr('y', (d, i) => yScale(d))
          .attr('width', xScale.bandwidth())
          .attr('height', d => HIST_HEIGHT - yScale(d))
          .attr('fill', color)
        )
        .call(g => g.append('title')
          .text((d, i) => histogram.sourceStudents
            .filter(student => student[this.selectedSkill] === i)
            .map(student => student.Alias)
            .sort()
            .join(', '))
        );
    }

    // Mean
    this.drawMean(svg, xScale, histogram.mean, 'Global mean', '#112');
    // Decided against drawing group mean, too cluttered
    // if (groupHistogram.mean) {
    //   this.drawMean(svg, xScale, groupHistogram.mean, '', '#336b51');
    // }


    this.element.querySelector<HTMLElement>('.value-globalMean').textContent = histogram.mean.toFixed(2);
    this.element.querySelector<HTMLElement>('.value-globalMedian').textContent = histogram.median.toFixed(2);
    this.element.querySelector<HTMLElement>('.value-groupMean').textContent = groupHistogram.mean?.toFixed(2) || 'N/A';
    this.element.querySelector<HTMLElement>('.value-groupMedian').textContent = groupHistogram.median?.toFixed(2) || 'N/A';
  }

  private drawMean(
    svg: d3.Selection<d3.BaseType, unknown, null, undefined>,
    xScale: d3.ScaleBand<number>,
    mean: number,
    label: string,
    color: string) //
  {
    const meanFloor = Math.floor(mean);
    const meanX = xScale(meanFloor) + (0.5 + mean - meanFloor) * xScale.bandwidth();
    svg.append('line')
      .attr('x1', meanX)
      .attr('x2', meanX)
      .attr('y1', -8)
      .attr('y2', HIST_HEIGHT)
      .style('stroke', color)
      .style('stroke-width', 2)
      .style('stroke-dasharray', '5,3');
    svg.append('text')
      .attr("text-anchor", "start")
      .attr('x', meanX + 2)
      .attr("y", -1)
      .attr('font-size', '12')
      .attr('fill', color)
      .text(label);
  }

  private buildSkillHistogram(skill: keyof Student, students: Student[]): HistogramResult {
    const data: number[] = Array(11).fill(0);
    for (const student of students) {
      const value = Number(student[skill]);
      data[value] = (data[value] || 0) + 1;
    }
    const values = students.map(s => Number(s[skill]));
    return {
      data,
      mean: d3.mean(values),
      median: d3.median(values),
      sourceStudents: students,
    }
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
