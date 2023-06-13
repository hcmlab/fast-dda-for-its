const fs = require("fs");

const N_GAME1_PUZZLES = 191;

var GAME1_PROPS = [];
var GAME1_DIFFS = {};

// read in puzzle properties
fs.readFile('./public/assets/graph-1/graph-1-q1-diffs.json', 'utf8', (err, data) => {
	if (err) {
		console.log(`Error reading file from disk: ${err}`);
	} else {
		GAME1_PROPS = JSON.parse(data);

		for(let i = 1; i <= N_GAME1_PUZZLES; i++)
		{
			let prob = GAME1_PROPS[`graph-1-q1-${i}.json`]["prob"];
			let mis_size = GAME1_PROPS[`graph-1-q1-${i}.json`]["mis_size"];
			let vertices = GAME1_PROPS[`graph-1-q1-${i}.json`]["vertices"];
			let edges = GAME1_PROPS[`graph-1-q1-${i}.json`]["edges"];

			GAME1_DIFFS[i] = mis_size / prob + edges + vertices;
		}
	}
});

function game1SelfDet(chosen_graph, played_graphs, pref)
{
	let pref_diff = GAME1_DIFFS[chosen_graph];

	if(pref == "inc") {
		pref_diff += 11 / (1 + 0.03 * played_graphs.length);
	} else if (pref == "dec") {
		pref_diff -= 11 / (1 + 0.03 * played_graphs.length);
	}

	let dists = [];

	for(let i = 1; i <= N_GAME1_PUZZLES; i++)
	{
		if(played_graphs.indexOf(i) != -1)
		{
			continue;
		}

		dists.push({
			"dist_diff": Math.abs(pref_diff - GAME1_DIFFS[i]),
			"idx": i
		});
	}

	dists.sort((a, b) => a["dist_diff"] - b["dist_diff"] );

	let opt_idx = dists[Math.floor(Math.random() * 3)]["idx"];
	
	console.log(`[Self determined] Choose puzzle ${opt_idx} with solving prob ${GAME1_PROPS[`graph-1-q1-${opt_idx}.json`]["prob"]} and diff ${GAME1_DIFFS[opt_idx]}`);

	return opt_idx;
}

module.exports = {
	game1SelfDet: game1SelfDet
};