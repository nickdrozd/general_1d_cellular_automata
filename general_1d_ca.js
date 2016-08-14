/*
	interesting examples: (colors,range,ruleNumber)
	(3, 4, 3458304957)
	(3, 1, 901873455) // lucky guess! try its neighbors!
	(2, 2, 4294967296 / 2 + 9)
	(3, 1, 7.6255975e12 / 3 + 23)
	(3, 1, parseInt('022101210121201210212111210', 3)
	(3, 1, parseInt('022100211120201212212011210', 3))
	(3, 1, parseInt('012012112101101121210212210', 3))
	(3, 1, parseInt('012012210'+'101101110'+'011202210', 3)) <-- rule 110?
*/

/* input */

// rule parameters

var colors = 3;
var range = 4;
var ruleNumber = 3458304957;

// draw parameters

var seedingProb = 2;
var cellSize = 5;
var frame = 10;

/* initial coloring scheme: 
	'random' or 'single' or 'column' */

var initColorScheme = 'random';

/* edge condition: 'wrap' or 'dead' */

var edgeCondition = 'wrap';

// derived constants

var neighborhood = 2 * range + 1;
var numberOfStates = Math.pow(colors, neighborhood);
var listOfStates = possibleStates();
var ruleString = convertNumber(ruleNumber);

/* drawing */

const screenWidth = screen.availWidth;
const screenHeight = screen.availHeight;

const rows = Math.round((screenHeight / cellSize));
const columns = Math.round((screenWidth / cellSize));

function setup() {
	createCanvas(screenWidth,screenHeight);
	background(100);
	// frameRate(frame);
	// noLoop()
}

var cells = initialCells();
var count = 0;

function draw() {

	cells.forEach(function(cell) {
		fill(color(cell.hexColor));
		rect(cell.x, cell.y, cellSize, cellSize);
	});

	count++;

	cells = updatedCells(cells);

	if (count > rows) {
		cells.forEach(function(cell) {
			cell.row = -1; // row will get incremented
		});
		count = 0;
		report();
	}
}

/* cells */

function Cell (column, row, color) {
	this.column = column;
	this.x = column * cellSize;
	this.row = row;
	this.y = row * cellSize
	this.color = color;
	//this.historyTotal = 0;

	this.hexColor = '#000000';

	// the colors of the cells neighbors (including itself)
	// this gets converted to a string later -- should it be a string now?
	this.neighbors = [];
}

// choose initial coloring
function initialCells() {
	var cells = [];

	for (var i = 0; i < columns; i++) 
		cells.push(new Cell(i,0,0));

	/* Choose one of the three initial colorings! */

	// random initial coloring
	if (initColorScheme == 'random') {
		const rand = Math.random;
		cells.forEach(function(cell) {
			if (seedingProb <= rand() * 100)
				cell.color = 0;
			else
				cell.color = 
					Math.floor(rand() * colors);
		})
	}

	// single cell in the middle (which color?)
	if (initColorScheme == 'single') {
		const middle = Math.round(columns / 2);
		const initialColor = colors - 1;

		cells[middle].color = initialColor;
	}

	// coloring corresponds to column
	if (initColorScheme == 'column') {
		cells.forEach(function(cell) {
			cell.color = cell.column % colors;
		})
	}

	// update neighbors in light of coloring
	cells.forEach(function(cell){
		cell.neighbors = 
			newNeighbors(cell, cells);
		cell.hexColor = newHexColor(cell);
	})

	return cells;
}

function updatedCells(cells) {

	var newCells = [];

	// update information
	cells.forEach(function(cell) {
		newCells.push(new Cell(cell.column, cell.row + 1,
								newColor(cell)));
	});

	// update in light of new color
	// use forEach?
	for (var i = 0; i < columns; i++) {
		newCells[i].neighbors =
					newNeighbors(cells[i], newCells);
		newCells[i].hexColor = newHexColor(cells[i]);
		/*newCells[i].historyTotal =
							cells[i].historyTotal +
							cells[i].color;*/
	}

	return newCells;
}

function newNeighbors(cell, cells) {
	var neighborList = [];

	var start = cell.column - range;
	var stop = start + neighborhood;

	// edge conditions

	// option 1: wrap around
	if (edgeCondition == 'wrap') {
		for (var i = start, j = 0; i < stop; i++, j++) {
			if (i < 0)
				neighborList[j] = 
					cells[cells.length + i].color;
			else if (i >= cells.length)
				neighborList[j] = 
					cells[i % cells.length].color;
			else
				neighborList[j] = cells[i].color;
		}
	}

	// option 2: anything off the screen is 0
	if (edgeCondition == 'dead') {
		for (var i = start, j = 0; i < stop; i++, j++) {
				if (i < 0 || i >= cells.length)
					neighborList[j] = 0;
				else
					neighborList[j] = cells[i].color;
		}
	}

	return neighborList;
}

// number in range(0,colors)
function newColor(cell) { 
	const neighbors = cell.neighbors.join('');

	const start = seedingProb > 50;
	var index = start ? 0 : listOfStates.length - 1;

	while (listOfStates[index] != neighbors) {
		start ? index++ : index--;
	}

	return Number(ruleString[index]);
}

// hex string
function newHexColor(cell) {
	var code;
	if (cell.color == 0)
		code = 255;
	else
		code = 16777216 / (colors - 1) * cell.color;

	// code = (code + 20) % 16777216;

	var code = code.toString(16);
	while (code.length < 6)
		code = '0' + code;
	return '#' + code;
}

/* mathy stuff */

function updateConstants() {
	neighborhood = findNeighborhood();
	numberOfStates = findNumberOfStates();
	listOfStates = possibleStates();
	ruleString = convertNumber(ruleNumber);
}

function findNeighborhood() {
	return 2 * range + 1;
}

function findNumberOfStates() {
	Math.pow(colors, neighborhood);
}

// convert the rule number to colors-ary representation string
function convertNumber (number) {

	var numstr = number.toString(colors);

	while (numstr.length < numberOfStates)
		numstr = '0' + numstr;

	while (numstr.length > numberOfStates)
		numstr = numstr.slice(1);

	return numstr;
}

function possibleStates() {
	var states = [];

	for (var i = 0, state = numberOfStates - 1;
				i < numberOfStates; i++, state--) {
		states[i] = state.toString(colors);

		while (states[i].length < neighborhood)
			states[i] = '0' + states[i];
	}

	return states;
}

/* debugging */

var DEBUG = 0;

function debug() {
	DEBUG = 1 - DEBUG;
}

/* performance monitoring */

var MONITOR = 0;
var monitor = 0;

function report() {
	if (MONITOR) {
		console.log(monitor);
		monitor = 0;
	}
}