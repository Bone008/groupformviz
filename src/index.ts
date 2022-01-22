import { AppState } from "./app-state";
import { DetailsController } from "./details";
import { PeopleController } from "./people";
import { VisualizationController } from "./visualization";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css';

const DEBUG = true; // Can be pulled in from webpack env later.

function init() {
  const appState = new AppState();
  const peopleController = new PeopleController(document.querySelector('#people'), appState);
  const detailsController = new DetailsController(document.querySelector('#raw-data'), appState);
  const visualizationController = new VisualizationController(document.querySelector('#visuals'), appState);

  if(DEBUG) {
    // Declare globally to allow convenient access from dev tools.
    const win = <any>window;
    win.appState = appState;
    win.peopleController = peopleController;
    win.detailsController = detailsController;
    win.visualizationController = visualizationController;

    // Populate students with some dummy data
    let sahil = peopleController.addStudent("Sahil");
    let lukas = peopleController.addStudent("Lukas");
    let erik = peopleController.addStudent("Erik");
    peopleController.addToGroup(sahil);
  }
}

document.addEventListener('DOMContentLoaded', init);
