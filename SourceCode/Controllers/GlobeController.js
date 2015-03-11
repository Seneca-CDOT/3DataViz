
// Controller

var BaseGlobeController = Marionette.Controller.extend({
	initialize: function() {
	}
});

var RootGlobeController = BaseGlobeController.extend({
	initialize: function() {
		BaseGlobeController.prototype.initialize.call(this);

		// this.globeModel = new GlobeModel();
		this.rootGlobeView = new RootGlobeView();
	},
	getRootGlobeView: function() {	
		return this.rootGlobeView;
	}
}); 
