import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats

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

# Renumber puzzle cnt to make train puzzles start at 1
ans["puzzle_cnt"] -= 3

# Conditions
conditions = ["predef", "self-det", "dda"]
condition_pairs = [("predef", "self-det"), ("predef", "dda"), ("self-det", "dda")]

# Separate into train and test results
ans_train = ans[ans["phase"] == "train"]
ans_test = ans[ans["phase"] != "train"]

# Aggregate train data for total score
ans_train_agg = ans_train.groupby("id_int")[["user_id", "condition", "diff", "success", "time"]] \
		.agg({ "user_id": "min", "condition": "min", "diff": "mean", "success": "sum" }) \
		.rename(columns = { "diff": "train_diff", "success": "train_success" }).reset_index().set_index("id_int")

# Combine questionnaire data
q_values = questionnaire[["user_id", "gender", "flow_score", "age"]].set_index("user_id")
ans_train_agg = ans_train_agg.join(q_values, on = "user_id")

# Calculate test scores and NLG
ans_test_sort = ans_test.sort_values(by = ["id_int", "phase", "diff"], ascending = [True, False, True])
ans_test_sort_pretest = ans_test_sort[ans_test_sort["phase"] == "pre-test"]
ans_test_sort_posttest = ans_test_sort[ans_test_sort["phase"] == "post-test"]
ans_test_pretest = ans_test_sort_pretest.groupby("id_int")[["user_id", "condition", "success"]].agg({ "user_id": "min", "condition": "min", "success": "sum" }).rename(columns = { "success": "pre" })
ans_test_posttest = ans_test_sort_posttest.groupby("id_int")[["condition", "success"]].agg({ "condition": "min", "success": "sum" }).rename(columns = { "success": "post" })
ans_test_merge = ans_test_pretest.join(ans_test_posttest["post"])

ans_test_inc = ans_test_merge[ans_test_merge["post"] > ans_test_merge["pre"]]
ans_test_dec = ans_test_merge[ans_test_merge["post"] < ans_test_merge["pre"]]

ans_test_merge["nlg"] = 0.

ans_test_merge.loc[ans_test_merge["post"] > ans_test_merge["pre"], "nlg"] = (ans_test_inc["post"] - ans_test_inc["pre"]) / (3. - ans_test_inc["pre"])
ans_test_merge.loc[ans_test_merge["post"] < ans_test_merge["pre"], "nlg"] = (ans_test_dec["post"] - ans_test_dec["pre"]) / (ans_test_dec["pre"])

# Combine train and test scores
ans_train_test_agg = ans_train_agg.join(ans_test_merge.drop(columns = ["condition"]).set_index("user_id"), on = "user_id")

# Combine fitted theta values
thetas_pd = pd.DataFrame(list(thetas.items()), columns = ["user_id", "theta"])

theta_train_test = ans_train_test_agg.join(thetas_pd.set_index("user_id"), on = "user_id")

for condition in conditions:
	cond_successes = ans_train_agg.loc[ans_train_agg["condition"] == condition, "train_success"]
	cond_diffs = ans_train_agg.loc[ans_train_agg["condition"] == condition, "train_diff"]
	print("Average training success in condition %s = %.4f +- %.4f, average diff = %.4f +- %.4f-" % (condition, cond_successes.mean(), cond_successes.std(), cond_diffs.mean(), cond_diffs.std()), stats.ttest_1samp(cond_successes, 7.2))

print("\n")

# Theta - post-test correlation
for condition in ["predef", "self-det", "dda"]:
	cond_theta = theta_train_test.loc[theta_train_test["condition"] == condition, "theta"]
	cond_post = theta_train_test.loc[theta_train_test["condition"] == condition, "post"]

	print("%s: Correlation Theta-Posttest" % condition, stats.spearmanr(cond_theta, cond_post))
	
print("")