
// Controller

var BaseGlobeController = Marionette.Controller.extend({
	initialize: function(options) {
	}
});

var RootGlobeController = BaseGlobeController.extend({
	initialize: function(options) {
		BaseGlobeController.prototype.initialize.call(this, options);

		// this.globeModel = new GlobeModel();
		this.rootGlobeView = new RootGlobeView();
	},
	getRootGlobeView: function() {	
		return this.rootGlobeView;
	}
}); 
