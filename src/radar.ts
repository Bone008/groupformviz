import * as d3 from 'd3';
import { AppState, Student } from './app-state';

export class Radar {
	private cx: number;
	private cy: number;
	private minDim: number;

    constructor (
        private readonly students: Student[],
        private readonly element: HTMLElement,
    ) {
		this.cx = element.clientWidth / 2;
		this.cy = element.clientHeight / 2;
		this.minDim = Math.min(element.clientWidth, element.clientHeight);
	}

    render (): void {
        const data = [1, 5, 3, 2, 4]; // DUMMY DATA
		const maxData = Math.max(...data);

		// Leave out a few pixels for padding
		const radiusLimit = (this.minDim - 5) / 2;
		
		const svg = d3.select(".radar")
		const circularAxes = svg.select("g.circularAxes")
		const radialAxes = svg.select("g.radialAxes")
		const plots = svg.select("g.plots")

		// Helper function for calculating polar coordinates
		let getPosOnUnitCircle = (i: number, radius: number) : [number, number] => {
			return [
				this.cx + radius * Math.cos((i / data.length - 0.25) * 2 * Math.PI),
				this.cy + radius * Math.sin((i / data.length - 0.25) * 2 * Math.PI),
			]
		}

		// Helper function for converting data point to pixel radius
		let getRadius = (d: number) => (d / maxData) * radiusLimit;

		// Helper function for nice polar coordinate radial shading
		let getCircleColor = d3.interpolateRgb("white", "darkseagreen");
		
		/* Draw circular axes in order from biggest to smallest */
		circularAxes.selectAll("circle")
			.data(Array.from({length: maxData}, (_, i) => maxData - i))
			.enter().append("circle")
			.style("stroke", "black")
			.style("fill", (d, i) => getCircleColor((i+1) / data.length))
			.attr("r", d => getRadius(d))
			.attr("cx", this.cx)
			.attr("cy", this.cy);

		/* Draw radial axes in any order */
		radialAxes.selectAll("line")
			.data(data)
			.enter().append("line")
			.style("stroke", "black")
			.attr("x1", this.cx)
			.attr("y1", this.cy)
			.attr("x2", (d, i) => getPosOnUnitCircle(i, radiusLimit)[0])
			.attr("y2", (d, i) => getPosOnUnitCircle(i, radiusLimit)[1])

		// Generate list of polar points from data
		let points: [number, number][] = data.map( (d, i) => getPosOnUnitCircle(i, getRadius(d))); 
		points = [...points, points[0]]; // Close loop

		/* Draw polygon described by data points */
		let lineGenerator = d3.line()
			.x(d => d[0])
			.y(d => d[1]);
		plots.append("path")
			.style("stroke", "black")
			.style("fill", "crimson")
			.attr("d", lineGenerator(points));

		/* Draw circles at each actual point */
		plots.selectAll("circle")
			.data(points)
			.enter().append("circle")
			.style("stroke", "black")
			.style("fill", "crimson")
			.attr("r", 3)
			.attr("cx", d => d[0])
			.attr("cy", d => d[1])	
    }
}