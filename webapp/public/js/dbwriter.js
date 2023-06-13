const version_num = "4.3";
const db_endpoint = "/mongo";

function logEvent(page, event, args)
{
	let _survey_name = (surveying)? survey_name: "";

	$.ajax({
		type: "POST",
		data: JSON.stringify({
			"debug": debugging,
			"survey": surveying,
			"survey_name": _survey_name,
			"collection": "log",
			"payload": {
				"session_id": session_id,
				"version": version_num,
				"page": page,
				"event": event,
				"args": args
			}
		}),
		contentType: "application/json",
		url: db_endpoint
	});
}

function recordAnswer(page, answer)
{
	let _survey_name = (surveying)? survey_name: "";

	$.ajax({
		type: "POST",
		data: JSON.stringify({
			"debug": debugging,
			"survey": surveying,
			"survey_name": _survey_name,
			"collection": "answer",
			"payload": {
				"session_id": session_id,
				"version": version_num,
				"page": page,
				"answer": answer
			}
		}),
		contentType: "application/json",
		url: db_endpoint
	});
}

function recordQuestionnaire(page, answer)
{
	let _survey_name = (surveying)? survey_name: "";
	
	$.ajax({
		type: "POST",
		data: JSON.stringify({
			"debug": debugging,
			"survey": surveying,
			"survey_name": _survey_name,
			"collection": "questionnaire",
			"payload": {
				"session_id": session_id,
				"version": version_num,
				"page": page,
				"answer": answer
			}
		}),
		contentType: "application/json",
		url: db_endpoint
	});
}

function recordMTurkCode(code)
{
	let _survey_name = (surveying)? survey_name: "";

	$.ajax({
		type: "POST",
		data: JSON.stringify({
			"debug": debugging,
			"survey": surveying,
			"survey_name": _survey_name,
			"collection": "mturk_code",
			"payload": {
				"session_id": session_id,
				"version": version_num,
				"code": code
			}
		}),
		contentType: "application/json",
		url: db_endpoint
	});
}

function recordProlificCode(pid, plf_study_id, plf_session_id)
{
	let _survey_name = (surveying)? survey_name: "";

	$.ajax({
		type: "POST",
		data: JSON.stringify({
			"debug": debugging,
			"survey": surveying,
			"survey_name": _survey_name,
			"collection": "prolific_code",
			"payload": {
				"session_id": session_id,
				"version": version_num,
				"prolific_pid": pid,
				"prolific_study_id": plf_study_id,
				"prolific_session_id": plf_session_id
			}
		}),
		contentType: "application/json",
		url: db_endpoint
	});
}