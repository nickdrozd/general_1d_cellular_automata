var colors = 3;
var range = 1;
var ruleNumber = parseInt('201101010' +
						  '101000102' +
						  '202102110',3); // parseInt(num,base)
var seedingProb = 2;

/*
	interesting examples: (colors,range,ruleNumber)
	(2, 2, 4294967296 / 2 + 9)
	(3, 1, 7.6255975e12 / 3 + 23)
	(3, 1, parseInt('022101210121201210212111210', 3)
	(3, 1, parseInt('022100211120201212212011210', 3))
	(3, 1, parseInt('012012112101101121210212210', 3))
	(3, 1, parseInt('012012210'+'101101110'+'011202210', 3)) <-- rule 110?
*/

var neighborhood = 2 * range + 1;
var numberOfStates = Math.pow(colors, neighborhood);
var listOfStates = possibleStates();

/****************/

var cellSize = 2;
var frame = 3;

var screenWidth = screen.availWidth;
var screenHeight = screen.availHeight;

var rows = Math.round((screenHeight / cellSize));
var columns = Math.round((screenWidth / cellSize));

function setup() {
	createCanvas(screenWidth,screenHeight);
	background(100);
	//frameRate(frame);
	//noLoop();
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
			cell.row = 0;
		});
		count = 0;
	}
}

/****************/

// choose initial coloring
function initialCells() {

	var cells = [];

	for (var i = 0; i < columns; i++) 
		cells.push(new Cell(i,0,0));

	/**
		Choose one of the three initial colorings!
	*/

	// single cell in the middle (which color?)
//	cells[Math.round(columns / 2)].color = colors - 1;
/*
	// coloring corresponds to column
	cells.forEach(function(cell) {
		cell.color = cell.column % colors;
	})
*/

	// random initial coloring (with two colors -- all?)
	cells.forEach(function(cell) {
		if (seedingProb <= Math.random() * 100)
			cell.color = 0;
		else
			cell.color = Math.floor(Math.random() * colors);
	})


	// update neighbors and fillColor in light of coloring
	// use variable instead cells[i]
	// use forEach?
	for (var i = 0; i < columns; i++) {
		cells[i].neighbors = newNeighbors(cells[i], cells);
		cells[i].fillColor = newFillColor(cells[i]);
		cells[i].hexColor = newHexColor(cells[i]);
		//cells[i].historyTotal += cells[i].color;
	}

	return cells;
}

function updatedCells(cells) {

	var newCells = [];

	// update information
	cells.forEach(function(cell) {
		newCells.push(new Cell(cell.column, cell.row +1,
								newColor(cell)));
	});

	// update in light of new color
	// use forEach?
	for (var i = 0; i < columns; i++) {
		newCells[i].neighbors =
					newNeighbors(cells[i], newCells);
		newCells[i].fillColor = newFillColor(cells[i]);
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
	// option 1: anything off the screen is 0
/*
	for (var i = start, j = 0; i < stop; i++, j++) {
			if (i < 0 || i >= cells.length)
				neighborList[j] = 0;
			else
				neighborList[j] = cells[i].color;
	}
*/
	// option 2: wrap around

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

	return neighborList;
}

// number in range(0,colors)
function newColor(cell) {
	
	var neighbors = cell.neighbors.join('');

	var index = 0;
	while (listOfStates[index] != neighbors)
		index++;

	var rule = convertNumber(ruleNumber);

	return Number(rule[index]);
}

// decimal number
function newFillColor(cell) {
	if (cell.color == 0)
		return 0;
	else
		return 255 / (colors - 1) * cell.color;
}

// hex string
function newHexColor(cell) {
	var code;
	if (cell.color == 0)
		code = 255;
	else
		code = 16777216 / (colors - 1) * cell.color;

	//code = (code + 20) % 16777216;

	var code = code.toString(16);
	while (code.length < 6)
		code = '0' + code;
	return '#' + code;
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

// Cell class -- other attributes needed?
// are dummy initial values necessary?
function Cell (column, row, color) {
	this.column = column;
	this.x = column * cellSize;
	this.row = row;
	this.y = row * cellSize
	this.color = color;
	//this.historyTotal = 0;

	// fillColor is what actually gets read by the draw functions
	// how can this be extended to fun colors?
	this.fillColor = 0;
	this.hexColor = '#000000';

	// the colors of the cells neighbors (including itself)
	// this gets converted to a string later -- should it be a string now?
	this.neighbors = [];
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