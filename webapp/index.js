const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const http = require("http");
const mongo = require("mongodb");
const path = require("path");

const dda_agent = require("./agent/dda_agent.js");
const self_det_agent = require("./agent/self_det_agent.js");

const app = express();
const port = 80;

const EXP_CONDITIONS = ["static-inc", "self-determined", "dda"];
const CUR_EXP_CONDITION = "dda";												// Set experiment condition
const INIT_GRAPHS = [115, 78, 9, 163];

app.use(bodyParser.json());
app.use("/", express.static("public"));

var MongoClient = require("mongodb").MongoClient;
var MongoUrl = "mongodb://localhost:27017/mydb";

var user_cnt = 0;

MongoClient.connect(MongoUrl, function(err, db) {
	if (err) throw err;
	console.log("Database created");
	db.close();
});

app.post("/mongo", (req, res) => {
	let collection = req.body.collection;
	let payload = req.body.payload;
	let time = new Date();

	payload.dt = time.getTime();

	MongoClient.connect(MongoUrl, (err, db) => {
		if(err) {
			res.status(500).send(err);
			throw err;
		}
		let db_name = "dda-study";

		let dbo = db.db(db_name);

		dbo.collection(collection).insertOne(payload, (err, res) => {
			if(err) {
				res.status(500).send(err);
				throw err;
			}
			console.log("Record inserted to", db_name, "at", time);
			db.close();
		});
	});

	res.type("json").send({});
});

app.post("/write_json", (req, res) => {
	let fn = req.body.fn;
	let payload = req.body.payload;

	fs.writeFile(fn, payload, (err) => {
		if (err) throw err;
		console.log("File saved");
	});

	res.type("json").send({});
});

app.post("/request_condition", (req, res) => {
	let session_id = req.body.session_id;
	let user_type = req.body.user;

	// Set condition here
	let condition = CUR_EXP_CONDITION;
	let time = new Date();

	MongoClient.connect(MongoUrl, (err, db) => {
		if(err) {
			res.status(500).send(err);
			throw err;
		}

		let db_name = "dda-study";
		let dbo = db.db(db_name);

		dbo.collection("conditions").insertOne({
			"session_id": session_id,
			"condition": condition,
			"dt": time.getTime()
		}, (err, res) => {
			if(err) {
				res.status(500).send(err);
				throw err;
			}
			console.log("Condition record inserted at", time);
			db.close();
		});
	});

	user_cnt++;

	res.type("json").send({
		"condition": condition
	});
});

// Choose graph for each quiz
app.post("/dda/:quizId", (req, res) => {
	let quiz_id = parseInt(req.params.quizId);
	let chosen_graph = req.body.prev_chosen_graph;
	let played_graphs = req.body.played_graphs;
	let condition = req.body.condition;
	let student_data = req.body.student_data;
	let click_events = req.body.prev_click_events;

	let next_graph = -1;

	console.log(played_graphs)

	if(condition == "static-inc") {
		// fixed sequence for static-inc, easy to hard
		graph_idxs = [[27, 13, 154], [16, 93, 8], [34, 91, 142], [140, 94, 148], [46, 168, 72], [151, 175, 153], [146, 67, 159], [48, 74, 61], [95, 183, 152], [116, 109, 107], [65, 101, 68], [173, 99, 190]];

		next_graph = graph_idxs[played_graphs.length][Math.floor(Math.random() * 3)];
	} else if (condition == "dda") {
		[next_graph, student_data] = dda_agent.game1DDA(chosen_graph, click_events, played_graphs, student_data);
	} else if (chosen_graph == -1) {
		// initial graph for self-determined and dda, chosen from mid-range difficulty
		next_graph = INIT_GRAPHS[Math.floor(Math.random() * 4)];
	} else if(condition == "self-determined") {
		let user_diff_select = req.body.user_diff_select;

		next_graph = self_det_agent.game1SelfDet(chosen_graph, played_graphs, user_diff_select);
	}

	res.type("json").send({
		"chosen_graph": next_graph,
		"student_data": student_data
	});
});

http.createServer(app).listen(port);