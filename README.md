# general_1d_cellular_automata

You know Conway's Game of Life? This is like that, but in one dimension.

INSTRUCTIONS

Download everything and open general_1d_ca.html in a browser. Then sit back and enjoy!

Right now there is no user interface, so if you want to change the pattern, you have to modify the source code. The relevant variables have been grouped together at the top of general_1d_ca.js to make this convenient.

* colors : the number of states a cell can have. colors must be at least 2, and things start to get slow if colors goes higher than 15 or so.
* range : how many neighbors on either side a cell 'looks at' to determine its next color. Above 3 and things get slow.
* ruleNumber : determines how cells get updated, given the states of their neighbors. ruleNumber is a decimal integer that encodes a rule (see https://en.wikipedia.org/wiki/Wolfram_code)

Let neighborhood = (2 * range) + 1 (the range on either side of a cell plus the cell itself). Let c = colors and n = neighborhood. A cell with its neighborhood can be in c^n different states (c different states for each of n cells). A cell can be updated to one of c different states, so there are c^(c^n) different update rules. 

For colors = 2 and range = 1 (the simplest nontrivial configuration), there are 256 rules. For colors = 2 and range = 2 there are some 4 billion rules, and for colors = 3 and range = 1 there are well over 7 trillion rules. Almost all of these rules are boring.

An interesting example is {colors = 2, range = 1, ruleNumber = 110}. This CA is supposed to be Turing Complete. Other fun rule numbers for c=2 and r=1 are rules 30 and 90. See https://en.wikipedia.org/wiki/Elementary_cellular_automaton for more details.

There are other variables to play with in the program. Read the source to find them!
