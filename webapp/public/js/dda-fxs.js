/*********************************************************************
Data collection consent
*********************************************************************/
function ddaConsent()
{
	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	main_card.append(`
		<h3 id="activity-text">Puzzle Study - Consent Form</h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<p>Hello! Thank you for participating in the study. We at the chair of Human-Centered Artificial Intelligence (HCAI) of the University of Augsburg are investigating effects of computerised training on mental tasks.</p>
		<p>By participating in this study you are actively supporting our research and helping us to improve online education.</p>
		<p>This course takes about 20 - 30 minutes to complete.</p>
		<p>Principal investigator: Anan Schütt (anan.schuett@uni-a.de)</p>
		<h5>Task Description</h5>
		<p>Please consider this information carefully before deciding whether to participate in this study.</p>
		<p>PURPOSE OF RESEARCH: Researching for suitable difficulty levels for exercises in computer-assisted practice.</p>
		<p>WHAT YOU WILL DO: There will be a series of puzzles. Your task will be to solve them as accurately and quickly as possible.</p>
		<p>RISKS: There are no anticipated risks associated with participating in this study. The effects of participating should be comparable to those you would experience from viewing a computer monitor for 20 - 30 minutes and using a mouse.</p>
		<p>LIMITATIONS: You must also be fluent in English to take part in this study. This task is also unsuitable for color-blind participants.</p>
		<p>COMPENSATION: A payment of 3.90 GBP. You will also be paid an extra, maximum of 0.20 GBP depending on the time you use, for each successfully solved <b>test</b> puzzle.</p>
		<p>CONFIDENTIALITY: Your participation in this study will remain confidential. Your responses will be assigned a code ID, which is not traceable. You will NOT be asked to provide your name. You will be asked to provide your age, gender, educational background, as well as your experience with puzzles and mathematics. Throughout the experiment, we may collect data such as browser type and your actions on the page. The records of this study will be kept private. Research records will be kept in a locked file; only the researchers will have access to the records.</p>
		<p>PARTICIPATION AND WITHDRAWAL: Your participation in this study is voluntarily. You may withdraw at any time by closing the web page of the task.</p>
		<p>DATA REGULATION: Your data will be processed for the following purposes:</p>
		<ul>
			<li><p>Analysis of the user's responses and evaluation during the practice</p></li>
			<li><p>Scientific publication based on the results of the above analyses</p></li>
		</ul>
		
		<p>Your data will be processed on the basis of Article 6 paragraph 1 subparagraph 1 letter a GDPR. Data, which is related to your person, will be deleted by 01.01.2027 at the latest.</p>
		<p>You are entitled to the following rights (for details see <a href="https://www.uni-augsburg.de/de/impressum/datenschutz/">https://www.uni-augsburg.de/de/impressum/datenschutz/</a>):</p>
		<ul>
			<li><p>You have the right to receive information about the data stored about your person.</p></li>
			<li><p>Should incorrect personal data be processed, you have the right to correct it.</p></li>
			<li><p>Under certain conditions, you can demand the deletion or restriction of the processing as well as object to the processing.</p></li>
			<li><p>In general, you have a right to data transferability.</p></li>
			<li><p>Furthermore, you have the right of appeal to the Bavarian State Commissioner for Data Protection.</p></li>
		</ul>
		<p>You can revoke your consent for the future at any time. The legality of the data processing carried out on the basis of the consent until revocation is not affected by this.</p>
		<p>CONTACT: This study is conducted by researchers at the University of Augsburg. If you have any questions or concerns about this study, please contact Anan Schütt (anan.schuett@uni-a.de).</p>
		<p>The responsible data protection officer is Prof. Dr. Ulrich M. Gassner, University of Augsburg, Universitätsstraße 24, 86159 Augsburg, e-mail: datenschutzbeauftragter@uni-augsburg.de, Tel. 0821/598-4600.</p>
	`);

	var agree_btn = $("<button class='btn btn-primary ml-auto mr-2 px-4'>Accept</button>");
	agree_btn.click(() => {
		agree_btn.prop("disabled", true);

		logEvent("dda85", "consent-accept", {});
		window.scrollTo(0, 0);
		window.controller.triggerNextPage();
	});

	main_card.append(agree_btn);
}

