
// Controller

var BaseGlobeController = Marionette.Controller.extend({
	initialize: function(options) {
	}
});

var GlobeController = BaseGlobeController.extend({
	initialize: function(options) {
		BaseGlobeController.prototype.initialize.call(this, options);

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
