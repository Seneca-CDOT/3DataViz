
// Controller

// TODO: BaseGlobeController IS NOT a view, 
// thus cannot be inheretied from 
// Backbone.View class. Instead, it HAS a 
// view, thus should contain a view (composition
// relationship). 

var BaseGlobeController = Backbone.View.extend({
	initialize: function(options) {
	}
});

var GlobeController = BaseGlobeController.extend({
	initialize: function() {
		BaseGlobeController.prototype.initialize.call(this);

		this.globeModel = new GlobeModel();
		this.globeView = new GlobeView();
	},
	loadData: function() {
		return this.globeModel.loadData();
	},
	showGlobe: function(data) {
		this.globeView.showGlobe(data);
	},
	presentGlobe: function() {
		var data = this.loadData();
		this.showGlobe(data);
	}
}); 