/*********************************************************************
Puzzle 1 - Independent set
*********************************************************************/
function ddaPuzzle(played_graphs,
				   is_tutorial,
				   num_repeats,
				   event_label,
				   selected_graphs = [],
				   user_diff_select = false,
				   is_test = false,
				   chosen_graph_endpoint = "/dda/1",
				   prev_chosen_graph = -1,
				   prev_click_events = [])
{
	function setupPage(chosen_graph)
	{
		var click_events = [];		// stores click events and answer checker

		logEvent("dda85", event_label, {
			"chosen_graph": chosen_graph
		});

		var quizEndFx = basicQuizScreen("Puzzle Study", true, true, (focus_log, is_skip, diff_pref) => {
			recordAnswer(event_label, {
				"focus_log": focus_log,
				"is_skip": is_skip,
				"chosen_graph": chosen_graph,
				"click_events": click_events
			});

			played_graphs.push(chosen_graph);

			// add previous plays to student data if not tutorial level
			if(!is_tutorial)
			{
				let time_start = click_events[0]["dt"];
				let time_end = click_events[click_events.length - 1]["dt"];
				let puzzle_time = 90;
				let success = false;

				if(click_events[click_events.length - 1]["type"] == "valid-solution") {
					success = true;
					puzzle_time = (time_end - time_start) / 1000;
				}

				let cumu_success = window.student_data["cumu_success"];
				let cumu_fail = window.student_data["cumu_fail"];
				let cumu_timeout = window.student_data["cumu_timeout"];

				window.student_data["history"].push({
					"graph_idx": chosen_graph,
					"success": success,
					"time": puzzle_time,
					"cumu_success": cumu_success,
					"cumu_fail": cumu_fail,
					"cumu_timeout": cumu_timeout
				});

				if(success) {
					window.student_data["cumu_success"]++;
				} else if(puzzle_time >= 85) {
					window.student_data["cumu_timeout"]++;
				} else {
					window.student_data["cumu_fail"]++;
				}
			}

			if(num_repeats <= 1)
			{
				window.controller.triggerNextPage();
			} else {
				ddaPuzzle(played_graphs, is_tutorial, num_repeats - 1, event_label, selected_graphs.slice(1), diff_pref, is_test, chosen_graph_endpoint, chosen_graph, click_events);
			}
		}, is_tutorial? -1 : 90, (user_diff_select != false) && (num_repeats != 1));

		if(is_tutorial) {
			$("#instruction-container-div").prepend(`
				<p style="color: red;">Please carefully read all the instructions before proceeding!</p>
				<p>This is the tutorial task to help you understand what to do. Please complete the task correctly. There is no time limit for this puzzle, but there will be one for the next puzzles.</p>
				<p>Below you will see a network of lines and dots. Your task is to pick 4 dots such that none of them are connected by a line. You will receive many such puzzles with the same instructions, but with a different number of dots (mostly higher).</p>
				<p>Click on the dots to select them. You can also un-select a selected dot by clicking on it again, or use the clear button in the upper right to un-select all of them. The selected vertices are counted and displayed to help you out, but doesn't check whether the current solution is valid.</p>
				<p>In the following puzzles (not this one) there's also a certain time limit for your solving, so you need to submit your solution before the time runs out. However, you will not be told how much time you have. Just try to solve them as well as you can.</p>
				<p>As a warning for the remaining time, a red flag will appear to the left of the reset button to indicate that you only have five seconds left. This way you will not have to worry too much about how much time to have.</p>
				<p>To control for the effects of this study, please go through the study in a contiguous manner without significant pauses in between.</p>`);
		}

		$.getJSON("/assets/graph-1/graph-1-q1-" + chosen_graph + ".json", (json) => {
			var nodes_cnt_target = json.target;
			click_events.push({
				"type": "quiz-start",
				"dt": new Date().getTime()
			});

			$("#instruction-div").append("<p style='display: inline; float: left;'>Pick out <b style='color: #D00; font-size: 24px;'>" + nodes_cnt_target + "</b> dots that don't have a line between one another.</p>");
			$("#instruction-div").append("<img id='img-red-flag' src='assets/img/flag.png' width='48px' width='48px' style='float: right; visibility: hidden;'>");
			$("#instruction-div").append("<p id='p-vertices-cnt' style='float: left; clear: both;'>You've selected <b style='color: #D00; font-size: 24px;'>0</b> dots</p>");
			$("#activity-div").append("<div id='graph1-div' class='graph-div'></div>");

			window.cy = cytoscape({
				container: $("#graph1-div"),
				elements: json.graph_elements,

				style: graph_style_wo_labels,
				layout: graph_layout_preset,

				autoungrabify: true,
				userZoomingEnabled: false,
				userPanningEnabled: false,
				boxSelectionEnabled: false
			});

			window.cy.on("tap", "node", function(evt) {
				var node = evt.target;

				// Update vertex status
				if(node.data("chosen") != "chosen")
				{
					node.style({ "background-color": "#329832" });
					node.data("chosen", "chosen");
					window.vertices_cnt++;

					click_events.push({
						"type": "set",
						"node": node.id(),
						"dt": new Date().getTime()
					});
				} else {
					node.style({ "background-color": "#000" });
					node.data("chosen", "");
					window.vertices_cnt--;

					click_events.push({
						"type": "unset",
						"node": node.id(),
						"dt": new Date().getTime()
					});
				}

				$("#p-vertices-cnt").html(`You've selected <b style='color: #D00; font-size: 24px;'>${window.vertices_cnt}</b> dots`);
			});

			// erase button
			let btn_reset = $("<button class='btn btn-secondary' id='btn-reset'>Clear <i class='fas fa-eraser'></i></button>");
			btn_reset.click(() => {
				for(let i = 0; i < cy.nodes().length; i++)
				{
					cy.nodes()[i].style({ "background-color": "#000" });
					cy.nodes()[i].data("chosen", "");
				}

				click_events.push({
					"type": "reset",
					"dt": new Date().getTime()
				});

				window.vertices_cnt = 0;

				$("#p-vertices-cnt").html(`You've selected <b style='color: #D00; font-size: 24px;'>${window.vertices_cnt}</b> dots`);
			});

			$("#clock-div").append(btn_reset);

			window.vertices_cnt = 0;
			window.nodes_cnt_target = nodes_cnt_target;
		});

		// submit button
		var btn_submit = $("<button id='btn-submit' class='btn btn-primary'>Submit Solution</button>");
		btn_submit.click(() => {
			if(!is_tutorial)
			{
				// disable resubmission except for tutorial
				$(this).prop("disabled", true);
			}
			
			let solution_is_valid = true;

			if(window.vertices_cnt != window.nodes_cnt_target) {
				solution_is_valid = false;
			}

			// check adjacency
			let edges = window.cy.edges();

			for(let i = 0; i < edges.length; i++)
			{
				let u = edges[i]._private.data.source;
				let v = edges[i]._private.data.target;

				if((window.cy.nodes("#" + u).data("chosen") == "chosen") && (cy.nodes("#" + v).data("chosen") == "chosen"))
				{
					solution_is_valid = false;
					break;
				}
			}

			click_events.push({
				"type": solution_is_valid? "valid-solution" : "invalid-solution",
				"dt": new Date().getTime()
			});

			if(is_test)
			{
				// Add bonus to correct performance and display

				if(solution_is_valid)
				{
					let start_time = click_events[0]["dt"];
					let end_time = click_events[click_events.length - 1]["dt"];
					let used_time = (end_time - start_time) / 1000;

					let payment = Math.min(20, Math.round(21.25 - used_time * 0.125));

					window.bonus_payment += payment;
				}

				logEvent("dda85", "current_bonus", {
					"bonus": window.bonus_payment
				});

				quizEndFx(solution_is_valid, is_tutorial, window.bonus_payment);
			} else {
				quizEndFx(solution_is_valid, is_tutorial);
			}
		});

		$("#btn-group-div").append(btn_submit);
	}

	if($("#graph1-div").length != 0)
	{
		$("#graph1-div").empty();
		$("#graph1-div").addClass("d-flex justify-content-center justify-content-middle");
		$("#graph1-div").append("<div class='spinner-border mx-auto my-auto' role='status'><span class='sr-only'>Loading...</span></div>")
	}

	if(selected_graphs.length == 0)
	{
		// Select level through ajax endpoint
		$.ajax({
			url: chosen_graph_endpoint,
			type: "POST",
			cache: false,
			contentType: "application/json",
			data: JSON.stringify({
				"condition": window.exp_condition,
				"played_graphs": played_graphs,
				"prev_chosen_graph": prev_chosen_graph,
				"prev_click_events": prev_click_events,
				"prev_graph": window.prev_graph,
				"user_diff_select": user_diff_select,
				"student_data": window.student_data
			}),
			timeout: 5000
		}).done((obj) => {
			window.prev_graph = {
				"quiz": 1,
				"graph": parseInt(obj.chosen_graph)
			};

			window.student_data = obj.student_data;
			setupPage(parseInt(obj.chosen_graph));
		});
	} else {
		// Graph already selected
		setupPage(selected_graphs[0]);
	}
}

