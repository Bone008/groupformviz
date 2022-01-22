import * as d3 from 'd3';

// Sample code, feel free to delete.
function component() {
  const maxNumber = d3.max([12, 42, 5, 11, 3]);

  const element: HTMLDivElement = document.createElement('div');
  element.innerText = `Hello world, the max number is ${maxNumber}!`;

  return element;
}

document.body.appendChild(component());
