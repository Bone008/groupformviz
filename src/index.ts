import { AppState } from "./app-state";
import { DetailsController } from "./details";
import { PeopleController } from "./people";
import { Student } from "./util";
import { VisualizationController } from "./visualization";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css';

const DEBUG = true; // Can be pulled in from webpack env later.

function init() {
  const appState = new AppState();
  const peopleController = new PeopleController(document.querySelector('#people'), appState);
  const detailsController = new DetailsController(document.querySelector('#details'), appState);
  const visualizationController = new VisualizationController(document.querySelector('#visuals'), appState);

  initFromHash(appState, peopleController);
  appState.observeSelected(selected => updateHash(selected));

  if (DEBUG) {
    // Declare globally to allow convenient access from dev tools.
    const win = <any>window;
    win.appState = appState;
    win.peopleController = peopleController;
    win.detailsController = detailsController;
    win.visualizationController = visualizationController;
  }
}

function initFromHash(appState: AppState, peopleController: PeopleController) {
  if (location.hash.length > 1) {
    const candidates = location.hash.substr(1).split(',');
    for(const rawName of candidates) {
      const name = decodeURIComponent(rawName);
      const student = appState.students.find(s => s.Alias === name);
      if (student) {
        peopleController.addToGroup(student);
      } else {
        console.warn('Student not found:', name);
      }
    }
  }
}

function updateHash(selected: Student[]) {
  if (selected.length) {
    location.hash = '#' + selected.map(s => encodeURIComponent(s.Alias)).sort().join(',');
  } else {
    location.hash = '';
  }
}

document.addEventListener('DOMContentLoaded', init);
