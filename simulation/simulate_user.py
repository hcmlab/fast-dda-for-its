# Simulates students to run through experiment sessions, and generates plots of those runs
# To simulate the DDA condition, the web app needs to be running on localhost to calculate next DDA exercise

import copy
import itertools
import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import random
import requests
import seaborn as sns
import sys

from matplotlib.colors import LogNorm, Normalize
from numpy.random import normal

from learning_user import LearningUser

# URL to DDA API
API_URL = "http://localhost/dda/1"

# List of graphs in predef condition
PREDEF_GRAPHS = [27, 16, 34, 140, 46, 175, 146, 48, 95, 116, 65, 173]
PLOT_PARAMS = { "errorbar": ("ci", 90), "err_style": "band", "legend": True, "marker": "o" }

# Initial student record for the DDA calculation
INIT_STUDENT_DATA = {
	"theta": 0.08959176,
	"history": [],
	"play_count": 0,
	"cumu_success": 0,
	"cumu_fail": 0,
	"cumu_timeout": 0
}

EXER_DIFFS = {}

# Load exercise diffs
with open("../webapp/public/assets/graph-1/graph-1-q1-diffs.json", "r") as fp:
	diffs = json.load(fp)

	for i in itertools.chain(range(1, 192), range(301, 307)):
		diff_obj = diffs["graph-1-q1-%d.json" % i]
		diff_obj["diff"] = diff_obj["mis_size"] / diff_obj["prob"] + diff_obj["edges"] + diff_obj["vertices"]

		EXER_DIFFS[i] = diff_obj

# Run simulated students through the experiment
# user_gen_fx: lambda function to generate a new student
# num_trials: how many students to evaluate
# exer_mode: selects how the exercises are chosen, "dda", "random", and "predef" are possible
# suffix: filename suffix for saving plots
def simulateDDA(user_gen_fx, num_trials = 50, exer_mode = "dda", suffix = ""):
	pre_tests = [301, 303, 305]
	n_training = 12

	agg_steps = []
	agg_diffs = []
	agg_successes = []
	learning_gains = []
	opt_diffs = []

	for _ in range(num_trials):
		# Generates a new user
		user = user_gen_fx()

		traj_diffs = [EXER_DIFFS[pre_test]["diff"] for pre_test in pre_tests]
		successes = []

		# Reset student data
		student_data = copy.deepcopy(INIT_STUDENT_DATA)

		# Pre-test phase
		random.shuffle(pre_tests)

		for i, pre_test in enumerate(pre_tests):
			success = user.get_solvable(i, EXER_DIFFS[pre_test]["diff"])

			# Push one event into student's history
			student_data["history"].append({
				"graph_idx": pre_test,
				"success": success,
				"time": 45,																					# Constant time value, since not used in further calculation
				"cumu_success": student_data["cumu_success"],
				"cumu_fail": student_data["cumu_fail"],
				"cumu_timeout": student_data["cumu_timeout"]
			})

			if success:
				student_data["cumu_success"] += 1
			else:
				student_data["cumu_fail"] += 1

			successes.append(success)

		played_graphs = pre_tests[:]																		# Record past graphs to prevent picking duplicates

		# Training phase
		for i in range(n_training):
			# Choose graph depending on mode of selection
			if exer_mode == "dda":
				r = requests.post(url = API_URL, json = {													# Request new DDA exercise through API
						"condition": "dda",
						"played_graphs": played_graphs,
						"prev_chosen_graph": played_graphs[-1],
						"prev_click_events": [],
						"prev_graph": { "quiz": 1, "graph": played_graphs[-1] },
						"user_diff_select": "",
						"student_data": student_data
					})

				json_r = json.loads(r.text)

				chosen_graph = json_r["chosen_graph"]
				student_data = json_r["student_data"]
			elif exer_mode == "random":																	# Random graph
				chosen_graph = random.randint(1, 191)
			elif exer_mode == "predef":
				chosen_graph = PREDEF_GRAPHS[i]																# Predefined list of graphs, starting from easy and get harder

			# Pass exercise to student, student might learn in the process
			success = user.get_solvable(i + 3, EXER_DIFFS[chosen_graph]["diff"])

			# Store current event
			played_graphs.append(chosen_graph)
			student_data["history"].append({
				"graph_idx": chosen_graph,
				"success": success,
				"time": 45,
				"cumu_success": student_data["cumu_success"],
				"cumu_fail": student_data["cumu_fail"],
				"cumu_timeout": student_data["cumu_timeout"]
			})

			# Update student's history
			if success:
				student_data["cumu_success"] += 1
			else:
				student_data["cumu_fail"] += 1

			successes.append(success)
			traj_diffs.append(EXER_DIFFS[chosen_graph]["diff"])

		# Record all training phase events from simulation to one large list, combining every students
		agg_steps += list(range(len(pre_tests) + n_training))[3:]
		agg_diffs += traj_diffs[3:]
		opt_diffs += copy.deepcopy(user.optimal_difficulties)[3:]
		agg_successes += successes[3:]
		learning_gains.append(user.current_diff - user.starting_diff)

	# Compile into Pandas DataFrame for plotting and processing
	data = pd.DataFrame()
	data["agg_steps"] = agg_steps
	data["agg_diffs"] = agg_diffs
	data["agg_successes"] = agg_successes
	data["opt_diffs"] = opt_diffs

	# Shift step number to align in plotting
	data["agg_steps"] = data["agg_steps"] - 2

	with sns.color_palette("colorblind"):
		# Plot student's ability and received exercise difficulty
		plt.clf()
		plt.figure(figsize = (5.4, 3.3375))
		ax = sns.lineplot(x = "agg_steps", y = "agg_diffs", data = data, **PLOT_PARAMS)
		ax = sns.lineplot(x = "agg_steps", y = "opt_diffs", data = data, **PLOT_PARAMS)
		ax.set(xlabel = "Training phase time step", ylabel = "Difficulty", xlim = (0.5, 12.5), ylim = (31, 79), xticklabels = [])
		plt.xticks(list(range(1, 13)))
		plt.savefig("../plots_simulation/sim_diffs_%s.png" % suffix, dpi = 300, bbox_inches = "tight")

		# Success rate for each training time step
		plt.clf()
		ax = sns.lineplot(x = "agg_steps", y = "agg_successes", data = data, **PLOT_PARAMS)
		ax.set(xlabel = "Time step", ylabel = "Success rate")
		plt.tight_layout()
		plt.savefig("../plots_simulation/sim_success_%s.png" % suffix, dpi = 300, bbox_inches = "tight")

	return data, learning_gains

