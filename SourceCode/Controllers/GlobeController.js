
var GlobeController = Backbone.View.extend({
	initialize: function(options) {
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
