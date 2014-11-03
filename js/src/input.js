var InputView = Marionette.ItemView.extend({
	template: "#tpl-input",

	parseConfig: {
		header: true,
		dynamicTyping: true,
		keepEmptyRows: false
	},

	ui: {
		"input": "textarea"
	},

	events: {
		"click #btn-go": "parseData"
	},

	parseData: function() {
		var text = this.ui.input.val();
		var results = Papa.parse(text, this.parseConfig);

		// data should already be formatted by PapaParse
		var data = results.data;

		var fields = _.map(results.meta.fields, function(field) {
			// get type for each field by inspecting the first element
			var type = typeof(data[0][field]);

			// check if field is an identifier (contains either state abbreviations or state names)
			if (type === "string") {
				var value = data[0][field]
				_.all(App.STATE_IDENTIFIERS, function(ids) {
					if (ids.indexOf(value) >= 0) {
						type = "stateid";
						return false;
					}
				});
			}

			return {
				"type": type,
				"name": field
			}
		});

		var fieldStateId, fieldMetric;

		// get initial index for number and string
		_.each(fields, function(field, i) {
			if (!(fieldStateId) && field.type === "stateid") {
				fieldStateId = field;
			}
			if (!(fieldMetric) && field.type === "number") {
				fieldMetric = field;
			}
		});

		this.model.set({
			data: data,
			fields: fields,
			lastUpdated: new Date(),
			fieldStateId: fieldStateId,
			fieldMetric: fieldMetric
		});
	},

});

var NavigationView = Marionette.ItemView.extend({
	template: "#tpl-nav",

	events: {
		"click li": "changeMap"
	},

	modelEvents: {
		"change:mapType": "render"
	},

	changeMap: function(ev) {
		var el = $(ev.currentTarget);
		var type = $(el).attr("data-map-type");
		this.model.set("mapType", type);
	},

	onRender: function() {
		var activeLi = this.model.get("mapType");

		d3.select(this.el).selectAll("li")
		.classed("active", function(d) {
			return d3.select(this).attr("data-map-type") === activeLi;
		})
	}
});
