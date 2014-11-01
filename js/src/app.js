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
