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
		"keyup": "parseData"
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

		var firstStringTypeIndex, firstNumberTypeIndex;

		// get initial index for number and string
		_.each(fields, function(field, i) {
			if (_.isNull(firstStringTypeIndex) && field.type === "string") {
				firstStringTypeIndex = i;
			}
			if (_.isNull(firstNumberTypeIndex) && field.type === "number") {
				firstNumberTypeIndex = i;
			}
		});

		this.model.set({
			data: data,
			fields: fields,
			lastUpdated: new Date()
		});
	},

});