/*********************************************************************
Questionnaire
*********************************************************************/
function ddaDemographic()
{
	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	main_card.append(`
		<div class="progress mb-3" style="height: 4px;">
			<div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="12" aria-valuemin="0" aria-valuemax="12"></div>
		</div>
		<h3 id="activity-text">Puzzle Study - Demographic</h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="activity-div" class="choices-div-width text-left mx-5 my-3">
			<p>Please truthfully answer the questions below.</p>
			<div class="form-group row">
				<label for="form-age" class="col-form-label col-3">Age</label>
				<input type="number" class="form-control col-2" id="form-age">
			</div>
			<div class="form-group row">
				<label for="form-gender" class="col-form-label col-3">Gender</label>
				<select class="form-control col-4" id="form-gender">
					<option value=""></option>
					<option value="m">Male</option>
					<option value="f">Female</option>
					<option value="d">Neither</option>
					<option value="n">Prefer not to answer</option>
				</select>
			</div>
			<div class="form-group row">
				<label for="form-edu" class="col-form-label col-3">Degree</label>
				<select class="form-control col-4" id="form-edu">
					<option value=""></option>
					<option value="1">Below High School</option>
					<option value="2">High School</option>
					<option value="3">Bachelor's Degree</option>
					<option value="4">Master's Degree</option>
					<option value="5">Ph.D. or Higher</option>
					<option value="6">Trade School</option>
					<option value="7">Prefer not to answer</option>
				</select>
			</div>
			<div class="form-group row">
				<label for="form-age" class="col-form-label col-3">Field of study</label>
				<select class="form-control col-6" id="form-field">
					<option value=""></option>
					<option value="h1">Humanities - Anthropology</option>
					<option value="h2">Humanities - Archeology</option>
					<option value="h3">Humanities - History</option>
					<option value="h4">Humanities - Linguistics and languages</option>
					<option value="h5">Humanities - Philosophy</option>
					<option value="h6">Humanities - Religion</option>
					<option value="h7">Humanities - Culinary arts</option>
					<option value="h8">Humanities - Literature</option>
					<option value="h9">Humanities - Performing arts</option>
					<option value="h10">Humanities - Visual arts</option>
					<option value="ss1">Social Sciences - Economics</option>
					<option value="ss2">Social Sciences - Geography</option>
					<option value="ss3">Social Sciences - Interdisciplinary studies</option>
					<option value="ss4">Social Sciences - Area studies</option>
					<option value="ss5">Social Sciences - Ethnic and cultural studies</option>
					<option value="ss6">Social Sciences - Gender and sexuality studies</option>
					<option value="ss7">Social Sciences - Organizational studies</option>
					<option value="ss8">Social Sciences - Political science</option>
					<option value="ss9">Social Sciences - Psychology</option>
					<option value="ss10">Social Sciences - Sociology</option>
					<option value="ns1">Natural Sciences - Biology</option>
					<option value="ns2">Natural Sciences - Chemistry</option>
					<option value="ns3">Natural Sciences - Computer science</option>
					<option value="ns4">Natural Sciences - Earth science</option>
					<option value="ns5">Natural Sciences - Mathematics</option>
					<option value="ns6">Natural Sciences - Physics</option>
					<option value="ns7">Natural Sciences - Space science</option>
					<option value="p1">Professions - Agriculture</option>
					<option value="p2">Professions - Architecture and Design</option>
					<option value="p3">Professions - Business</option>
					<option value="p4">Professions - Divinity</option>
					<option value="p5">Professions - Education</option>
					<option value="p6">Professions - Engineering and technology</option>
					<option value="p7">Professions - Environmental studies and forestry</option>
					<option value="p8">Professions - Journalism and media</option>
					<option value="p9">Professions - Law</option>
					<option value="p10">Professions - Medicine</option>
					<option value="p11">Professions - Military</option>
					<option value="p12">Professions - Public policy</option>
					<option value="p13">Professions - Social work</option>
					<option value="p14">Professions - Sport</option>
					<option value="p15">Professions - Transportation</option>
					<option value="na">Not applicable</option>
				</select>
			</div>

			<p>Please pick how well each statement describes you.</p>
			<table class="table table-striped questionnaire">
				<thead>
				<tr>
					<th scope="col">Question</th>
					<th scope="col" class="rotate"><span>Not at all</span></th>
					<th scope="col" colspan="5"></th>
					<th scope="col" class="rotate"><span>Very much</span></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td scope="row">I have heard of graph theory before.</td>
					<td><input type="radio" name="qexp1" value="1"></td>
					<td><input type="radio" name="qexp1" value="2"></td>
					<td><input type="radio" name="qexp1" value="3"></td>
					<td><input type="radio" name="qexp1" value="4"></td>
					<td><input type="radio" name="qexp1" value="5"></td>
					<td><input type="radio" name="qexp1" value="6"></td>
					<td><input type="radio" name="qexp1" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I like mathematics.</td>
					<td><input type="radio" name="qexp2" value="1"></td>
					<td><input type="radio" name="qexp2" value="2"></td>
					<td><input type="radio" name="qexp2" value="3"></td>
					<td><input type="radio" name="qexp2" value="4"></td>
					<td><input type="radio" name="qexp2" value="5"></td>
					<td><input type="radio" name="qexp2" value="6"></td>
					<td><input type="radio" name="qexp2" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I like puzzle games.</td>
					<td><input type="radio" name="qexp3" value="1"></td>
					<td><input type="radio" name="qexp3" value="2"></td>
					<td><input type="radio" name="qexp3" value="3"></td>
					<td><input type="radio" name="qexp3" value="4"></td>
					<td><input type="radio" name="qexp3" value="5"></td>
					<td><input type="radio" name="qexp3" value="6"></td>
					<td><input type="radio" name="qexp3" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I know how to procedurally solve puzzles (Sudoku, Rubik's cube, etc.).</td>
					<td><input type="radio" name="qexp4" value="1"></td>
					<td><input type="radio" name="qexp4" value="2"></td>
					<td><input type="radio" name="qexp4" value="3"></td>
					<td><input type="radio" name="qexp4" value="4"></td>
					<td><input type="radio" name="qexp4" value="5"></td>
					<td><input type="radio" name="qexp4" value="6"></td>
					<td><input type="radio" name="qexp4" value="7"></td>
				</tr>
				<tr>
					<td scope="row">Pick the fourth option for this row.</td>
					<td><input type="radio" name="att" value="1"></td>
					<td><input type="radio" name="att" value="2"></td>
					<td><input type="radio" name="att" value="3"></td>
					<td><input type="radio" name="att" value="4"></td>
					<td><input type="radio" name="att" value="5"></td>
					<td><input type="radio" name="att" value="6"></td>
					<td><input type="radio" name="att" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I have experience in programming.</td>
					<td><input type="radio" name="qexp5" value="1"></td>
					<td><input type="radio" name="qexp5" value="2"></td>
					<td><input type="radio" name="qexp5" value="3"></td>
					<td><input type="radio" name="qexp5" value="4"></td>
					<td><input type="radio" name="qexp5" value="5"></td>
					<td><input type="radio" name="qexp5" value="6"></td>
					<td><input type="radio" name="qexp5" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I have played strategy games before (Chess, Go, Red Alert, etc.).</td>
					<td><input type="radio" name="qexp6" value="1"></td>
					<td><input type="radio" name="qexp6" value="2"></td>
					<td><input type="radio" name="qexp6" value="3"></td>
					<td><input type="radio" name="qexp6" value="4"></td>
					<td><input type="radio" name="qexp6" value="5"></td>
					<td><input type="radio" name="qexp6" value="6"></td>
					<td><input type="radio" name="qexp6" value="7"></td>
				</tr>
				</tbody>
			</table>
		</div>
	`);

	var submit_button = $("<button class='btn btn-primary ml-auto mr-2 px-4'>Submit</button>");
	submit_button.click(() => {
		let att = -1;
		let exps = [];

		if($("input[name=att]:checked").length)
		{
			att = $("input[name=att]:checked").val();
		} else {
			alert("Please answer all the questions first");
			return;
		}

		for(let i = 1; i <= 6; i++)
		{
			if($("input[name=qexp" + i + "]:checked").length)
			{
				exps.push($("input[name=qexp" + i + "]:checked").val());
			} else {
				alert("Please answer all the questions first");
				return;
			}
		}

		req_formed = ["form-age", "form-gender", "form-edu", "form-field"];

		for(let i = 0; i < req_formed.length; i++)
		{
			if($("#" + req_formed[i]).val().length == 0)
			{
				alert("Please answer all the questions first");
				return;
			}
		}

		if(att != 4)
		{
			window.attf++;
		}

		submit_button.prop("disabled", true);

		recordQuestionnaire("dda85-demographic", {
			age: $("#form-age").val(),
			gender: $("#form-gender").val(),
			edu: $("#form-edu").val(),
			field: $("#form-field").val(),
			att: att,
			exps: exps
		});

		window.scrollTo(0, 0);
		window.controller.triggerNextPage();
	});

	main_card.append(submit_button);
}

