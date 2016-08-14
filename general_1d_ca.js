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

/**************************************/

/* input parameters */

// rule parameters

var colors = 5;
var range = 4;
var ruleNumber = 9283745902837; // decimal int

// var colors = 2;
// var range = 1;
// var ruleNumber = 110;

// draw parameters

var emptyColor = '220088'; // hex string
var cellSize = 5; // must be > 2
var frame = 10;

/* initial coloring scheme: 
	'random' or 'single' or 'column' */

var initColorScheme = 'random';
var seedingProb = 10;

/* edge condition: 'wrap' or 'dead' */

var edgeCondition = 'wrap';

/**************************************/

/* derived constants (initialize with setConstants) */

var neighborhood; // (2 * range) + 1
var numberOfStates; // colors ^ neighborhood
var listOfStates; // in colors-ary representation
var ruleString; // ruleNumber in colors-ary

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

var cells;

initialize();

var count = 0;

function draw() {
	cells.forEach(function(cell) {
		fill(color(cell.hexColor));
		rect(cell.x, cell.y, cellSize, cellSize);
	});

	count++;

	updateCells();

	if (count > rows) {
		cells.forEach(function(cell) {
			cell.row = -1; // row will get incremented
		});
		count = 0;

		loopThroughRules();

		// report();
	}
}

function loopThroughRules() {
	ruleNumber++;

	// reinitialize after altering ruleNumber
	setRuleString();
	initializeCells();

	if (INFO)
		console.log(`rule: ${ruleNumber}`);
}

function initialize() {
	monitor = 0;
	setConstants();
	initializeCells();
}

/* cells */

function Cell (column, row, color) {
	this.column = column;
	this.x = column * cellSize;
	this.row = row;
	this.y = row * cellSize
	this.color = color;

	this.hexColor = '#000000';

	// the colors of the cells neighbors (including itself)
	// this gets converted to a string later -- should it be a string now?
	this.neighbors = [];
}

function initializeCells() {
	return cells = initialCells();
}

function initialCells() {
	// is there a better way to do this?
	const cells = [];
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
			const middleCell = cells[middle];

			middleCell.color = initialColor;
		}

		// coloring corresponds to column
		if (initColorScheme == 'column') {
			cells.forEach(function(cell) {
				cell.color = cell.column % colors;
			})
		}

	// update neighbors in light of coloring
	cells.forEach(function(cell) {
		cell.neighbors = 
			newNeighbors(cell, cells);
		cell.hexColor = newHexColor(cell.color);
	})

	return cells;
}

function updateCells() {
	return cells = updatedCells();
}

function updatedCells() {
	var newCells = [];

	// update information
	cells.forEach(function(cell) {
		newCells.push(new Cell(cell.column, 
								cell.row + 1,
								newColor(cell)));
	});

	// update other info in light of new color
	newCells.forEach(function(cell) {
		cell.neighbors = 
			newNeighbors(cell, newCells);
		cell.hexColor = newHexColor(cell.color);
	})

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
	const neighborString = 
		cell.neighbors.join('');

	const neighborNum = 
		parseInt(neighborString, colors);

	// states are listed "backwards"
	const index = 
		listOfStates.length - 1 - neighborNum;

	const color = ruleString[index];
 
	return Number(color);
}

function newHexColor(color) { 
	/* 
		* hex color format: #RRGGBB
		* ff is "high intensity", 00 is "low intensity"
		* #000000 is black (low on all colors)
		* #fffffff is white (high on all colors)
	*/

	// magic numbers
	const hexMax = 16777215;
	const rgbMax = 255;
	const hexLen = 6;

	// const hexDiff = hexMax / (colors - 1);
	const hexDiff = Math.floor(hexMax / colors);
	const emptyColorStr = emptyColor;

	// background / empty color
	if (color == 0)
		return '#' + emptyColorStr;

	 // debugger;

	const emptyColorVal = 
		parseInt(emptyColorStr, (16));

	// const hexVal = 
	// 	(hexDiff * color);

	const hexVal = 
		(emptyColorVal + (hexDiff * color)) % hexMax;

	const hexStr = hexVal.toString(16);

	return '#' + hexStr;
}

/* rules and states */

function setConstants() {
	setNeighborhood();
	setNumberOfStates();
	setListOfStates();
	setRuleString();
}

function setNeighborhood() {
	return neighborhood = 
				2 * range + 1;
}

function setNumberOfStates() {
	return numberOfStates = 
		Math.pow(colors, neighborhood);
}

// why are these listed "backwards"?
function setListOfStates() {
	var states = [];

	for (var i = 0, state = numberOfStates - 1;
				i < numberOfStates; 
				i++, state--) {
		states[i] = state.toString(colors);

		while (states[i].length < neighborhood)
			states[i] = '0' + states[i];
	}

	return listOfStates = states;
}

// convert ruleNumber to colors-ary representation string
function setRuleString() {
	// base-colors
	var numstr = 
		ruleNumber.toString(colors);

	// pad out with zeros if needed
	while (numstr.length < numberOfStates)
		numstr = '0' + numstr;

	// lop off remainder (just in case)
	while (numstr.length > numberOfStates)
		numstr = numstr.slice(1);

	return ruleString = numstr;
}

/* debugging */

var DEBUG = 0;

function debug() {
	DEBUG = 1 - DEBUG;
}

/* performance monitoring */

var INFO = 0;

function info() {
	INFO = 1 - INFO;
}

var monitor;

function report() {
	console.log(monitor);
	monitor = 0;
}