//**********************************************************//
//															//
// Basic UI													//
//															//
//**********************************************************//

var total_puzzles = 19;
var current_puzzle = 0;

function basicLectureScreen(title, contents, next_fx)
{
	focus_log = [];

	window.updateVisibilityChange = (focus) => {
		focus_log.push({
			"focused": focus,
			"dt": new Date().getTime()
		});
	}

	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	let progress_width_percentage = Math.round(current_puzzle / total_puzzles * 100);

	main_card.append(`
		<div class="progress mb-3" style="height: 4px;">
			<div class="progress-bar" role="progressbar" style="width: ${progress_width_percentage}%;" aria-valuenow="${current_puzzle}" aria-valuemin="0" aria-valuemax="${total_puzzles}"></div>
		</div>
		<h3 id="activity-text"></h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="activity-div" style="margin: 3px auto;" class="choices-div-width justify-content-center"></div>
	`);

	$("#activity-text").text(title);
	$("#activity-div").html(contents);

	var next_button = $("<button class='btn btn-primary ml-auto mr-2 px-4'>Next part <i class='fas fa-arrow-right'></i></button>");
	next_button.click(() => {
		$("html, body").animate({ scrollTop: 0 }, 2);
		next_button.prop("disabled", true);
		next_fx(focus_log);
	});

	main_card.append(next_button);
}

