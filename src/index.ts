import { AppState } from "./app-state";
import { DetailsController } from "./details";
import { PeopleController } from "./people";
import { VisualizationController } from "./visualization";

import { Radar } from "./radar";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css';

const DEBUG = true; // Can be pulled in from webpack env later.

function init() {
  const appState = new AppState();
  const peopleController = new PeopleController(document.querySelector('#people'), appState);
  const detailsController = new DetailsController(document.querySelector('#raw-data'), appState);
  // const visualizationController = new VisualizationController(document.querySelector('#visuals'), appState);

  if(DEBUG) {
    // Declare globally to allow convenient access from dev tools.
    const win = <any>window;
    win.appState = appState;
    win.peopleController = peopleController;
    win.detailsController = detailsController;
    // win.visualizationController = visualizationController;
  }

  // Populate people section from data
  appState.students.forEach(student => {
    peopleController.addStudent(student);
  });

  // DEBUG
  let radar = new Radar(document.querySelector(".radar"), appState, ["ComputerGraphics", "Statistics", "Programming", "Math", "Ux", "Art", "Computer", "VizSkills", "Hci"]);
}

document.addEventListener('DOMContentLoaded', init);
