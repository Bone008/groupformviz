import { AppState } from "./app-state";

/** Logic for the details panel showing data about a single selected student. */
export class DetailsController {

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('DetailsController initialized with:', element);
  }

}