function basicQuizScreen(title, skippable, repeatable, next_fx, time = -1, user_diff_select = false)
{
	current_puzzle++;

	focus_log = [];

	window.updateVisibilityChange = (focus) => {
		focus_log.push({
			"focused": focus,
			"dt": new Date().getTime()
		});
	}

	$(".container").empty();
	$(".container").attr("align", "center");

	var main_card = $("<div class='card col-lg-9 col-12 px-3 my-5 py-3'>");
	$(".container").append(main_card);

	let progress_width_percentage = Math.round(current_puzzle / total_puzzles * 100);

	main_card.append(`
		<div class="progress mb-3" style="height: 4px;">
			<div class="progress-bar" role="progressbar" style="width: ${progress_width_percentage}%;" aria-valuenow="${current_puzzle}" aria-valuemin="0" aria-valuemax="${total_puzzles}"></div>
		</div>
		<h3 id='activity-text'></h3>
		<hr id="hr-progress-choices" style="width: 60%; text-align: center; margin: 15px auto;">
		<div id="instruction-container-div" class="quiz-activity-div">
			<div id="instruction-row-div" class="row"></div>
		</div>
		<div id="activity-div" class="quiz-activity-div"></div>
		<div id="btn-group-div" class="btn-toolbar" style="text-align: right;"></div>

		<div class="modal fade" id="modal-quiz" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">
		  <div class="modal-dialog" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <h5 class="modal-title"></h5>
		      </div>
		      <div class="modal-body">
		      	<p id="modal-text"></p>
		      </div>
		      <div class="modal-footer"></div>
		    </div>
		  </div>
		</div>
	`);

	if(user_diff_select) {
		$(".modal-content .modal-footer").append("<button id='next-btn-inc' class='btn btn-primary mx-2 px-4 btn-block text-center btn-proceed' data-dismiss='modal'>More difficult <i class='fas fa-arrow-up'></i></button>");
		$(".modal-content .modal-footer").append("<button id='next-btn-same' class='btn btn-primary mx-2 px-4 btn-block text-center btn-proceed' data-dismiss='modal'>As difficult <i class='fas fa-equals'></i></button>");
		$(".modal-content .modal-footer").append("<button id='next-btn-dec' class='btn btn-primary mx-2 px-4 btn-block text-center btn-proceed' data-dismiss='modal'>Less difficult <i class='fas fa-arrow-down'></i></button>");
	} else {
		$(".modal-content .modal-footer").append("<button id='next-btn' class='btn btn-primary mx-2 px-4 btn-block text-center btn-proceed' data-dismiss='modal'>Next <i class='fas fa-arrow-right'></i></button>");
		$(".modal-content .modal-footer").append("<button id='retry-btn' class='btn btn-primary mx-2 px-4 btn-block text-center btn-retry' data-dismiss='modal'>Retry <i class='fas fa-redo'></i></button>");
	}

	$("#instruction-row-div").append("<div id='instruction-div' class='col-9'></div>");
	$("#instruction-row-div").append(`<div id='clock-div' class='col-3'></div>`);

	$("#activity-text").text(title);

	var puzzleTimeout = null;
	var flagTimeout = null;

	if(user_diff_select) {
		$("#modal-quiz .modal-footer #next-btn-inc").click(() => {
			$("#modal-quiz .modal-footer button").prop("disabled", true);
			$("#modal-quiz").modal("hide");

			$("html, body").animate({ scrollTop: 0 }, 2);

			setTimeout(() => { next_fx(focus_log, false, "inc") }, 150);
		});

		$("#modal-quiz .modal-footer #next-btn-same").click(() => {
			$("#modal-quiz .modal-footer button").prop("disabled", true);
			$("#modal-quiz").modal("hide");

			$("html, body").animate({ scrollTop: 0 }, 2);

			setTimeout(() => { next_fx(focus_log, false, "same") }, 150);
		});

		$("#modal-quiz .modal-footer #next-btn-dec").click(() => {
			$("#modal-quiz .modal-footer button").prop("disabled", true);
			$("#modal-quiz").modal("hide");

			$("html, body").animate({ scrollTop: 0 }, 2);

			setTimeout(() => { next_fx(focus_log, false, "dec") }, 150);
		});
	} else {
		$("#modal-quiz .modal-footer #next-btn").click(() => {
			$("#modal-quiz .modal-footer button").prop("disabled", true);
			$("#modal-quiz").modal("hide");

			$("html, body").animate({ scrollTop: 0 }, 2);

			setTimeout(() => { next_fx(focus_log, false, "") }, 150);
		});
	}

	function gameDoneCallbackFx(success, is_tutorial, bonus_payment = -1)
	{
		if(is_tutorial)
		{
			if(success != true)
			{
				$("#modal-quiz .btn-proceed").css("display", "none");
				$("#modal-quiz .btn-retry").css("display", "block");

				$("#modal-quiz .modal-title").html("Invalid <i class='fas fa-times' style='color: #F44336;'></i>");
				$("#modal-quiz .modal-body #modal-text").html("Your solution wasn't valid.");
			} else {
				$("#modal-quiz .btn-proceed").css("display", "block");
				$("#modal-quiz .btn-retry").css("display", "none");

				$("#modal-quiz .modal-title").html("Success <i class='fas fa-check' style='color: #4CAF50;'></i>");
				$("#modal-quiz .modal-body #modal-text").html("Great job, you solved the puzzle!");
			}
		} else {
			let bonus_text = (bonus_payment == -1)? "": `<br>Your current bonus payment is ${Math.floor(bonus_payment / 100)}.${String(bonus_payment % 100).padStart(2, '0')} GBP`;
			let diff_text = (user_diff_select)? "<br>How difficult should the next puzzle be?": "";

			$("#modal-quiz .btn-proceed").css("display", "block");
			$("#modal-quiz .btn-retry").css("display", "none");

			if(success == true)
			{
				$("#modal-quiz .modal-title").html("Success <i class='fas fa-check' style='color: #4CAF50;'></i>");
				$("#modal-quiz .modal-body #modal-text").html("Great job, you solved the puzzle!" + bonus_text + diff_text);
			} else if(success == "time") {
				$("#modal-quiz .modal-title").html("Timeout <i class='fas fa-hourglass-end' style='color: #F44336;'></i>");
				$("#modal-quiz .modal-body #modal-text").html("The time ran out on that puzzle." + bonus_text + diff_text);
			} else if(success == false) {
				$("#modal-quiz .modal-title").html("Invalid <i class='fas fa-times' style='color: #F44336;'></i>");
				$("#modal-quiz .modal-body #modal-text").html("Your solution wasn't valid." + bonus_text + diff_text);
			}

			clearTimeout(puzzleTimeout);
			clearTimeout(flagTimeout);
		}

		$("#modal-quiz").modal("show");
	}

	// start callback 
	if(time != -1)
	{
		flagTimeout = setTimeout(() => {
			$("#img-red-flag").css("visibility", "visible");
		}, (time - 5) * 1000);

		puzzleTimeout = setTimeout(() => {
			gameDoneCallbackFx("time");
		}, time * 1000);
	}

	return gameDoneCallbackFx;
}