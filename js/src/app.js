var App = new Marionette.Application();

App.addRegions({
	inputRegion: "#input",
	mapRegion:   "#map",
	navRegion:   "#nav"
});

App.addInitializer(function(options){

	var model = new Backbone.Model({ "mapType": "choropleth" });

	var inputView = new InputView({
		model: model
	});

	var visualizationView = new VisualizationView({
		model: model
	});

	var navigationView = new NavigationView({
		model: model
	});

	App.inputRegion.show(inputView);
	App.mapRegion.show(visualizationView);
	App.navRegion.show(navigationView);

});

$(document).ready(function() {
	App.start();
});
