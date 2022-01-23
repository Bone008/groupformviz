import * as d3 from 'd3';
import { AppState, Student } from './app-state';

export class Radar {
	private cx: number;
	private cy: number;
	private minDim: number;
	private color: d3.ScaleOrdinal<string, unknown>;

	private opts = {
		padding: 25,
		background: "gray",
		labelDist: 3,
		labelSize: 8,

		legendSize: 12,
		legendWidth: 150,

		colorScheme: d3.schemeTableau10,

		opacity: 0.85,
		drawPoints: false,
		curve: d3.curveLinear, // or try d3.curveNatural with drawPoints on
	}

    constructor (
		private readonly element: HTMLElement,
		private readonly appState: AppState,
		private readonly skills: Array<keyof Student>,
		private readonly maxValue: number = 10,
    ) {
		this.cx = (element.clientWidth - this.opts.legendWidth) / 2;
		this.cy = (element.clientHeight) / 2;
		this.minDim = Math.min(element.clientWidth - this.opts.legendWidth, element.clientHeight);

		// Generate colors for each student
		this.color = d3.scaleOrdinal().domain(this.appState.students.map(st => st.Alias))
			.range(this.opts.colorScheme);

		this.renderAxes();
		this.appState.observeSelected(() => this.renderData());
		this.appState.observeHovered(() => this.renderData());
	}

	renderAxes (): void {
		const svg = d3.select(".radar")
		const circularAxes = svg.select("g.circularAxes")
		const radialAxes = svg.select("g.radialAxes")
		const labels = svg.select("g.labels")

		// Helper function for nice polar coordinate radial shading
		let getCircleColor = d3.interpolateRgb("white", this.opts.background);
		
		/* Draw circular axes in order from biggest to smallest */
		circularAxes.selectAll("circle")
			.data(Array.from({length: this.maxValue}, (_, i) => this.maxValue - i))
			.enter().append("circle")
			.style("stroke", "black")
			.style("fill", (d, i) => getCircleColor((i+1) / this.skills.length))
			.attr("r", d => this.getRadius(d))
			.attr("cx", this.cx)
			.attr("cy", this.cy);

		/* Draw radial axes in any order */
		radialAxes.selectAll("line")
			.data(this.skills)
			.enter().append("line")
			.style("stroke", "black")
			.attr("x1", this.cx)
			.attr("y1", this.cy)
			.attr("x2", (d, i) => this.getPosOnCircle(i, this.radiusLimit)[0])
			.attr("y2", (d, i) => this.getPosOnCircle(i, this.radiusLimit)[1])
		
		/* Draw labels for radial axes */
		labels.selectAll("text")
			.data(this.skills)
			.enter().append("text")
			.text(d => d)
			.attr("text-anchor", (d, i) => this.getAnchor(i))
			.attr("x", (d, i) => this.getPosOnCircle(i, this.radiusLimit + this.opts.labelDist)[0])
			.attr("y", (d, i) => this.getPosOnCircle(i, this.radiusLimit + this.opts.labelDist)[1] + this.getYAnchor(i))
			.attr("font-size", this.opts.labelSize + "px")
	}

    renderData (): void {
		const svg = d3.select(".radar")
		const plots = svg.select("g.plots")
		const legend = svg.select("g.legend")
		
		plots.selectAll("*").remove(); // Clear screen (TODO: Animate changes)
		legend.selectAll("*").remove();
		
		
		
		// Create a plot for each student (TODO: use D3 more properly here)
		for (const student of this.appState.selected) {
			this.renderStudent(student, 1)
		}

		let legendData = this.appState.selected.map(st => st.Alias)

		// Create solid plot for hovered student
		if(this.appState.hovered != null) { 
			this.renderStudent(this.appState.hovered, 0.85)
			legendData.push(this.appState.hovered.Alias)
		}

		/* Draw Legend */
		legend.selectAll("text")
			.data(legendData)
			.enter().append("text")
			.text(d => d)
			.attr("font-size", this.opts.legendSize)
			.attr("x", this.element.clientWidth - this.opts.legendWidth + 2*this.opts.legendSize)
			.attr("y", (d, i) => (i+1) * (this.opts.legendSize + 2))
		
		legend.selectAll("circle")
			.data(legendData)
			.enter().append("circle")
			.attr("r", this.opts.legendSize / 3)
			.attr("cx", this.element.clientWidth - this.opts.legendWidth + this.opts.legendSize)
			.attr("cy", (d, i) => (i+1) * (this.opts.legendSize + 2) - this.opts.legendSize / 3)
			.attr("stroke-fill", "none")
			.attr("fill", d => <string>this.color(d))
    }

	private studentToData (student: Student) : number[] {
		let data: number[] = []
		for(const key of this.skills){
			data.push(<number>student[key]);
		}
		return data;
	}

	/* Converts a (field, radius) pair into polar coordinates (in pixels) */
	private getPosOnCircle (i: number, r: number): [number, number] {
		return [
			this.cx + r * Math.cos((i / this.skills.length - 0.25) * 2 * Math.PI),
			this.cy + r * Math.sin((i / this.skills.length - 0.25) * 2 * Math.PI),
		]
	}

	/* Calculates best anchor for the label of a given radial axis */
	private getAnchor (i: number, eps: number = 0.01): string {
		let cos = Math.cos((i / this.skills.length - 0.25) * 2 * Math.PI);
		if (Math.abs(cos) < eps) { cos = 0 }
		const side = Math.sign(cos);

		switch(side){
			case -1: return "end"
			case  0: return "middle"
			case  1: return "start"
		}
	}

	private getYAnchor (i: number, eps: number = 0.01): number {
		let sin = Math.sin((i / this.skills.length - 0.25) * 2 * Math.PI);
		if (Math.abs(sin) < eps) { sin = 0 }
		const side = Math.sign(sin);

		switch(side){
			case -1: return 0
			case  0: return this.opts.labelSize / 2
			case  1: return this.opts.labelSize
		}
	}

	/* Converts a value into a radius in pixels */
	private getRadius(d: number) {
		return d / this.maxValue * this.radiusLimit;
	}

	private get radiusLimit() {
		// Leave out a few pixels for padding
		return (this.minDim - this.opts.padding) / 2
	}

	private renderStudent (student: Student, opacity: number = this.opts.opacity): void {
		const plot = d3.select("svg.radar").select("g.plots").append("g");
		const data = this.studentToData(student);

		// Generate list of polar points from data
		let points: [number, number][] = data.map( (d, i) => this.getPosOnCircle(i, this.getRadius(d))); 
		points = [...points, points[0]]; // Close loop

		/* Draw polygon described by data points */
		let lineGenerator = d3.line()
			.x(d => d[0])
			.y(d => d[1])
			.curve(this.opts.curve)
		plot.append("path")
			.style("stroke", "black")
			.style("fill", () => <string> this.color(student.Alias))
			.style("fill-opacity", opacity)
			.attr("d", lineGenerator(points))
			.on("click", () => console.log("clicked on student:", student.Alias)) // TODO: click/mouseover effect?
		
		/* Draw circles at each actual point */
		if (this.opts.drawPoints){
			plot.selectAll("circle")
				.data(points)
				.enter().append("circle")
				.style("stroke", "black")
				.style("fill", () => <string> this.color(student.Alias))
				.attr("r", 3)
				.attr("cx", d => d[0])
				.attr("cy", d => d[1])
		}	
	}
}