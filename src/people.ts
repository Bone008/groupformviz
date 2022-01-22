import { AppState } from "./app-state";

/** Logic for the people list on the left side of the UI. */
export class PeopleController {

  constructor(
    private readonly element: HTMLElement,
    private readonly appState: AppState,
  ) {
    console.log('PeopleController initialized with:', element);
  }

}
