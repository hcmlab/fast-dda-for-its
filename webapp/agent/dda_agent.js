const { exec } = require("child_process");
const fs = require("fs");

const N_GAME1_PUZZLES = 191;

var GAME1_DIFFS = {};

// Trained parameters for DDA
const THETA_MEAN = 0.00355593, THETA_STD = 0.16135972;
const CT_SOLVED = 11.04627041;
const CB_SOLVED = [0.25755704, 6.07254928, -0.33565597, 0.00886291, -0.06892614, 0.04141465, 0.78820168];
const C_SOLVED = 0.0905646, D_SOLVED = 0.88630125;

const DESIRED_PROB = 0.6;
const TIME_UPDATE_FACTOR = 1;
const STEP_DECAY = 0.7;

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

		// Test puzzles
		for(let i = 301; i <= 306; i++)
		{
			let prob = GAME1_PROPS[`graph-1-q1-${i}.json`]["prob"];
			let mis_size = GAME1_PROPS[`graph-1-q1-${i}.json`]["mis_size"];
			let vertices = GAME1_PROPS[`graph-1-q1-${i}.json`]["vertices"];
			let edges = GAME1_PROPS[`graph-1-q1-${i}.json`]["edges"];

			GAME1_DIFFS[i] = mis_size / prob + edges + vertices;
		}
		
		fs.readFile('./public/assets/graph-1/graph-1-q1-intersects.json', 'utf8', (err, data) => {
			if (err) {
				console.log(`Error reading file from disk: ${err}`);
			} else {
				obj = JSON.parse(data);

				for(let i = 1; i <= N_GAME1_PUZZLES; i++)
				{
					GAME1_PROPS[`graph-1-q1-${i}.json`]["intersects"] = obj[`graph-1-q1-${i}.json`];
				}

				// Test puzzles
				for(let i = 301; i <= 306; i++)
				{
					GAME1_PROPS[`graph-1-q1-${i}.json`]["intersects"] = obj[`graph-1-q1-${i}.json`];
				}
			}
		});
	}
});

function sigmoid(x)
{
	return 1 / (1 + Math.exp(-x));
}

function sigmoid_deriv(x)
{
	return (1 - x) - (1 - x) * (1 - x);
}

function dot_prod(a, b)
{
	let res = 0;

	for(i = 0; i < a.length; i++)
	{
		res += a[i] * b[i];
	}

	return res;
}

function game1DDA(chosen_graph, click_events, played_graphs, student_data)
{
	let theta = student_data["theta"];
	let d_theta = -1;
	let iter = 0;

	// Run gradient descent to update theta value until convergent
	while(Math.abs(d_theta) > 1e-6 || iter < 200) {
		d_theta = 0;

		// Loop through events
		for(let i = 0; i < student_data["history"].length; i++)
		{
			d_theta *= STEP_DECAY;

			let play = student_data["history"][i];

			let graph_idx = play["graph_idx"];
			let success = play["success"];
			let time = play["time"];

			let g_diff = GAME1_DIFFS[parseInt(graph_idx, 10)];
			let g_mis = GAME1_PROPS[`graph-1-q1-${graph_idx}.json`]["mis_size"];
			let g_prob = GAME1_PROPS[`graph-1-q1-${graph_idx}.json`]["prob"];
			let g_vtx = GAME1_PROPS[`graph-1-q1-${graph_idx}.json`]["vertices"];
			let g_edges = GAME1_PROPS[`graph-1-q1-${graph_idx}.json`]["edges"];
			let g_int = GAME1_PROPS[`graph-1-q1-${graph_idx}.json`]["intersects"];

			let g_beta = [g_mis, g_prob, g_vtx, g_edges, g_int, i + 1, 1];

			let logit = CT_SOLVED * theta + dot_prod(CB_SOLVED, g_beta);
			let solve_prob = C_SOLVED + (D_SOLVED - C_SOLVED) * sigmoid(logit);

			if(success == true)
			{
				// Puzzle solved
				d_theta += CT_SOLVED * (D_SOLVED - C_SOLVED) * solve_prob / (D_SOLVED * Math.exp(logit) + C_SOLVED);
			} else {
				// Puzzle blundered
				d_theta -= CT_SOLVED * (C_SOLVED - D_SOLVED) * solve_prob / ((D_SOLVED - 1) * Math.exp(logit) + C_SOLVED - 1);
			}
		}

		// Prior on normal distribution
		d_theta -= (theta - THETA_MEAN) / THETA_STD / THETA_STD / student_data["history"].length;

		theta += d_theta * 0.001;
		iter += 1
	}

	console.log("Updated theta = ", theta);

	student_data["theta"] = theta;
	student_data["play_count"]++;

	// query next graph
	let opt_idx = -1;
	let opt_timeout_prob = -1;
	let opt_solve_prob_raw = -1;
	let opt_solve_prob = -1;
	let min_diff = -1;
	let max_solve_prob = -1;

	for(let i = 1; i <= N_GAME1_PUZZLES; i++)
	{
		if(played_graphs.indexOf(i) != -1)
		{
			continue;
		}

		let g_diff = GAME1_DIFFS[i];
		let g_mis = GAME1_PROPS[`graph-1-q1-${i}.json`]["mis_size"];
		let g_prob = GAME1_PROPS[`graph-1-q1-${i}.json`]["prob"];
		let g_vtx = GAME1_PROPS[`graph-1-q1-${i}.json`]["vertices"];
		let g_edges = GAME1_PROPS[`graph-1-q1-${i}.json`]["edges"];
		let g_int = GAME1_PROPS[`graph-1-q1-${i}.json`]["intersects"];
		let u_success = student_data["cumu_success"];
		let u_fail = student_data["cumu_fail"];
		let u_timeout = student_data["cumu_timeout"];

		// let g_beta = [g_diff, g_mis, g_prob, g_vtx, u_success, u_fail, u_timeout, 1];
		let g_beta = [g_mis, g_prob, g_vtx, g_edges, g_int, student_data["history"].length + 1, 1];

		let solve_prob = C_SOLVED + (D_SOLVED - C_SOLVED) * sigmoid(CT_SOLVED * theta + dot_prod(CB_SOLVED, g_beta));

		if(Math.abs(solve_prob - DESIRED_PROB) < Math.abs(opt_solve_prob - DESIRED_PROB))
		{
			opt_solve_prob = solve_prob;
			opt_idx = i;
		}

		if(solve_prob > max_solve_prob)
		{
			max_solve_prob = solve_prob;
			min_diff = g_diff;
		}
	}

	let debug_data = {
		"last_graph_diff": GAME1_DIFFS[student_data["history"][student_data["history"].length - 1]["graph_idx"]],
		"rec_diff": GAME1_DIFFS[opt_idx],
		"rec_solve_prob": opt_solve_prob
	}

	student_data["debug"] = debug_data;

	console.log(`[DDA] Choose puzzle ${opt_idx} with difficulty ${GAME1_DIFFS[opt_idx]} and est. solving prob. ${opt_solve_prob}`);
	console.log(`[DDA] Max solve prob ${max_solve_prob} at difficulty ${min_diff}`);

	return [opt_idx, student_data];
}

module.exports = {
	game1DDA: game1DDA
};