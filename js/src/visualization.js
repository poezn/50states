var VisualizationView = Marionette.ItemView.extend({

	template: "#tpl-map",

	modelEvents: {
		"change:lastUpdated": "update"
	},

	update: function() {
		console.log(this.model.toJSON())
	}
});
