var ChoroplethViz = function() {

	var width = 848, // default width
	    height = 600,
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

		var projection = d3.geo.albersUsa();
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

var RectangleMapViz = function() {

	var gridLookup = {"ME":{"row":0,"col":11},"WI":{"row":1,"col":6},"VT":{"row":1,"col":10},"NH":{"row":1,"col":11},"WA":{"row":2,"col":1},"ID":{"row":2,"col":2},"MT":{"row":2,"col":3},"ND":{"row":2,"col":4},"MN":{"row":2,"col":5},"IL":{"row":2,"col":6},"MI":{"row":2,"col":7},"NY":{"row":2,"col":9},"MA":{"row":2,"col":10},"OR":{"row":3,"col":1},"NV":{"row":3,"col":2},"WY":{"row":3,"col":3},"SD":{"row":3,"col":4},"IA":{"row":3,"col":5},"IN":{"row":3,"col":6},"OH":{"row":3,"col":7},"PA":{"row":3,"col":8},"NJ":{"row":3,"col":9},"CT":{"row":3,"col":10},"RI":{"row":3,"col":11},"CA":{"row":4,"col":1},"UT":{"row":4,"col":2},"CO":{"row":4,"col":3},"NE":{"row":4,"col":4},"MO":{"row":4,"col":5},"KY":{"row":4,"col":6},"WV":{"row":4,"col":7},"VA":{"row":4,"col":8},"MD":{"row":4,"col":9},"DE":{"row":4,"col":10},"AZ":{"row":5,"col":2},"NM":{"row":5,"col":3},"KS":{"row":5,"col":4},"AR":{"row":5,"col":5},"TN":{"row":5,"col":6},"NC":{"row":5,"col":7},"SC":{"row":5,"col":8},"DC":{"row":5,"col":9},"OK":{"row":6,"col":4},"LA":{"row":6,"col":5},"MS":{"row":6,"col":6},"AL":{"row":6,"col":7},"GA":{"row":6,"col":8},"HI":{"row":7,"col":0},"AK":{"row":7,"col":1},"TX":{"row":7,"col":4},"FL":{"row":7,"col":9}},
	    width = 848, // default width
	    height = 600,
	    fieldMetric = {},
	    fieldStateId = {},
	    w = width / 11,
	    padding = width / 165;

	w -= padding;

	function chart(selection) {

		var data = selection.datum();
		var values = _.map(data, function(d) { return d[fieldMetric.name] });

		var max = d3.max(values);

		var quantize = d3.scale.quantize()
		    .domain([0, max])
		    .range(d3.range(4).map(function(i) { return "q" + i + "-4"; }));


		var states = selection.selectAll("g")
	    .data(data)
	    .enter().append("g")
	    .attr({
			"class": function(d) { return "state " + quantize(d[fieldMetric.name]); },
			"id": function(d) { return d.id; },
	        "transform": function(d) { 
	        	console.log(d.id, gridLookup[d.id])
	            var tx = gridLookup[d.id].col * (w + padding),
	                ty = gridLookup[d.id].row * (w + padding);
	            return "translate(" + [tx, ty].join(" ") + ")"
	        }
	    });
		    
	    states.append("rect")
	    .attr({
	        "width": w,
	        "height": w,
	        "rx": w/3
	    });

	    states.append("text")
	    .attr({
	        "text-anchor": "middle",
	        "x": w/2,
	        "y": w/2 + 5
	    })
	    .text(function(d) { return d["id"] })

	}

	chart.width = function(value) {
		if (!arguments.length) return width;
		width = value;
		w = width / 11;
		padding = width/165;
		w -= padding;
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
		"change:mapType": "update",
		"change:lastUpdated": "update"
	},

	initialize: function() {
		var stateLookup = {};
		_.each(App.STATE_IDENTIFIERS, function(d) {
			var id = d[0]; 
			_.each(d.slice(1), function(d) {
				stateLookup[d] = id;
			});
		});

		this.stateLookup = stateLookup;

	},

	update: function() {
		var svg = d3.select(this.el).select("svg");

		var data = this.model.get("data");
		var fields = this.model.get("fields");
		var fieldStateId = this.model.get("fieldStateId");
		var fieldMetric = this.model.get("fieldMetric");

		var lookup = d3.map();

		var stateLookup = this.stateLookup;
		var getStateId = function(stateName) {
			return stateLookup[stateName] || null; 
		};

		_.each(data, function(d) {
			lookup.set(getStateId(d[fieldStateId.name]), d)
			lookup.set(d[fieldStateId.name], d)
		});

		svg.selectAll("*").remove();
		if (this.model.get("mapType") == "rects") {
			console.log(data)
			var mapData = _.map(data, function(d) {
				var state = {};
				state["id"] = getStateId(d[fieldStateId.name]);
				state[fieldMetric.name] = d[fieldMetric.name];
				return state;
			});

			var viz = RectangleMapViz()
			.fieldMetric(fieldMetric)
			.fieldStateId(fieldStateId);

			svg.datum(mapData).call(viz);

		} else if (this.model.get("mapType") == "choropleth") {
			var mapData = _.map(topojson.feature(App.TOPO, App.TOPO.objects.states).features, function(feature) {
				// console.log(feature.id)
				feature.properties = lookup.get(feature.id);
				return feature;
			});

			var viz = ChoroplethViz()
			.fieldMetric(fieldMetric)
			.fieldStateId(fieldStateId);

			svg.datum(mapData).call(viz);

		}

		console.log(this.model.toJSON())
	}
});