if __name__ == "__main__":
	plt.rc("font", size = 14)

	# Simulate DDA runs for different low-medium-high performing student groups
	data_lo, dda_lg = simulateDDA(lambda: LearningUser(random.randint(35, 45), variance = 15), exer_mode = "dda", suffix = "dda_low")
	data_med, dda_lg = simulateDDA(lambda: LearningUser(random.randint(45, 55), variance = 15), exer_mode = "dda", suffix = "dda_med")
	data_hi, dda_lg = simulateDDA(lambda: LearningUser(random.randint(55, 65), variance = 15), exer_mode = "dda", suffix = "dda_hi")

	# Simulate baseline for mixed user group
	user_gen = lambda: LearningUser(random.randint(35, 65), variance = 15)
	data_predef, predef_lg = simulateDDA(user_gen, num_trials = 150, exer_mode = "predef", suffix = "predef")
	data_rnd, rnd_lg = simulateDDA(user_gen, num_trials = 150, exer_mode = "random", suffix = "rnd")

	# Combine data from all ability groups
	data_lo["init_ability"] = "Low"
	data_med["init_ability"] = "Medium"
	data_hi["init_ability"] = "High"

	data_dda = pd.concat([data_lo, data_med, data_hi], axis = 0)

	for exer_mode, df in zip(["DDA", "Predef", "Random"], [data_dda, data_predef, data_rnd]):
		# Number of correctly solved exercises
		success_totals = [np.sum(x) for x in np.array_split(df["agg_successes"], len(df["agg_successes"]) / 12)]
		print("%s - Successes %.4f +- %.4f" % (exer_mode, np.mean(success_totals), np.std(success_totals)))