class LearningUser:
	def __init__(self, starting_diff, variance):
		'''
		Generating a simulated user that can solve exercises of the difficulties given in the 15 optimal difficulties.
		In each step, the optimal solving difficulty is taken as expected value and then the actual solving difficulty
		is taken by adding variance to that.
		Student can improve his ability if he receives an exercise at the right difficulty.
		Student also has boredom and anxiety values, which hinders learning when too high.
		Boredom and anxiety increase when student faces an exercise way too easy or way too hard respectively.
		'''
		self.starting_diff = starting_diff
		self.current_diff = starting_diff
		self.optimal_difficulties = []
		self.variance = variance
		self.boredom = 0
		self.anxiety = 0

	def get_solvable(self, current_exer_index, current_exer_difficulty):
		'''
		Does the simulated user solve the current exercise
		Returns a boolean, whether the exercise is successfully solved
		'''
		expected_max_difficulty = self.current_diff
		normal_distribution = normal(loc = expected_max_difficulty, scale = self.variance)
		actual_max_difficulty = normal_distribution

		self.optimal_difficulties.append(self.current_diff)

		# Change user parameters only during training phase
		if current_exer_index >= 3:
			# Increase anxiety if hard
			if actual_max_difficulty - 2 < current_exer_difficulty:
				self.anxiety += 0.3

			# Increase boredom if too easy
			if actual_max_difficulty - 10 > current_exer_difficulty:
				self.boredom += 0.3

			# Decay anxiety if not too hard
			if actual_max_difficulty - 2 > current_exer_difficulty:
				self.anxiety *= 0.8

			# Decay boredom if not too easy
			if actual_max_difficulty - 10 < current_exer_difficulty:
				self.boredom *= 0.8

			# Learn if right difficulty
			if actual_max_difficulty - 10 < current_exer_difficulty and current_exer_difficulty < actual_max_difficulty - 2 and self.boredom + self.anxiety < 1:
				self.current_diff += 8

		if current_exer_difficulty <= actual_max_difficulty:
			return True
		else:
			return False