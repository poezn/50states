var ChoroplethViz = function() {

	var width = 960, // default width
	    height = 500,
	    fieldMetric = {},
	    fieldStateId = {}; // default height

	function chart(selection) {

		var data = selection.datum();
		console.log(fieldMetric)
		var values = _.map(data, function(d) { return d.properties[fieldMetric.name] });

		var max = d3.max(values);

		var quantize = d3.scale.quantize()
		    .domain([0, max])
		    .range(d3.range(4).map(function(i) { return "q" + i + "-4"; }));

		var projection = d3.geo.albers();
		var path = d3.geo.path().projection(projection);

		selection.selectAll("path")
		.data(data)
		.enter().append("path")
		.attr({
			"class": function(d) { return "state " + quantize(d.properties[fieldMetric.name]); },
			"d": path,
			"id": function(d) { return d.id; }
		});

	}

	chart.width = function(value) {
		if (!arguments.length) return width;
		width = value;
		return chart;
	};

	chart.height = function(value) {
		if (!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.fieldStateId = function(value) {
		if (!arguments.length) return fieldStateId;
		fieldStateId = value;
		return chart;
	};

	chart.fieldMetric = function(value) {
		if (!arguments.length) return fieldMetric;
		fieldMetric = value;
		return chart;
	};

	return chart;

};

var VisualizationView = Marionette.ItemView.extend({

	template: "#tpl-map",

	modelEvents: {
		"change:lastUpdated": "update"
	},

	update: function() {
		var svg = d3.select(this.el).select("svg");

		var data = this.model.get("data");
		var fields = this.model.get("fields");
		var fieldStateId = this.model.get("fieldStateId");
		var fieldMetric = this.model.get("fieldMetric");

		var lookup = d3.map();

		_.each(data, function(d) {
			lookup.set(d[fieldStateId.name], d)
		});

		console.log(lookup, fieldStateId, fieldMetric)
		var mapData = _.map(topojson.feature(App.TOPO, App.TOPO.objects.states).features, function(feature) {
			// console.log(feature.id)
			feature.properties = lookup.get(feature.id);
			return feature;
		});

		var viz = ChoroplethViz()
		.fieldMetric(fieldMetric)
		.fieldStateId(fieldStateId);

		svg.datum(mapData).call(viz);

		console.log(this.model.toJSON())
	}
});