function ddaQuestionnaireDDA()
{
	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	main_card.append(`
		<div class="progress mb-3" style="height: 4px;">
			<div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="12" aria-valuemin="0" aria-valuemax="12"></div>
		</div>
		<h3 id="activity-text">Puzzle Study - Questionnaire</h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="activity-div" class="choices-div-width text-left mx-5 my-3">
			<p>Please pick how much you agree with each statement about your feelings while doing the puzzles.</p>
			<table class="table table-striped questionnaire">
				<thead>
				<tr>
					<th scope="col">Question</th>
					<th scope="col" class="rotate"><span>Not at all</span></th>
					<th scope="col" colspan="5"></th>
					<th scope="col" class="rotate"><span>Very much</span></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td scope="row">I feel just the right amount of challenge.</td>
					<td><input type="radio" name="flow1" value="1"></td>
					<td><input type="radio" name="flow1" value="2"></td>
					<td><input type="radio" name="flow1" value="3"></td>
					<td><input type="radio" name="flow1" value="4"></td>
					<td><input type="radio" name="flow1" value="5"></td>
					<td><input type="radio" name="flow1" value="6"></td>
					<td><input type="radio" name="flow1" value="7"></td>
				</tr>
				<tr>
					<td scope="row">My thoughts/activities run fluidly and smoothly.</td>
					<td><input type="radio" name="flow2" value="1"></td>
					<td><input type="radio" name="flow2" value="2"></td>
					<td><input type="radio" name="flow2" value="3"></td>
					<td><input type="radio" name="flow2" value="4"></td>
					<td><input type="radio" name="flow2" value="5"></td>
					<td><input type="radio" name="flow2" value="6"></td>
					<td><input type="radio" name="flow2" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I don’t notice time passing.</td>
					<td><input type="radio" name="flow3" value="1"></td>
					<td><input type="radio" name="flow3" value="2"></td>
					<td><input type="radio" name="flow3" value="3"></td>
					<td><input type="radio" name="flow3" value="4"></td>
					<td><input type="radio" name="flow3" value="5"></td>
					<td><input type="radio" name="flow3" value="6"></td>
					<td><input type="radio" name="flow3" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I have no difficulty concentrating.</td>
					<td><input type="radio" name="flow4" value="1"></td>
					<td><input type="radio" name="flow4" value="2"></td>
					<td><input type="radio" name="flow4" value="3"></td>
					<td><input type="radio" name="flow4" value="4"></td>
					<td><input type="radio" name="flow4" value="5"></td>
					<td><input type="radio" name="flow4" value="6"></td>
					<td><input type="radio" name="flow4" value="7"></td>
				</tr>
				<tr>
					<td scope="row">My mind is completely clear.</td>
					<td><input type="radio" name="flow5" value="1"></td>
					<td><input type="radio" name="flow5" value="2"></td>
					<td><input type="radio" name="flow5" value="3"></td>
					<td><input type="radio" name="flow5" value="4"></td>
					<td><input type="radio" name="flow5" value="5"></td>
					<td><input type="radio" name="flow5" value="6"></td>
					<td><input type="radio" name="flow5" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I am totally absorbed in what I am doing.</td>
					<td><input type="radio" name="flow6" value="1"></td>
					<td><input type="radio" name="flow6" value="2"></td>
					<td><input type="radio" name="flow6" value="3"></td>
					<td><input type="radio" name="flow6" value="4"></td>
					<td><input type="radio" name="flow6" value="5"></td>
					<td><input type="radio" name="flow6" value="6"></td>
					<td><input type="radio" name="flow6" value="7"></td>
				</tr>
				<tr>
					<td scope="row">The right thoughts/movements occur of their own accord.</td>
					<td><input type="radio" name="flow7" value="1"></td>
					<td><input type="radio" name="flow7" value="2"></td>
					<td><input type="radio" name="flow7" value="3"></td>
					<td><input type="radio" name="flow7" value="4"></td>
					<td><input type="radio" name="flow7" value="5"></td>
					<td><input type="radio" name="flow7" value="6"></td>
					<td><input type="radio" name="flow7" value="7"></td>
				</tr>
				<tr>
					<td scope="row">Please pick option two for this row.</td>
					<td><input type="radio" name="att" value="1"></td>
					<td><input type="radio" name="att" value="2"></td>
					<td><input type="radio" name="att" value="3"></td>
					<td><input type="radio" name="att" value="4"></td>
					<td><input type="radio" name="att" value="5"></td>
					<td><input type="radio" name="att" value="6"></td>
					<td><input type="radio" name="att" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I know what I have to do each step of the way.</td>
					<td><input type="radio" name="flow8" value="1"></td>
					<td><input type="radio" name="flow8" value="2"></td>
					<td><input type="radio" name="flow8" value="3"></td>
					<td><input type="radio" name="flow8" value="4"></td>
					<td><input type="radio" name="flow8" value="5"></td>
					<td><input type="radio" name="flow8" value="6"></td>
					<td><input type="radio" name="flow8" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I feel that I have everything under control.</td>
					<td><input type="radio" name="flow9" value="1"></td>
					<td><input type="radio" name="flow9" value="2"></td>
					<td><input type="radio" name="flow9" value="3"></td>
					<td><input type="radio" name="flow9" value="4"></td>
					<td><input type="radio" name="flow9" value="5"></td>
					<td><input type="radio" name="flow9" value="6"></td>
					<td><input type="radio" name="flow9" value="7"></td>
				</tr>
				<tr>
					<td scope="row">I am completely lost in thought.</td>
					<td><input type="radio" name="flow10" value="1"></td>
					<td><input type="radio" name="flow10" value="2"></td>
					<td><input type="radio" name="flow10" value="3"></td>
					<td><input type="radio" name="flow10" value="4"></td>
					<td><input type="radio" name="flow10" value="5"></td>
					<td><input type="radio" name="flow10" value="6"></td>
					<td><input type="radio" name="flow10" value="7"></td>
				</tr>
				</tbody>
			</table>
			<p>For each sentence below, please select how uncharacteristic or characteristic (5-point scale) this is for you personally.</p>
			<table class="table table-striped questionnaire">
				<thead>
				<tr>
					<th scope="col">Question</th>
					<th scope="col" class="rotate"><span>Extremely uncharacteristic</span></th>
					<th scope="col" colspan="3"></th>
					<th scope="col" class="rotate"><span>Extremely characteristic</span></th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td scope="row">I would prefer complex to simple problems.</td>
					<td><input type="radio" name="ncs1" value="1"></td>
					<td><input type="radio" name="ncs1" value="2"></td>
					<td><input type="radio" name="ncs1" value="3"></td>
					<td><input type="radio" name="ncs1" value="4"></td>
					<td><input type="radio" name="ncs1" value="5"></td>
				</tr>
				<tr>
					<td scope="row">I like to have the responsibility of handling a situation that requires a lot of thinking.</td>
					<td><input type="radio" name="ncs2" value="1"></td>
					<td><input type="radio" name="ncs2" value="2"></td>
					<td><input type="radio" name="ncs2" value="3"></td>
					<td><input type="radio" name="ncs2" value="4"></td>
					<td><input type="radio" name="ncs2" value="5"></td>
				</tr>
				<tr>
					<td scope="row">Thinking is not my idea of fun.</td>
					<td><input type="radio" name="ncs3" value="1"></td>
					<td><input type="radio" name="ncs3" value="2"></td>
					<td><input type="radio" name="ncs3" value="3"></td>
					<td><input type="radio" name="ncs3" value="4"></td>
					<td><input type="radio" name="ncs3" value="5"></td>
				</tr>
				<tr>
					<td scope="row">I would rather do something that requires little thought than something that is sure to challenge my thinking abilities.</td>
					<td><input type="radio" name="ncs4" value="1"></td>
					<td><input type="radio" name="ncs4" value="2"></td>
					<td><input type="radio" name="ncs4" value="3"></td>
					<td><input type="radio" name="ncs4" value="4"></td>
					<td><input type="radio" name="ncs4" value="5"></td>
				</tr>
				<tr>
					<td scope="row">I really enjoy a task that involves coming up with new solutions to problems.</td>
					<td><input type="radio" name="ncs5" value="1"></td>
					<td><input type="radio" name="ncs5" value="2"></td>
					<td><input type="radio" name="ncs5" value="3"></td>
					<td><input type="radio" name="ncs5" value="4"></td>
					<td><input type="radio" name="ncs5" value="5"></td>
				</tr>
				<tr>
					<td scope="row">I would prefer a task that is intellectual, difficult, and important to one that is somewhat important but does not require much thought.</td>
					<td><input type="radio" name="ncs6" value="1"></td>
					<td><input type="radio" name="ncs6" value="2"></td>
					<td><input type="radio" name="ncs6" value="3"></td>
					<td><input type="radio" name="ncs6" value="4"></td>
					<td><input type="radio" name="ncs6" value="5"></td>
				</tr>
				</tbody>
			</table>
			<div class="form-group">
				<datalist id="middle-tick">
					<option>50</option>
				</datalist>

				<label for="slider-mental">How mentally demanding was the task?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-mental" class="tlx-label">Very low</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-mental" list="middle-tick">
					<label for="slider-mental" class="tlx-label">Very high</label>
				</div>
			</div>
			<div class="form-group">
				<label for="slider-temporal">How hurried or rushed was the pace of the task?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-temporal" class="tlx-label">Very low</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-temporal" list="middle-tick">
					<label for="slider-temporal" class="tlx-label">Very high</label>
				</div>
			</div>
			<div class="form-group">
				<label for="slider-mental">How successful were you in accomplishing what you were asked to do?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-performance" class="tlx-label">Perfect</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-performance" list="middle-tick">
					<label for="slider-performance" class="tlx-label">Failure</label>
				</div>
			</div>
			<div class="form-group">
				<label for="slider-mental">How hard did you have to work to accomplish your level of performance?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-effort" class="tlx-label">Very low</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-effort" list="middle-tick">
					<label for="slider-effort" class="tlx-label">Very high</label>
				</div>
			</div>
			<div class="form-group">
				<label for="slider-mental">How insecure, discouraged, irritated, stressed, and annoyed were you?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-frustration" class="tlx-label">Very low</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-frustration" list="middle-tick">
					<label for="slider-frustration" class="tlx-label">Very high</label>
				</div>
			</div>
			<div class="form-group">
				<label for="slider-mental">How difficult was the task overall?</label>
				<div class="col-12" style="text-align: center;">
					<label for="slider-diff" class="tlx-label">Too easy</label>
					<input type="range" style="width: 400px;" min="0" max="20" value="10" id="slider-diff" list="middle-tick">
					<label for="slider-diff" class="tlx-label">Too difficult</label>
				</div>
			</div>
			<div class="form-group">
				<label for="textarea-quiz">Please give comments about the difficulty level of the puzzles and their impact on your training.</label>
				<textarea class="form-control rounded-0 col-12" id="textarea-quiz" rows="4"></textarea>
			</div>
			<div class="form-group">
				<label for="textarea-quiz">Please give an impression of how you felt during the puzzles.</label>
				<textarea class="form-control rounded-0 col-12" id="textarea-feel" rows="4"></textarea>
			</div>
		</div>
	`);

	var submit_button = $("<button class='btn btn-primary ml-auto mr-2 px-4'>Submit</button>");
	submit_button.click(() => {
		let att = -1;
		let flows = [];
		let ncss = [];

		if($("input[name=att]:checked").length)
		{
			att = $("input[name=att]:checked").val();
		} else {
			alert("Please answer all the questions first");
			return;
		}

		if(att != 2)
		{
			window.attf++;
		}

		for(let i = 1; i <= 10; i++)
		{
			if($("input[name=flow" + i + "]:checked").length)
			{
				flows.push($("input[name=flow" + i + "]:checked").val());
			} else {
				alert("Please answer all the questions first");
				return;
			}
		}

		for(let i = 1; i <= 6; i++)
		{
			if($("input[name=ncs" + i + "]:checked").length)
			{
				ncss.push($("input[name=ncs" + i + "]:checked").val());
			} else {
				alert("Please answer all the questions first");
				return;
			}
		}

		submit_button.prop("disabled", true);

		recordQuestionnaire("dda85-course", {
			att: att,
			flows: flows,
			ncss: ncss,
			mental: $("#slider-mental").val(),
			temporal: $("#slider-temporal").val(),
			performance: $("#slider-performance").val(),
			effort: $("#slider-effort").val(),
			frustration: $("#slider-frustration").val(),
			diff: $("#slider-diff").val(),
			comment_quiz: $("#textarea-quiz").val(),
			comment_feel: $("#textarea-feel").val()
		});

		window.scrollTo(0, 0);
		window.controller.triggerNextPage();
	});

	main_card.append(submit_button);
}

