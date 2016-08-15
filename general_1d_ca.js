/*
	interesting examples: (colors,range,ruleNumber)
	(13, 2, 82335290282357228)
	(5, 1, 8233529028753458969)
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

var colors = 13;
var range = 2;
var ruleNumber = 9203874572280928347; // decimal int

// var colors = 2;
// var range = 1;
// var ruleNumber = 110;

// draw parameters

/* 
	* hex color format: #RRGGBB
	* ff is "high intensity", 00 is "low intensity"
	* #000000 is black (low on all colors)
	* #fffffff is white (high on all colors)
*/

var emptyColor = '9922aa'; // hex string

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
var ruleString; // ruleNumber in colors-ary

const rgbMax = 255;
const hexMax = Math.pow(rgbMax + 1, 3) - 1; // = 16777215

/* drawing */

const screenWidth = screen.availWidth; // * .49;
const screenHeight = screen.availHeight; // * .88;

const rows = Math.round((screenHeight / cellSize));
const columns = Math.round((screenWidth / cellSize));

// basic P5 setup
function setup() {
	createCanvas(screenWidth,screenHeight);
	background(100);
	// frameRate(frame);
	// noLoop()
}

var cells;

initialize();

var count = 0;

/* fill and rect are the only real P5 functions 
	in this entire program */
function draw() {
	cells.forEach(function(cell) {
		const x_co = getCoordinate(cell.column);
		const y_co = getCoordinate(cell.row);
		const hexColor = 
			convertToHexColor(cell.color);

		// P5 functions
		fill(hexColor);
		rect(x_co, y_co, cellSize, cellSize);
	});

	count++;

	updateCells();

	// reset rows at the bottom of the page
	if (count > rows) {
		cells.forEach(function(cell) {
			cell.row = -1; // row will get incremented
		});

		count = 0;

		// loopThroughRules();
		// loopThroughColors();

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

	return ruleNumber;
}

function loopThroughColors() {
	const parsed = parseInt(emptyColor, 16);
	const degree = 10000000; // input variable?
	const change = Math.floor(Math.random() * degree);
	const raised = (parsed + change) % hexMax;
	const hexxed = raised.toString(16);

	if (INFO)
		console.log(emptyColor);

	return emptyColor = hexxed;
}

function getCoordinate(place) {
	return place * cellSize;
}

function initialize() {
	monitor = 0;
	setConstants();
	initializeCells();
}

/* cells */

function Cell (column, row, color) {
	this.column = column;
	this.row = row;
	this.color = color;

	// the colors of the cell and its neighbors
	this.neighbors = 0;
}

function initializeCells() {
	return cells = initialCells();
}

function updateCells() {
	// loopThroughColors();
	return cells = updatedCells();
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
	})

	return cells;
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
	})

	return newCells;
}

function newNeighbors(cell, cells) {
	var neighborString = '';

	const start = cell.column - range;
	const stop = start + neighborhood;
	const length = cells.length;

	// edge conditions

	var color;

	// option 1: wrap around
	if (edgeCondition == 'wrap') {
		for (var i = start; i < stop; i++) {
			// past left edge
			if (i < 0) 
				color = cells[length + i].color;

			// past right edge
			else if (i >= length) 
				color = cells[i % length].color;

			else 
				color = cells[i].color;

			neighborString += color;
		}
	}

	// option 2: anything off the screen is 0
	if (edgeCondition == 'dead') {
		for (var i = start; i < stop; i++) {
			// past either edge
			if (i < 0 || i >= length)
				color = 0;

			else
				color = cells[i].color;

			neighborString += color;
		}
	}

	return neighborString;
}

// number in range(0,colors)
function newColor(cell) {
	const neighborNum = 
		parseInt(cell.neighbors, colors);

	// states are listed "backwards"
	const index = 
		numberOfStates - 1 - neighborNum;

	const color = ruleString[index];
 
	return Number(color);
}

/* rules, states, conversions */

function setConstants() {
	setNeighborhood();
	setNumberOfStates();
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

function convertToHexColor(color) { 
	const hexDiff = Math.floor(hexMax / colors);
	const emptyColorStr = emptyColor;

	// background / empty color
	if (color == 0)
		return '#' + emptyColorStr;

	const emptyColorVal = 
		parseInt(emptyColorStr, (16));

	const hexVal = 
		(emptyColorVal + (hexDiff * color)) % hexMax;

	const hexStr = hexVal.toString(16);

	return '#' + hexStr;
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