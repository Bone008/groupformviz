import * as d3 from 'd3';
import { AppState, Student } from './app-state';

export class Radar {
	private cx: number;
	private cy: number;
	private minDim: number;

	private opt = {
		padding: 25,
		background: "gray",
		labelDist: 3,
		labelSize: 8,

		opacity: 0.85,
		drawPoints: false,
		curve: d3.curveLinear, // or try d3.curveNatural with drawPoints on
		colorScheme: d3.schemeTableau10,
	}

    constructor (
		private readonly element: HTMLElement,
		private readonly appState: AppState,
		private readonly skills: Array<keyof Student>,
		private readonly maxValue: number = 10,
    ) {
		this.cx = element.clientWidth / 2;
		this.cy = element.clientHeight / 2;
		this.minDim = Math.min(element.clientWidth, element.clientHeight);

		this.renderAxes();
		document.addEventListener("groupUpdated", () => this.renderData());
	}

	renderAxes (): void {
		const svg = d3.select(".radar")
		const circularAxes = svg.select("g.circularAxes")
		const radialAxes = svg.select("g.radialAxes")
		const labels = svg.select("g.labels")

		// Helper function for nice polar coordinate radial shading
		let getCircleColor = d3.interpolateRgb("white", this.opt.background);
		
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
			.attr("x", (d, i) => this.getPosOnCircle(i, this.radiusLimit + this.opt.labelDist)[0])
			.attr("y", (d, i) => this.getPosOnCircle(i, this.radiusLimit + this.opt.labelDist)[1] + this.getYAnchor(i))
			.attr("font-size", this.opt.labelSize + "px")
	}

    renderData (): void {
		const svg = d3.select(".radar")
		const plots = svg.select("g.plots")
		
		plots.selectAll("*").remove(); // Clear screen (TODO: Animate changes)
		if(this.appState.selected.length == 0){ return }

		// Generate colors for each student
		const color = d3.scaleOrdinal().domain(this.appState.students.map(st => st.Alias))
			.range(this.opt.colorScheme);
		
		// Create a plot for each student
		for (const student of this.appState.selected) {
			const plot = plots.append("g");
			const data = this.studentToData(student);

			// Generate list of polar points from data
			let points: [number, number][] = data.map( (d, i) => this.getPosOnCircle(i, this.getRadius(d))); 
			points = [...points, points[0]]; // Close loop

			/* Draw polygon described by data points */
			let lineGenerator = d3.line()
				.x(d => d[0])
				.y(d => d[1])
				.curve(this.opt.curve)
			plot.append("path")
				.style("stroke", "black")
				.style("fill", () => <string>color(student.Alias))
				.style("fill-opacity", this.opt.opacity)
				.attr("d", lineGenerator(points));

			if (this.opt.drawPoints){
				/* Draw circles at each actual point */
				plot.selectAll("circle")
					.data(points)
					.enter().append("circle")
					.style("stroke", "black")
					.style("fill", () => <string>color(student.Alias))
					.attr("r", 3)
					.attr("cx", d => d[0])
					.attr("cy", d => d[1])
			}	
		}
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
			case  0: return this.opt.labelSize / 2
			case  1: return this.opt.labelSize
		}
	}

	/* Converts a value into a radius in pixels */
	private getRadius(d: number) {
		return d / this.maxValue * this.radiusLimit;
	}

	private get radiusLimit() {
		// Leave out a few pixels for padding
		return (this.minDim - this.opt.padding) / 2
	}
}