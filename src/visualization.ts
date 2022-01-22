import * as d3 from 'd3';
import { AppState } from './app-state';

/** Logic for the main visualization view */
export class VisualizationController {
  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('VisualizationController initialized with:', element);

    // Sample code, feel free to delete.
    const maxNumber = d3.max([12, 42, 5, 11, 3]);
    const divElement: HTMLDivElement = document.createElement('div');
    divElement.innerText = `Hello world, the max number is ${maxNumber}!`;
    element.appendChild(divElement);
  }
}
