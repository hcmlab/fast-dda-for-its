const graph_style = [
	{
		selector: "node",
		style: {
			"background-color": "#000",
			"label": "data(id)",
			"width": "8px",
			"height": "8px"
		}
	},
	{
		selector: "edge",
		style: {
			"width": 1,
			"line-color": "#33F",
			"curve-style": "bezier"
		}
	}
];

const graph_style_wo_labels = [
	{
		selector: "node",
		style: {
			"background-color": "#000",
			"width": "8px",
			"height": "8px"
		}
	},
	{
		selector: "edge",
		style: {
			"width": 1,
			"line-color": "#33F",
			"curve-style": "bezier"
		}
	}
];

const graph_style_wo_labels_black_edges = [
	{
		selector: "node",
		style: {
			"background-color": "#000",
			"width": "8px",
			"height": "8px"
		}
	},
	{
		selector: "edge",
		style: {
			"width": 1,
			"line-color": "#000",
			"curve-style": "bezier"
		}
	}
];

const graph_style_weights = [{
	"selector": "node",
	"style": {
		"background-color": "#000",
		"font-size": 10,
		"label": "data(id)",
		"width": "8px",
		"height": "8px"
	}
},
{
	"selector": "edge",
	"style": {
		"curve-style": "bezier",
		"font-size": 10,
		"text-background-color": "#fff",
		"text-background-opacity": 1,
		"label": "data(weight)",
		"line-color": "#33F",
		"width": 1
	}
}];

const graph_layout = {
	name: "cose",
	animate: false,
	randomize: false
};

const graph_layout_preset = {
	name: "preset",
	animate: false,
	randomize: false
};

const att_graph_elements = [
	{ "data": { "id": "A"}, "position": { "x": 124, "y": 101 } },
	{ "data": { "id": "B"}, "position": { "x": 124, "y": 140 } },
	{ "data": { "id": "C"}, "position": { "x": 269, "y": 139 } },
	{ "data": { "id": "D"}, "position": { "x": 109, "y": 180 } },
	{ "data": { "id": "E"}, "position": { "x": 72, "y": 91 } },
	{ "data": { "id": "F"}, "position": { "x": 259, "y": 78 } },
	{ "data": { "id": "G"}, "position": { "x": 169, "y": 68 } },
	{ "data": { "id": "H"}, "position": { "x": 230, "y": 76 } },
	{ "data": { "id": "AB", "source": "A", "target": "B" } },
	{ "data": { "id": "AE", "source": "A", "target": "E" } },
	{ "data": { "id": "AG", "source": "A", "target": "G" } },
	{ "data": { "id": "BC", "source": "B", "target": "C" } },
	{ "data": { "id": "CF", "source": "C", "target": "F" } },
	{ "data": { "id": "CH", "source": "C", "target": "H" } },
	{ "data": { "id": "DE", "source": "D", "target": "E" } },
	{ "data": { "id": "DF", "source": "D", "target": "F" } },
	{ "data": { "id": "FH", "source": "F", "target": "H" } },
	{ "data": { "id": "GH", "source": "G", "target": "H" } }
]