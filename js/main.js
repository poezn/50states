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
var VisualizationView = Marionette.ItemView.extend({

	template: "#tpl-map",

	modelEvents: {
		"change:lastUpdated": "update"
	},

	update: function() {
		console.log(this.model.toJSON())
	}
});

var App = new Marionette.Application();

App.addRegions({
	inputRegion: "#input",
	mapRegion:   "#map"
});

App.addInitializer(function(options){

	var model = new Backbone.Model();

	var inputView = new InputView({
		model: model
	});

	var visualizationView = new VisualizationView({
		model: model
	});

	App.inputRegion.show(inputView);
	App.mapRegion.show(visualizationView);

});

$(document).ready(function() {
	App.start();
});


App.STATE_IDENTIFIERS = [
	["NC", "North Carolina"],
	["AL", "Alabama"],
	["MS", "Mississippi"],
	["AR", "Arkansas"],
	["TN", "Tennessee"],
	["SC", "South Carolina"],
	["ME", "Maine"],
	["MI", "Michigan"],
	["OR", "Oregon"],
	["KY", "Kentucky"],
	["IN", "Indiana"],
	["AK", "Alaska"],
	["PA", "Pennsylvania"],
	["WI", "Wisconsin"],
	["OH", "Ohio"],
	["WA", "Washington"],
	["RI", "Rhode Island"],
	["GA", "Georgia"],
	["ID", "Idaho"],
	["WV", "West Virginia"],
	["VA", "Virginia"],
	["OK", "Oklahoma"],
	["KS", "Kansas"],
	["NM", "New Mexico"],
	["MO", "Missouri"],
	["NH", "New Hampshire"],
	["VT", "Vermont"],
	["MA", "Massachusetts"],
	["IL", "Illinois"],
	["TX", "Texas"],
	["MN", "Minnesota"],
	["CT", "Connecticut"],
	["MT", "Montana"],
	["IA", "Iowa"],
	["SD", "South Dakota"],
	["LA", "Louisiana"],
	["NJ", "New Jersey"],
	["AZ", "Arizona"],
	["WY", "Wyoming"],
	["NY", "New York"],
	["UT", "Utah"],
	["CO", "Colorado"],
	["CA", "California"],
	["NE", "Nebraska"],
	["ND", "North Dakota"],
	["DE", "Delaware"],
	["MD", "Maryland"],
	["FL", "Florida"],
	["NV", "Nevada"],
	["HI", "Hawaii"],
	["DC", "District of Columbia", "D.C."]
];