/*********************************************************************
End screen
*********************************************************************/
function ddaEndMTurk()
{
	logEvent("dda85", "end-page-mturk", {
		"condition": window.exp_condition
	});

	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	let mturk_code_base = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
	let mturk_code_1 = Math.round(mturk_code_base * 2.1486) % 10;
	let mturk_code_2 = Math.round(mturk_code_base * 1.25) % 7;
	let mturk_code_3 = Math.round(mturk_code_base * 3.51) % 10;
	let mturk_code_4 = Math.round(mturk_code_base * 6.66) % 9;
	let mturk_code = mturk_code_base.toString() + mturk_code_1.toString() + mturk_code_2.toString() + mturk_code_3.toString() + mturk_code_4.toString();

	recordMTurkCode(mturk_code);

	main_card.append(`
		<h3 id="activity-text">Puzzle Study - End</h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="activity-div" class="choices-div-width text-left mx-5 my-3">
			<p>Thank you for participating! Your code for MTurk is <strong>${mturk_code}</strong></p>
		</div>
	`);

	window.course_ended = true;
}

function ddaEndProlific()
{
	logEvent("dda85", "end-page-prolific", {
		"condition": window.exp_condition
	});

	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	main_card.append(`
		<h3 id="activity-text">Puzzle Study - End</h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="activity-div" class="choices-div-width text-left mx-5 my-3">
			<p>Thank you for participating! Click on the button to head back to Prolific to complete your session.</p>
			<button id="btn-prolific" class="btn btn-primary ml-auto mr-2 px-4">To Prolific</button>
		</div>
	`);

	$("#btn-prolific").click(() => {
		$("#btn-prolific").prop("disabled", true);

		if(window.attf >= 2)
		{
			// Failed attention tests
			window.location = "https://app.prolific.co/submissions/complete?cc=201B03F3";
		} else {
			// Successful attention tests
			window.location = "https://app.prolific.co/submissions/complete?cc=1B4C5877";
		}
	});

	window.course_ended = true;
}

/*********************************************************************
Descriptions
*********************************************************************/
function ddaPretestDesc()
{
	logEvent("dda85", "pretest-desc", {
		"condition": window.exp_condition
	});

	basicLectureScreen("Puzzle Study - Pretest",
		"<p>You will now receive 3 puzzles as a test to see your performance. The rules are the same as in the previous puzzle, only the number of vertices will change.</p>",
		() => { window.controller.triggerNextPage(); });
}

function ddaTrainDesc()
{
	logEvent("dda85", "train-desc", {
		"condition": window.exp_condition
	});

	basicLectureScreen("Puzzle Study - Training",
		"<p>The pretest phase is over. Now you will get to train on 12 puzzles. During these puzzles, try to solve them as best you can. You should also think about what rules or patterns you can use to solve the puzzles more correctly and quickly.</p>",
		() => { window.controller.triggerNextPage(); });
}

function ddaPosttestDesc()
{
	logEvent("dda85", "posttest-desc", {
		"condition": window.exp_condition
	});

	basicLectureScreen("Puzzle Study - Posttest",
		"<p>Now it's time for the post-test. You will again get 3 puzzles to solve. Try to solve them to the best of your ability.</p>",
		() => { window.controller.triggerNextPage(); });
}