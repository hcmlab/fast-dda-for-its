import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats
import seaborn as sns
import sys

# Load required data
with open("../data/answer_main_batch.csv", "r") as fp:
	ans = pd.read_csv(fp)

with open("../data/questionnaire_main_batch.csv", "r") as fp:
	questionnaire = pd.read_csv(fp)

with open("../data/4pl_thetas.json", "r") as fp:
	thetas = json.load(fp)

# Rename condition from static-inc to predef
ans.loc[ans["condition"] == "static-inc", "condition"] = "predef"
questionnaire.loc[questionnaire["condition"] == "static-inc", "condition"] = "predef"

# Renumber puzzle cnt to start at 1 from training phase
ans["puzzle_cnt"] -= 3

# Split to train and test results
ans_train = ans[ans["phase"] == "train"]
ans_test = ans[ans["phase"] != "train"]

# Params and colour scheme for plots
plot_figsize = (5.4, 3.3375)
plot_params = { "errorbar": ("ci", 90), "err_style": "band", "legend": True, "dashes": False, "marker": "o" }
plot_params_bar = { "errorbar": ("ci", 90) }
conditions = ["self-det", "predef", "dda"]

plt.rc("font", size = 16)

with sns.color_palette("colorblind"):
	for condition in conditions:
		plt.clf()
		plt.figure(figsize = plot_figsize)
		ax = sns.lineplot(x = "puzzle_cnt", y = "success", data = ans[(ans["phase"] == "train") & (ans["condition"] == condition)], **plot_params)
		ax.set(xlabel = "Training phase time step", ylabel = "Success rate", xlim = (0.5, 12.5), ylim = (0, 1), xticklabels = [])
		plt.xticks(list(range(1, 13)))
		plt.tight_layout()
		plt.savefig("../plots/train_success_rate_%s.png" % condition, dpi = 300, bbox_inches = "tight")
		plt.close()

		plt.clf()
		plt.figure(figsize = plot_figsize)
		ax = sns.lineplot(x = "puzzle_cnt", y = "diff", data = ans[(ans["phase"] == "train") & (ans["condition"] == condition)], **plot_params)
		ax.set(xlabel = "Training phase time step", ylabel = "Difficulty metric", xlim = (0.5, 12.5), ylim = (30, 90), xticklabels = [])
		plt.xticks(list(range(1, 13)))
		plt.tight_layout()
		plt.savefig("../plots/train_diff_%s.png" % condition, dpi = 300, bbox_inches = "tight")
		plt.close()

	# Aggregate test score for each participant
	ans_train_scores = ans_train.groupby("id_int")[["user_id", "condition", "success"]].agg({ "user_id": "min", "condition": "min", "success": "sum" }).rename(columns = { "success": "train"} )
	ans_train_scores.reset_index(inplace = True)

	ans_test["diff"] = ((ans_test["chosen_graph"] - 301) % 6) // 2
	ans_test_sort = ans_test.sort_values(by = ["id_int", "phase", "diff"], ascending = [True, False, True])
	ans_test_sort_pretest = ans_test_sort.loc[ans_test_sort["phase"] == "pre-test"]
	ans_test_sort_posttest = ans_test_sort.loc[ans_test_sort["phase"] == "post-test"]
	ans_test_pretest = ans_test_sort_pretest.groupby("id_int")[["condition", "success"]].agg({ "condition": "min", "success": "sum" }).rename(columns = { "success": "pre" }).reset_index()
	ans_test_posttest = ans_test_sort_posttest.groupby("id_int")[["user_id", "success"]].agg({ "user_id": "min", "success": "sum" }).rename(columns = { "success": "post" }).reset_index()

	ans_test_merge = ans_test_pretest.join(ans_test_posttest[["id_int", "user_id", "post"]].set_index("id_int"), on = "id_int")
	ans_test_merge = ans_test_merge.join(ans_train_scores[["id_int", "train"]].set_index("id_int"), on = "id_int")

	# Calculate normalised learning gain
	ans_test_inc = ans_test_merge.loc[ans_test_merge["post"] > ans_test_merge["pre"]]
	ans_test_dec = ans_test_merge.loc[ans_test_merge["post"] < ans_test_merge["pre"]]

	ans_test_merge["nlg"] = 0.

	ans_test_merge.loc[ans_test_merge["post"] > ans_test_merge["pre"], "nlg"] = (ans_test_inc["post"] - ans_test_inc["pre"]) / (3. - ans_test_inc["pre"])
	ans_test_merge.loc[ans_test_merge["post"] < ans_test_merge["pre"], "nlg"] = (ans_test_dec["post"] - ans_test_dec["pre"]) / (ans_test_dec["pre"])

	# Normalised learning gain by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "nlg", data = ans_test_merge, order = conditions)
	ax.set(xlabel = None, ylabel = "Normalised learning gain")
	ax.set_ylim(-1, 1)
	plt.tight_layout()
	plt.savefig("../plots/test_nlg.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Normalised learning gain by condition and pretest score
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "nlg", hue = "pre", data = ans_test_merge, order = conditions)
	ax.set(xlabel = None, ylabel = "Normalised learning gain")
	ax.set_ylim(-1, 1)
	plt.tight_layout()
	plt.savefig("../plots/test_nlg_pre.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Post test score by condition and pretest score
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "post", hue = "pre", data = ans_test_merge, order = conditions)
	ax.set(xlabel = None, ylabel = "Post test score")
	ax.set_ylim(0, 3)
	plt.tight_layout()
	plt.savefig("../plots/test_pre_post.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Calculate average training difficulty
	ans_train_agg = ans_train.groupby("id_int")[["user_id", "condition", "diff", "success"]] \
		.agg({ "user_id": "min", "condition": "min", "diff": "mean", "success": "sum" }) \
		.rename(columns = { "diff": "train_diff", "success": "train_success" }).reset_index().set_index("id_int")

	# Merge flow scores to train stats
	q_flow = questionnaire[["user_id", "flow_score"]].set_index("user_id")
	ans_train_agg = ans_train_agg.join(q_flow, on = "user_id")
	ans_train_time = ans_train.loc[ans_train["success"] == True, ["id_int", "time"]].groupby("id_int").agg({ "time": "mean" }).rename(columns = { "time": "train_time" }).reset_index().set_index("id_int")

	# Merge train and test together
	ans_train_test_agg = ans_train_agg.join(ans_test_merge.drop(columns = ["condition"]).set_index("user_id"), on = "user_id").set_index("id_int")
	ans_train_test_agg = ans_train_test_agg.join(ans_train_time, on = "id_int")
	
	# Test answers
	ans_ts = ans_test.loc[ans_test["success"] == True]
	ans_t_easy = ans_ts.loc[((ans_test["chosen_graph"] - 301) % 6) // 2 == 0]
	ans_t_med = ans_ts.loc[((ans_test["chosen_graph"] - 301) % 6) // 2 == 1]
	ans_t_hard = ans_ts.loc[((ans_test["chosen_graph"] - 301) % 6) // 2 == 2]

	# Time spent by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.boxplot(x = "condition", y = "time", hue = "phase", data = ans_ts)
	ax.set(xlabel = None, ylabel = "Time (sec)")
	plt.tight_layout()
	plt.savefig("../plots/test_success_time.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Flow score by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	plt.figure(figsize = (7.2, 4.45))
	ax = sns.barplot(x = "condition", y = "flow_score", data = questionnaire, order = ["self-det", "predef", "dda"], **plot_params_bar)
	ax.set(xlabel = None, ylabel = "Flow score", ylim = (0, 7))
	plt.tight_layout()
	plt.savefig("../plots/q_flow.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Effort score by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "effort_score", data = questionnaire, **plot_params_bar)
	ax.set(xlabel = None, ylabel = "Effort score")
	plt.tight_layout()
	plt.savefig("../plots/q_effort.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Performance score by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "performance_score", data = questionnaire, **plot_params_bar)
	ax.set(xlabel = None, ylabel = "Performance score")
	plt.tight_layout()
	plt.savefig("../plots/q_performance.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Difficulty score by condition
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.barplot(x = "condition", y = "difficulty_score", data = questionnaire, **plot_params_bar)
	ax.set(xlabel = None, ylabel = "Difficulty score")
	plt.tight_layout()
	plt.savefig("../plots/q_difficulty.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Participant's age
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.histplot(data = questionnaire, x = "age", hue = "condition")
	ax.set(xlabel = "Age", ylabel = "No. participants")
	plt.tight_layout()
	plt.savefig("../plots/q_age.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Participant's gender
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.countplot(data = questionnaire, x = "condition", hue = "gender")
	ax.set(xlabel = "Gender", ylabel = "No. participants")
	plt.tight_layout()
	plt.savefig("../plots/q_gender.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Game experience by condition
	questionnaire["game_exp"] = questionnaire["exp3"] + questionnaire["exp4"] + questionnaire["exp6"]
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.boxplot(x = "condition", y = "game_exp", data = questionnaire)
	ax.set(xlabel = None, ylabel = "Game experience")
	plt.tight_layout()
	plt.savefig("../plots/q_game_exp.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# CS experience by condition
	questionnaire["cs_exp"] = questionnaire["exp1"] + questionnaire["exp2"] + questionnaire["exp5"]
	plt.clf()
	plt.figure(figsize = plot_figsize)
	ax = sns.boxplot(x = "condition", y = "game_exp", data = questionnaire)
	ax.set(xlabel = None, ylabel = "Computer science experience")
	plt.tight_layout()
	plt.savefig("../plots/q_cs_exp.png", dpi = 300, bbox_inches = "tight")
	plt.close()

	# Histogram of solved training tasks
	for condition in conditions:
		plt.clf()
		plt.figure(figsize = plot_figsize)
		ax = sns.histplot(data = ans_test_merge[ans_test_merge["condition"] == condition], x = "train")
		ax.set(xlabel = "Solved training puzzles", ylabel = "Participants")
		plt.tight_layout()
		plt.savefig("../plots/train_score_%s.png" % condition, dpi = 300, bbox_inches = "tight")
		plt.close()